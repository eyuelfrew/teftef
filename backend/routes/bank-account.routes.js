const express = require("express");
const boostController = require("../controllers/boost.controller");
const { requireAdmin } = require("../middlewares/auth");

const router = express.Router();

router.use(requireAdmin);

router.route("/")
    .get(boostController.getBankAccount)
    .post(boostController.createBankAccount);

router.route("/:id")
    .patch(boostController.updateBankAccount)
    .delete(boostController.deleteBankAccount);

module.exports = router;
