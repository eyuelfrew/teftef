const express = require("express");
const authController = require("../controllers/auth.controller");

const router = express.Router();

router.post("/sync-user", authController.syncUser);

module.exports = router;
