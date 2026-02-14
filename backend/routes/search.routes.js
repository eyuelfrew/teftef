const express = require("express");
const { getPopularSearches, getSearchTrends, getRecentSearches, getZeroResultSearches } = require("../controllers/search.controller");
const { requireAdmin } = require("../middlewares/auth");

const router = express.Router();

// Admin-only search analytics endpoints
router.get("/popular", requireAdmin, getPopularSearches);
router.get("/trends", requireAdmin, getSearchTrends);
router.get("/recent", requireAdmin, getRecentSearches);
router.get("/zero-results", requireAdmin, getZeroResultSearches);

module.exports = router;