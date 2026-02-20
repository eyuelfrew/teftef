const { verifyToken } = require("../utils/jwt");
const AppError = require("../utils/AppError");

const requireAdmin = (req, res, next) => {
    const token = req.cookies && req.cookies.admin_token;
    if (!token) {
        return next(new AppError("Authentication required", 401));
    }

    try {
        const decoded = verifyToken(token);

        // Ensure this is an admin token
        if (decoded.role !== "admin") {
            return next(new AppError("Unauthorized access: Admin role required", 403));
        }

        req.admin = decoded;
        return next();
    } catch (err) {
        return next(new AppError("Invalid or expired authentication token", 401));
    }
};

const requireSuperAdmin = (req, res, next) => {
    if (!req.admin || req.admin.role !== "admin" || !req.admin.is_super_admin) {
        console.log("❌ Access denied: User is not super admin", req.admin);
        return next(new AppError("Super admin privileges required", 403));
    }
    return next();
};

module.exports = {
    requireAdmin,
    requireSuperAdmin,
};


