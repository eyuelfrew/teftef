const express = require("express");
const adminManagementController = require("../controllers/adminManagement.controller");
const { requireAdmin, requireSuperAdmin } = require("../middlewares/auth");

const router = express.Router();

// All routes here require super admin privileges
router.use(requireAdmin, requireSuperAdmin);

router
    .route("/")
    .get(adminManagementController.getAllAdmins)
    .post(adminManagementController.createAdmin);

router
    .route("/:id")
    .patch(adminManagementController.updateAdmin)
    .delete(adminManagementController.deleteAdmin);

module.exports = router;
