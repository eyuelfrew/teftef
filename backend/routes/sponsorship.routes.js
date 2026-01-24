const express = require("express");
const sponsorshipController = require("../controllers/sponsorship.controller");
const uploadAdImage = require("../middlewares/adUpload");
const { requireAdmin } = require("../middlewares/auth");

const router = express.Router();

// Public route
router.get("/active", sponsorshipController.getActiveSponsorships);

// Protect routes
router.use(requireAdmin);

router
    .route("/")
    .get(sponsorshipController.getAllSponsorships)
    .post(uploadAdImage.single("image"), sponsorshipController.createSponsorship);

router
    .route("/:id")
    .patch(uploadAdImage.single("image"), sponsorshipController.updateSponsorship)
    .delete(sponsorshipController.deleteSponsorship);

module.exports = router;
