import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { ApiError, asyncHandler } from "../middleware";
import {
  generateMFASecret,
  generateMFASecretQRCode,
  verifyTOTPCode,
  generateBackupCodes,
  verifyBackupCode,
  removeBackupCode,
  formatBackupCodes,
  generateMFASecretURL,
} from "../utils/mfaUtils";
import { comparePassword } from "../utils/passwordUtils";
import { 
  MFASetupResponse, 
  MFAVerificationRequest, 
  MFALoginVerificationRequest,
  MFADisableRequest,
  MFABackupCodesRequest,
  MFAStatusResponse
} from "../types";
import QRCode from "qrcode";
import { publishEvent } from "../utils/eventEmitter";

/**
 * Setup MFA - Generate secret only (QR code via separate endpoint)
 * POST /api/auth/mfa/setup
 */
export const setupMFA = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError("Authentication required", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // Check if MFA is already enabled
  if (user.mfaEnabled) {
    throw new ApiError("MFA is already enabled for this user", 400);
  }

  try {
    // Generate MFA secret
    const mfaSecret = generateMFASecret();
    const backupCodes = generateBackupCodes();

    // Update user with MFA secret and backup codes
    await prisma.user.update({
      where: { id: user.id },
      data: {
        mfaSecret: mfaSecret,
        mfaBackupCodes: backupCodes,
      },
    });

    // Prepare response data (without QR code to avoid routing issues)
    const responseData: MFASetupResponse = {
      message: "MFA setup initiated",
      secret: mfaSecret,
      userEmail: user.email,
      setupComplete: false,
      // QR code available via separate endpoint (versioned path)
      qrCodeEndpoint: `/api/v1/auth/mfa/qr/${encodeURIComponent(
        mfaSecret
      )}/${encodeURIComponent(user.email)}`,
    };

    // Set explicit content type and send response
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(responseData);
  } catch (error) {
    console.error("MFA setup error:", error);
    throw new ApiError("Failed to setup MFA", 500);
  }
});

/**
 * Verify MFA code during setup
 * POST /api/auth/mfa/verify-setup
 */
export const verifyMFASetup = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError("Authentication required", 401);
    }

    const { token }: MFAVerificationRequest = req.body;

    if (!token) {
      throw new ApiError("TOTP token is required", 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user || !user.mfaSecret) {
      throw new ApiError("MFA setup not initiated", 400);
    }

    // Verify the TOTP code
    console.log('🔍 MFA Setup Verification:', {
      userId: user.id,
      email: user.email,
      token,
      hasSecret: !!user.mfaSecret,
      secretLength: user.mfaSecret?.length || 0
    });
    
    const isValid = verifyTOTPCode(user.mfaSecret, token);
    console.log('🔍 TOTP Verification Result:', isValid);

    if (!isValid) {
      throw new ApiError("Invalid TOTP code", 400);
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes();

    // Enable MFA and save backup codes
    await prisma.user.update({
      where: { id: user.id },
      data: {
        mfaEnabled: true,
        mfaBackupCodes: backupCodes,
      },
    });

    // Publish MFA enabled event for SSE notification
    await publishEvent("MFA_ENABLED", { userId: user.id });

    res.json({
      message: "MFA enabled successfully",
      backupCodes: formatBackupCodes(backupCodes),
      setupComplete: true,
    });
  }
);

/**
 * Verify MFA code during login
 * POST /api/auth/mfa/verify-login
 */
export const verifyMFALogin = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, token, backupCode }: MFALoginVerificationRequest = req.body;

    if (!email) {
      throw new ApiError("Email is required", 400);
    }

    if (!token && !backupCode) {
      throw new ApiError("TOTP token or backup code is required", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.mfaEnabled) {
      throw new ApiError("MFA is not enabled for this user", 400);
    }

    let isValid = false;

    if (backupCode) {
      // Verify backup code
      isValid = verifyBackupCode(user.mfaBackupCodes, backupCode);

      if (isValid) {
        // Remove used backup code
        const updatedBackupCodes = removeBackupCode(
          user.mfaBackupCodes,
          backupCode
        );
        await prisma.user.update({
          where: { id: user.id },
          data: { mfaBackupCodes: updatedBackupCodes },
        });
      }
    } else if (token && user.mfaSecret) {
      // Verify TOTP code
      isValid = verifyTOTPCode(user.mfaSecret, token);
    }

    if (!isValid) {
      throw new ApiError("Invalid MFA code", 400);
    }

    res.json({
      message: "MFA verification successful",
      mfaVerified: true,
    });
  }
);

/**
 * Disable MFA
 * POST /api/auth/mfa/disable
 */
export const disableMFA = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError("Authentication required", 401);
  }

  const { password }: MFADisableRequest = req.body;

  if (!password) {
    throw new ApiError("Password is required to disable MFA", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user || !user.mfaEnabled) {
    throw new ApiError("MFA is not enabled", 400);
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError("Invalid password", 400);
  }

  // Disable MFA
  await prisma.user.update({
    where: { id: user.id },
    data: {
      mfaEnabled: false,
      mfaSecret: null,
      mfaBackupCodes: [],
    },
  });

  // Publish MFA disabled event for SSE notification
  await publishEvent("MFA_DISABLED", { userId: user.id });

  res.json({
    message: "MFA disabled successfully",
  });
});

/**
 * Generate new backup codes
 * POST /api/auth/mfa/backup-codes
 */
export const generateNewBackupCodes = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError("Authentication required", 401);
    }

    const { password }: MFABackupCodesRequest = req.body;

    if (!password) {
      throw new ApiError(
        "Password is required to generate new backup codes",
        400
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user || !user.mfaEnabled) {
      throw new ApiError("MFA is not enabled", 400);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError("Invalid password", 400);
    }

    // Generate new backup codes
    const backupCodes = generateBackupCodes();

    // Update user with new backup codes
    await prisma.user.update({
      where: { id: user.id },
      data: { mfaBackupCodes: backupCodes },
    });

    res.json({
      message: "New backup codes generated successfully",
      backupCodes: formatBackupCodes(backupCodes),
    });
  }
);

/**
 * Get MFA status
 * GET /api/auth/mfa/status
 */
export const getMFAStatus = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError("Authentication required", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        mfaEnabled: true,
        mfaBackupCodes: true,
      },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    const response: MFAStatusResponse = {
      mfaEnabled: user.mfaEnabled,
      backupCodesRemaining: user.mfaBackupCodes?.length || 0,
    };

    res.json(response);
  }
);


/**
 * Generate QR code from secret (separate endpoint to avoid routing issues)
 * POST /api/auth/mfa/generate-qr
 */
export const generateQRCode = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError("Authentication required", 401);
    }

    const { secret, email } = req.body;

    if (!secret || !email) {
      throw new ApiError("Secret and email are required", 400);
    }

    try {
      const qrCodeDataURL = await generateMFASecretQRCode(secret, email);

      res.setHeader("Content-Type", "application/json");
      res.status(200).json({
        qrCodeDataURL: qrCodeDataURL,
      });
    } catch (error) {
      console.error("QR code generation error:", error);
      throw new ApiError("Failed to generate QR code", 500);
    }
  }
);

/**
 * Get QR code as image blob
 * GET /api/v1/auth/mfa/qr/:secret/:email
 */
export const getQRCode = asyncHandler(async (req: Request, res: Response) => {
  const { secret, email } = req.params;

  if (!secret || !email) {
    throw new ApiError("Secret and email are required", 400);
  }

  try {
    // Generate QR code as buffer
    const otpauthURL = generateMFASecretURL(
      decodeURIComponent(secret),
      decodeURIComponent(email)
    );
    const qrCodeBuffer = await QRCode.toBuffer(otpauthURL, {
      errorCorrectionLevel: "M",
      type: "png",
      margin: 1,
    });

    // Set headers for image response
    // CORS headers are handled by global middleware, but we ensure they're set for image responses
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
    res.setHeader("Content-Length", qrCodeBuffer.length.toString());
    
    // Send the QR code as image
    // Using res.end() instead of res.send() to ensure proper header handling
    res.end(qrCodeBuffer);
  } catch (error) {
    console.error("QR code generation error:", error);
    throw new ApiError("Failed to generate QR code", 500);
  }
});

