import speakeasy from "speakeasy";
import QRCode from "qrcode";

/**
 * Generate a new TOTP secret for MFA setup
 */
export const generateMFASecret = (): string => {
  const secret = speakeasy.generateSecret({
    name: "Auth System",
    issuer: "Auth System",
    length: 32,
  });
  
  return secret.base32!;
};

/**
 * Generate QR code URL for authenticator app setup
 */
export const generateMFASecretURL = (secret: string, email: string): string => {
  const url = speakeasy.otpauthURL({
    secret: secret, // Explicitly use the provided secret
    label: email,
    issuer: "Auth System",
    algorithm: "sha1",
    digits: 6,
    period: 30,
    encoding: "base32", // Explicitly specify encoding
  });
  
  return url;
};

/**
 * Generate QR code as data URL
 */
export const generateMFASecretQRCode = async (
  secret: string,
  email: string
): Promise<string> => {
  try {
    const otpauthURL = generateMFASecretURL(secret, email);
    const qrCodeDataURL = await QRCode.toDataURL(otpauthURL, {
      errorCorrectionLevel: "M",
      type: "image/png",
      margin: 1,
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
};

/**
 * Verify TOTP code
 */
export const verifyTOTPCode = (secret: string, token: string): boolean => {
  try {
    const result = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window: 4, // Allow 4 time steps (2 minutes) for clock skew
      time: Math.floor(Date.now() / 1000), // Explicitly set current time
    });
    
    return result;
  } catch (error) {
    console.error('❌ TOTP verification error:', error);
    return false;
  }
};

/**
 * Generate backup codes for account recovery
 */
export const generateBackupCodes = (count: number = 5): string[] => {
  const codes: string[] = [];
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // Alphanumeric characters

  for (let i = 0; i < count; i++) {
    let code = "";
    for (let j = 0; j < 8; j++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    codes.push(code);
  }
  return codes;
};

/**
 * Verify backup code
 */
export const verifyBackupCode = (
  backupCodes: string[],
  code: string
): boolean => {
  return backupCodes.includes(code.toUpperCase());
};

/**
 * Remove used backup code
 */
export const removeBackupCode = (
  backupCodes: string[],
  code: string
): string[] => {
  return backupCodes.filter((c) => c !== code.toUpperCase());
};

/**
 * Format backup codes for display
 */
export const formatBackupCodes = (codes: string[]): string => {
  return codes.map((code, index) => `${index + 1}. ${code}`).join("\n");
};
