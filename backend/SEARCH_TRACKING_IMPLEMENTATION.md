# Search Tracking Implementation for Teftef E-commerce Platform

## Overview
This document outlines how to implement search tracking functionality to monitor and analyze the most searched products on the Teftef e-commerce platform.

## Benefits of Search Tracking
- Identify trending products and user interests
- Optimize search algorithms based on user behavior
- Improve product recommendations
- Understand seasonal trends and demand patterns
- Enhance inventory management decisions
- Personalize user experiences

## Proposed Solution

### 1. Database Schema
Create a new table to track search queries:

```sql
CREATE TABLE search_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    search_term VARCHAR(255) NOT NULL,
    user_id INT UNSIGNED NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    results_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_search_term (search_term),
    INDEX idx_created_at (created_at),
    INDEX idx_user_id (user_id)
);

CREATE TABLE popular_searches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    search_term VARCHAR(255) NOT NULL UNIQUE,
    search_count INT DEFAULT 1,
    last_searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_search_count (search_count DESC),
    INDEX idx_last_searched_at (last_searched_at)
);
```

### 2. Implementation Approach

#### A. Modify Product Controller
Update the `getAllProducts` function in `product.controller.js` to log searches:

```javascript
// In getAllProducts function, after getting search term:
if (search) {
    // Log the search
    await logSearch(search, req.user?.id, req.ip, req.get('User-Agent'), products.length);
}

// New helper function
const logSearch = async (searchTerm, userId, ipAddress, userAgent, resultsCount) => {
    try {
        // Insert into search logs
        await SearchLog.create({
            search_term: searchTerm.toLowerCase().trim(),
            user_id: userId,
            ip_address: ipAddress,
            user_agent: userAgent,
            results_count: resultsCount
        });

        // Update popular searches counter
        const [popularSearch, created] = await PopularSearch.findOrCreate({
            where: { search_term: searchTerm.toLowerCase().trim() },
            defaults: {
                search_term: searchTerm.toLowerCase().trim(),
                search_count: 1
            }
        });

        if (!created) {
            await popularSearch.increment('search_count');
        }
    } catch (error) {
        console.error('Search logging error:', error);
    }
};
```

#### B. Create Search Analytics Endpoints
Add new endpoints to retrieve search analytics:

```javascript
// In routes/search.routes.js
router.get('/analytics/popular', requireAdmin, searchController.getPopularSearches);
router.get('/analytics/trends', requireAdmin, searchController.getSearchTrends);
router.get('/analytics/recent', requireAdmin, searchController.getRecentSearches);
```

#### C. Create Search Controller
Create a new controller `search.controller.js`:

```javascript
const { SearchLog, PopularSearch, Product } = require("../models");
const { Op } = require("sequelize");
const asyncHandler = require("../middlewares/asyncHandler");
const AppError = require("../utils/AppError");

// Get top searched terms
exports.getPopularSearches = asyncHandler(async (req, res, next) => {
    const { limit = 10, period = 'all' } = req.query;
    
    let whereClause = {};
    if (period !== 'all') {
        const date = new Date();
        if (period === 'day') date.setDate(date.getDate() - 1);
        else if (period === 'week') date.setDate(date.getDate() - 7);
        else if (period === 'month') date.setMonth(date.getMonth() - 1);
        
        whereClause.created_at = { [Op.gte]: date };
    }
    
    const popularSearches = await PopularSearch.findAll({
        where: whereClause,
        order: [['search_count', 'DESC']],
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
    
    const trends = await SearchLog.findAll({
        where: {
            created_at: { [Op.gte]: startDate }
        },
        attributes: [
            [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: [sequelize.fn('DATE', sequelize.col('created_at'))],
        order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
    });

    res.status(200).json({
        status: "success",
        data: { trends }
    });
});

// Get recent searches
exports.getRecentSearches = asyncHandler(async (req, res, next) => {
    const { limit = 20 } = req.query;
    
    const recentSearches = await SearchLog.findAll({
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        include: [
            {
                model: User,
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
```

### 3. Privacy Considerations
- Anonymize IP addresses if required by privacy regulations
- Optionally allow users to opt-out of search tracking
- Implement data retention policies to automatically clean old logs
- Secure search analytics endpoints with admin authentication

### 4. Performance Optimization
- Use database indexes on frequently queried columns
- Implement caching for popular searches
- Consider using Redis for real-time search statistics
- Add search rate limiting to prevent abuse

### 5. Data Visualization
- Create admin dashboard showing search trends
- Visualize popular searches by time periods
- Show search-to-purchase conversion rates
- Identify search terms with zero results

### 6. Advanced Features
- Track search result clicks to measure relevance
- Identify search terms that yield no results
- Implement search autocomplete based on popular searches
- A/B test search algorithm improvements

## Implementation Steps
1. Create the database tables for search logging
2. Update the product controller to log searches
3. Create the search analytics controller and routes
4. Add admin interface for viewing search analytics
5. Implement data retention/cleanup jobs
6. Add privacy controls and compliance features

This implementation would provide valuable insights into user search behavior while maintaining good performance and respecting user privacy.