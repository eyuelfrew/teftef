const express = require("express");
const boostController = require("../controllers/boost.controller");
const { requireAdmin } = require("../middlewares/auth");

const router = express.Router();

router.use(requireAdmin);

router.route("/")
    .get(boostController.getAllPackages)
    .post(boostController.createPackage);

router.route("/:id")
    .get(boostController.getPackage)
    .patch(boostController.updatePackage)
    .delete(boostController.deletePackage);

router.get("/requests/all", boostController.getBoostRequests);
router.post("/requests/:id/verify", boostController.verifyBoostRequest);
router.get("/users/:id", boostController.getUserInfo);
router.post("/active/:id/terminate", boostController.terminateBoost);

// Agent Routes
router.route("/agents/all")
    .get(boostController.getAllAgents);

router.route("/agents")
    .post(boostController.createAgent);

router.route("/agents/:id")
    .patch(boostController.updateAgent)
    .delete(boostController.deleteAgent);

module.exports = router;
