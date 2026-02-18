const jwt = require("jsonwebtoken");
const { verifyAccessToken } = require("../utils/jwt");
const { Users } = require("../models");
const AppError = require("../utils/AppError");

/**
 * Unified Authentication Middleware
 * Allows access if either a valid User token or a valid Admin token is provided.
 */
const requireUserOrAdmin = async (req, res, next) => {
    try {
        let token;

        // Check Authorization header first (most explicit)
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        // Fallback to cookies if no header is present
        if (!token) {
            token = req.cookies?.user_token || req.cookies?.admin_token;
        }

        if (!token) {
            return next(new AppError("Authentication required", 401));
        }

        // Try verifying as a User token first
        try {
            const decoded = verifyAccessToken(token);
            const user = await Users.findByPk(decoded.id);

            if (user && !user.is_blocked && user.status !== "disabled") {
                req.user = {
                    id: user.id,
                    email: user.email,
                    firebase_uid: decoded.firebase_uid,
                };
                return next();
            }
        } catch (err) {
            // Not a valid user token, try as an admin token
        }

        // Try verifying as an Admin token
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded && decoded.id) {
                req.admin = decoded;
                return next();
            }
        } catch (err) {
            // Not a valid admin token either
        }

        return next(new AppError("Invalid or expired authentication token", 401));
    } catch (error) {
        return next(new AppError("Authentication failed", 401));
    }
};

module.exports = {
    requireUserOrAdmin
};
