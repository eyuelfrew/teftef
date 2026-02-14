const { SearchLog, PopularSearch, Product, Users } = require("../models");
const { Op, Sequelize } = require("sequelize");
const asyncHandler = require("../middlewares/asyncHandler");
const AppError = require("../utils/AppError");

// Log a search query
const logSearch = async (searchTerm, userId, ipAddress, userAgent, resultsCount, referrer = null) => {
    try {
        // Insert into search logs
        await SearchLog.create({
            search_term: searchTerm.toLowerCase().trim(),
            userId: userId,
            ipAddress: ipAddress,
            userAgent: userAgent,
            resultsCount: resultsCount,
            referrer: referrer
        });

        // Update popular searches counter
        const [popularSearch, created] = await PopularSearch.findOrCreate({
            where: { search_term: searchTerm.toLowerCase().trim() },
            defaults: {
                search_term: searchTerm.toLowerCase().trim(),
                searchCount: 1
            }
        });

        if (!created) {
            await popularSearch.increment('searchCount');
            await popularSearch.update({ lastSearchedAt: new Date() });
        }
    } catch (error) {
        console.error('Search logging error:', error);
    }
};

// Get top searched terms
exports.getPopularSearches = asyncHandler(async (req, res, next) => {
    const { limit = 10, period = 'all' } = req.query;
    
    let whereClause = {};
    if (period !== 'all') {
        const date = new Date();
        if (period === 'day') date.setDate(date.getDate() - 1);
        else if (period === 'week') date.setDate(date.getDate() - 7);
        else if (period === 'month') date.setMonth(date.getMonth() - 1);
        
        // Note: This simplified version doesn't filter by period in PopularSearch
        // For period-based filtering, we'd need to query SearchLog and aggregate
    }
    
    const popularSearches = await PopularSearch.findAll({
        order: [['searchCount', 'DESC']],
        limit: parseInt(limit)
    });

    res.status(200).json({
        status: "success",
        results: popularSearches.length,
        data: { popularSearches }
    });
});

// Get search trends
exports.getSearchTrends = asyncHandler(async (req, res, next) => {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Group search logs by date and count
    const results = await SearchLog.findAll({
        attributes: [
            [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        where: {
            createdAt: { [Op.gte]: startDate }
        },
        group: [Sequelize.fn('DATE', Sequelize.col('createdAt'))],
        order: [[Sequelize.fn('DATE', Sequelize.col('createdAt')), 'ASC']]
    });

    res.status(200).json({
        status: "success",
        data: { trends: results }
    });
});

// Get recent searches
exports.getRecentSearches = asyncHandler(async (req, res, next) => {
    const { limit = 20 } = req.query;
    
    const recentSearches = await SearchLog.findAll({
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        include: [
            {
                model: Users,
                as: 'user',
                attributes: ['id', 'first_name', 'last_name', 'email']
            }
        ]
    });

    res.status(200).json({
        status: "success",
        results: recentSearches.length,
        data: { recentSearches }
    });
});

// Get searches with no results
exports.getZeroResultSearches = asyncHandler(async (req, res, next) => {
    const { limit = 20 } = req.query;
    
    const zeroResultSearches = await SearchLog.findAll({
        where: { resultsCount: 0 },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        attributes: ['search_term', 'createdAt', 'ipAddress', 'userId']
    });

    res.status(200).json({
        status: "success",
        results: zeroResultSearches.length,
        data: { zeroResultSearches }
    });
});

// Log search function to be used in other controllers
exports.logSearch = logSearch;