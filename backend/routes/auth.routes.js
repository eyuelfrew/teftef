const express = require("express");
const authController = require("../controllers/auth.controller");

const { requireUser } = require("../middlewares/userAuth");

const router = express.Router();

router.post("/sync-user", authController.syncUser);
router.get("/me", requireUser, authController.getMe);
router.post("/request-otp", requireUser, authController.requestOtp);
router.post("/verify-otp", requireUser, authController.verifyOtp);

module.exports = router;
