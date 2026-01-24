const express = require("express");
const categoryController = require("../controllers/category.controller");
const { uploadCategoryImage } = require("../middlewares/upload");
const { requireAdmin } = require("../middlewares/auth");

const router = express.Router();

// Public / Semi-public
router.get("/tree", categoryController.getCategoryTree);
router.get("/", categoryController.getAllCategories); // Flat list

// Admin Protected
router.use(requireAdmin);

router.post("/", uploadCategoryImage, categoryController.createCategory);

router.route("/:id")
    .patch(uploadCategoryImage, categoryController.updateCategory)
    .delete(categoryController.deleteCategory);

module.exports = router;
