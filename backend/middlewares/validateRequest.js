const AppError = require("../utils/AppError");

// Simple validation middleware - accepts a validation function
const validate = (validateFn) => (req, res, next) => {
    try {
        const errors = validateFn(req);
        if (errors && errors.length > 0) {
            return next(new AppError(errors.join(", "), 400));
        }
        return next();
    } catch (error) {
        return next(new AppError(error.message || "Validation failed", 400));
    }
};

module.exports = validate;
