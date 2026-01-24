const AppError = require("../utils/AppError");

// 404 handler
const notFound = (req, res, next) => {
    next(new AppError(`Route ${req.originalUrl} not found`, 404));
};

// Centralized error handler
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    if (process.env.NODE_ENV !== "production") {
        console.error(err);
    }

    res.status(statusCode).json({
        status: err.status || "error",
        message: err.message || "Internal server error",
    });
};

module.exports = { notFound, errorHandler };


