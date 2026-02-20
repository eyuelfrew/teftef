const express = require("express");
const boostController = require("../controllers/boost.controller");
const { requireAdmin } = require("../middlewares/auth");

const router = express.Router();

router.use(requireAdmin);

// Get all boost requests (pending)
router.get("/", boostController.getBoostRequests);

// Get boost request history (approved/rejected)
router.get("/history", (req, res, next) => {
    req.query.history = "true";
    boostController.getBoostRequests(req, res, next);
});

// Approve or reject a boost request
router.post("/:id/verify", boostController.verifyBoostRequest);

module.exports = router;
