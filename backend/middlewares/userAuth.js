const { verifyToken } = require("../utils/jwt");
const { Users } = require("../models");
const AppError = require("../utils/AppError");

/**
 * User Authentication Middleware
 *
 * Verifies access tokens for protected routes.
 * Supports both cookies and Bearer tokens.
 */

/**
 * Require authenticated user
 * Verifies access token from cookie or Authorization header
 */
const requireUser = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            token = req.cookies?.user_token;
        }

        if (!token) {
            return next(new AppError("Authentication required", 401));
        }

        // Verify access token
        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (error) {
            return next(new AppError(error.message, 401));
        }

        // Ensure this is a user token
        if (decoded.role !== "user") {
            console.log("[AUTH DEBUG] Role mismatch. Received:", decoded.role, decoded);
            return next(new AppError("Unauthorized access", 403));
        }

        // Get user from database (to check if blocked)
        const user = await Users.findByPk(decoded.id);

        if (!user) {
            return next(new AppError("User not found", 404));
        }

        // Check if user is blocked or disabled
        if (user.is_blocked) {
            return next(new AppError("Your account has been blocked", 403));
        }

        if (user.status === "disabled") {
            return next(new AppError("Your account has been disabled", 403));
        }

        // Attach user to request
        req.user = {
            id: user.id,
            email: user.email,
            firebase_uid: decoded.firebase_uid,
            role: "user"
        };

        next();
    } catch (error) {
        return next(new AppError("Authentication failed", 401));
    }
};

/**
 * Require authenticated user with verified phone
 * For routes that need phone verification (e.g., creating products)
 */
const requireVerifiedUser = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            token = req.cookies?.user_token;
        }

        if (!token) {
            return next(new AppError("Authentication required", 401));
        }

        // Verify access token
        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (error) {
            return next(new AppError(error.message, 401));
        }

        // Ensure this is a user token
        if (decoded.role !== "user") {
            return next(new AppError("Unauthorized access", 403));
        }

        // Get user from database
        const user = await Users.findByPk(decoded.id);

        if (!user) {
            return next(new AppError("User not found", 404));
        }

        // Check if user is blocked or disabled
        if (user.is_blocked) {
            return next(new AppError("Your account has been blocked", 403));
        }

        if (user.status === "disabled") {
            return next(new AppError("Your account has been disabled", 403));
        }

        // Check if phone is verified
        if (!user.is_phone_verified) {
            return next(new AppError("Phone number verification required. Please verify your phone to continue.", 403));
        }

        // Attach user to request
        req.user = {
            id: user.id,
            email: user.email,
            firebase_uid: decoded.firebase_uid,
            is_phone_verified: user.is_phone_verified,
            role: "user"
        };

        next();
    } catch (error) {
        return next(new AppError("Authentication failed", 401));
    }
};

/**
 * Optional authentication
 * Attaches user to request if token is valid, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            token = req.cookies?.user_token;
        }

        if (token) {
            try {
                const decoded = verifyToken(token);
                if (decoded.role === "user") {
                    const user = await Users.findByPk(decoded.id);

                    if (user && !user.is_blocked && user.status === "active") {
                        req.user = {
                            id: user.id,
                            email: user.email,
                            firebase_uid: decoded.firebase_uid,
                            role: "user"
                        };
                    }
                }
            } catch (error) {
                // Token invalid, but that's okay for optional auth
            }
        }

        next();
    } catch (error) {
        next();
    }
};

module.exports = {
    requireUser,
    requireVerifiedUser,
    optionalAuth,
};
