const express = require("express");
const boostController = require("../controllers/boost.controller");
const { requireAdmin } = require("../middlewares/auth");

const router = express.Router();

router.use(requireAdmin);

// Get all active boosts
router.get("/", boostController.getActiveBoosts);

// Terminate a specific active boost by product ID
router.post("/:id/terminate", boostController.terminateBoost);

module.exports = router;
