import { Router } from "express";
import { body } from "express-validator";
import { validate } from "../../middleware";
import { auth } from "../../middleware";
import { authLimiter } from "../../middleware/rateLimiter";
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

// MFA setup and management (requires authentication)
router.post("/setup", auth, setupMFA, authLimiter);

// Generate QR code from secret (separate endpoint)
router.post(
  "/generate-qr",
  auth,
  authLimiter,
  [
    body("secret").notEmpty().withMessage("Secret is required"),
    body("email").isEmail().withMessage("Valid email is required"),
  ],
  validate,
  generateQRCode
);

// Get QR code as image (public endpoint)
router.get("/qr/:secret/:email", getQRCode);

router.post(
  "/verify-setup",
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
  auth,
  [
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  validate,
  generateNewBackupCodes
);

router.get("/status", auth, getMFAStatus);

// MFA verification during login (public route)
router.post(
  "/verify-login",
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
