const express = require("express");
const userManagementController = require("../controllers/userManagement.controller");
const { requireAdmin } = require("../middlewares/auth");

const router = express.Router();

// All routes here require admin access
router.use(requireAdmin);

// Get specific user details
router.get("/:id", userManagementController.getUserDetails);

module.exports = router;
