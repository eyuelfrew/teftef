const express = require("express");
const productController = require("../controllers/product.controller");
const { uploadProductImages } = require("../middlewares/upload");
const { requireAdmin } = require("../middlewares/auth");

const router = express.Router();

// Public routes (if any needed, e.g. for storefront)
// router.get("/public", productController.getPublicProducts); 

// router.use(requireAdmin); // Disabled for open API access as requested

router.route("/")
    .get(productController.getAllProducts)
    .post(uploadProductImages, productController.createProduct);

router.route("/:id")
    .get(productController.getProduct)
    .patch(uploadProductImages, productController.updateProduct)
    .delete(productController.deleteProduct);

module.exports = router;
