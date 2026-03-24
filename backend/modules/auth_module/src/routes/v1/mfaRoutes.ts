import { Router } from "express";
import { body } from "express-validator";
import { validate, auth, authLimiter, methodRestriction, HttpMethod } from "../../middleware";
import {
  setupMFA,
  verifyMFASetup,
  verifyMFALogin,
  disableMFA,
  generateNewBackupCodes,
  getMFAStatus,
  generateQRCode,
  getQRCode,
} from "../../controllers/mfaController";

const router = Router();

const postOnly = methodRestriction({ allowed: ["POST"] as HttpMethod[] });
const getOnly = methodRestriction({ allowed: ["GET"] as HttpMethod[] });

// MFA setup and management (requires authentication)
router.post("/setup", postOnly, auth, setupMFA, authLimiter);

// Generate QR code from secret
router.post(
  "/generate-qr",
  postOnly,
  auth,
  authLimiter,
  [
    body("secret").notEmpty().withMessage("Secret is required"),
    body("email").isEmail().withMessage("Valid email is required"),
  ],
  validate,
  generateQRCode
);

// Get QR code as image (public endpoint - GET only)
router.get("/qr/:secret/:email", getOnly, getQRCode);

router.post(
  "/verify-setup",
  postOnly,
  auth,
  authLimiter,
  [
    body("token")
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage("TOTP token must be a 6-digit number"),
  ],
  validate,
  verifyMFASetup
);

router.post(
  "/disable",
  postOnly,
  auth,
  [
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  validate,
  disableMFA
);

router.post(
  "/backup-codes",
  postOnly,
  auth,
  [
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  validate,
  generateNewBackupCodes
);

router.get("/status", getOnly, auth, getMFAStatus);

// MFA verification during login (public route - POST only)
router.post(
  "/verify-login",
  postOnly,
  authLimiter,
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("token")
      .optional()
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage("TOTP token must be a 6-digit number"),
    body("backupCode")
      .optional()
      .isLength({ min: 8, max: 8 })
      .isAlphanumeric()
      .withMessage("Backup code must be 8 alphanumeric characters"),
  ],
  validate,
  verifyMFALogin
);

export default router;
