const express = require("express");
const productController = require("../controllers/product.controller");
const { uploadProductImages } = require("../middlewares/upload");
const { requireAdmin } = require("../middlewares/auth");
const { requireUser, optionalAuth } = require("../middlewares/userAuth");

const router = express.Router();

// Public routes (if any needed, e.g. for storefront)
// router.get("/public", productController.getPublicProducts); 

// router.use(requireAdmin); // Disabled for open API access as requested

router.route("/")
    .get(optionalAuth, productController.getAllProducts)
    .post(requireUser, uploadProductImages, productController.createProduct);

router.route("/:id")
    .get(optionalAuth, productController.getProduct)
    .patch(requireUser, uploadProductImages, productController.updateProduct)
    .delete(requireUser, productController.deleteProduct);

router.get("/:id/poster", optionalAuth, productController.getProductPoster);

module.exports = router;
