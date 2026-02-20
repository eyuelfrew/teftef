const express = require("express");
const productController = require("../controllers/product.controller");
const { uploadProductImages } = require("../middlewares/upload");
const { requireAdmin } = require("../middlewares/auth");
const { requireUser, requireVerifiedUser, optionalAuth } = require("../middlewares/userAuth");
const { requireUserOrAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

// Public routes (if any needed, e.g. for storefront)
// router.get("/public", productController.getPublicProducts);

// router.use(requireAdmin); // Disabled for open API access as requested

router.get("/my-products", requireVerifiedUser, productController.getMyProducts);
router.get("/my-boosts", requireVerifiedUser, productController.getMyBoostHistory);

router.get("/boost-packages", productController.getBoostPackages);
router.get("/bank-account", productController.getBankAccount);
router.get("/promoted/boosted", productController.getBoostedProducts);
router.get("/actively-boosted", productController.getActiveBoostedProducts);

router.route("/")
    .get(optionalAuth, productController.getAllProducts)
    .post(requireVerifiedUser, uploadProductImages, productController.createProduct);

router.route("/:id")
    .get(optionalAuth, productController.getProduct)
    .patch(requireUserOrAdmin, uploadProductImages, productController.updateProduct)
    .delete(requireUserOrAdmin, productController.deleteProduct);

router.post("/:id/boost", requireVerifiedUser, productController.activateBoost);

router.get("/:id/poster", optionalAuth, productController.getProductPoster);

module.exports = router;
