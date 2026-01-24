const rateLimit = require("express-rate-limit");

// More relaxed limits for development
const isDevelopment = process.env.NODE_ENV === "development";

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isDevelopment ? 1000 : 100, // 1000 requests in dev, 100 in production
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests from this IP, please try again later.",
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isDevelopment ? 100 : 20, // 100 requests in dev, 20 in production
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many authentication attempts, please try again later.",
});

module.exports = { apiLimiter, authLimiter };


