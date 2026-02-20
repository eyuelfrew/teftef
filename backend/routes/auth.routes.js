const express = require("express");
const authController = require("../controllers/auth.controller");

const { requireUser } = require("../middlewares/userAuth");

const router = express.Router();

// Public routes (no authentication required)
router.post("/register", authController.register);
router.post("/login", authController.login); // Email/phone + password login
router.post("/sync-user", authController.syncUser); // Social login (Google, etc.)

// Protected routes (authentication required)
router.get("/me", requireUser, authController.getMe);
router.post("/logout", requireUser, authController.logout);
router.post("/request-otp", requireUser, authController.requestOtp);
router.post("/verify-otp", requireUser, authController.verifyOtp);
router.post("/verify-email", requireUser, authController.verifyEmail); // Verify email with OTP

// Registration verification routes (requires auth but phone not verified)
router.post("/resend-registration-otp", requireUser, authController.resendRegistrationOtp);
router.post("/verify-registration-otp", requireUser, authController.verifyRegistrationOtp);
router.post("/cancel-registration", requireUser, authController.cancelRegistration);

// Email verification routes
router.post("/request-email-verification", requireUser, authController.requestEmailVerification);
router.post("/resend-email-verification", requireUser, authController.resendEmailVerification);

module.exports = router;
