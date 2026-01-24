const express = require("express");
const adController = require("../controllers/ad.controller");
const uploadAdImage = require("../middlewares/adUpload");
const { requireAdmin, requireSuperAdmin } = require("../middlewares/auth");

const router = express.Router();

// Public route for fetching active ads (Mobile/Web)
router.get("/active", adController.getActiveAds);

// Protect all other routes
router.use(requireAdmin);

router
    .route("/")
    .get(adController.getAllAds)
    .post(uploadAdImage.single("image"), adController.createAd);

router
    .route("/:id")
    .patch(uploadAdImage.single("image"), adController.updateAd)
    .delete(adController.deleteAd);

module.exports = router;
