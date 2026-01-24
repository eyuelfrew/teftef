const express = require("express");
const adminAuthProject = require("../controllers/adminAuth.controller");
const { requireAdmin } = require("../middlewares/auth");

const router = express.Router();

router.post("/login", adminAuthProject.login);
router.post("/logout", adminAuthProject.logout);
router.get("/me", requireAdmin, adminAuthProject.getMe);

module.exports = router;
