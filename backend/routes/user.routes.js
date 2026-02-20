const express = require("express");
const boostController = require("../controllers/boost.controller");
const { requireAdmin } = require("../middlewares/auth");

const router = express.Router();

router.use(requireAdmin);

// Helper endpoint to view user details related to a boost request
router.get("/:id", boostController.getUserInfo);

module.exports = router;
