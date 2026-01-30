const express = require("express");
const attributeController = require("../controllers/categoryAttribute.controller");
const { requireAdmin } = require("../middlewares/auth");

const router = express.Router();

// Public route to fetch attributes
router.get("/:categoryId", attributeController.getAttributesByCategory);
router.get("/category/:categoryId", attributeController.getAttributesByCategory);

// Protected routes
router.use(requireAdmin);

router.post("/", attributeController.createAttribute);
router.route("/:id")
    .patch(attributeController.updateAttribute)
    .delete(attributeController.deleteAttribute);

module.exports = router;
