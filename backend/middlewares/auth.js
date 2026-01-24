const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

const getCookieOptions = () => {
    const isProd = process.env.NODE_ENV === "production";

    return {
        httpOnly: true,
        secure: isProd, // secure cookies in production (HTTPS)
        sameSite: isProd ? "strict" : "lax",
        // maxAge will be set when we set the cookie
    };
};

const signAdminToken = (admin) => {
    const payload = {
        id: admin.id,
        email: admin.email,
        is_super_admin: admin.is_super_admin,
    };

    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || "1d";

    return jwt.sign(payload, secret, { expiresIn });
};

const setAdminCookie = (res, token) => {
    const cookieOptions = getCookieOptions();
    const maxAgeMs = (parseInt(process.env.JWT_COOKIE_DAYS, 10) || 1) * 24 * 60 * 60 * 1000;

    res.cookie("admin_token", token, {
        ...cookieOptions,
        maxAge: maxAgeMs,
    });
};

const clearAdminCookie = (res) => {
    const cookieOptions = getCookieOptions();
    res.clearCookie("admin_token", cookieOptions);
};

const requireAdmin = (req, res, next) => {
    const token = req.cookies && req.cookies.admin_token;
    if (!token) {
        return next(new AppError("Authentication required", 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        return next();
    } catch (err) {
        return next(new AppError("Invalid or expired authentication token", 401));
    }
};

const requireSuperAdmin = (req, res, next) => {
    // console.log("Checking Super Admin privileges for:", req.admin);
    if (!req.admin || !req.admin.is_super_admin) {
        console.log("❌ Access denied: User is not super admin", req.admin);
        return next(new AppError("Super admin privileges required", 403));
    }
    return next();
};

module.exports = {
    signAdminToken,
    setAdminCookie,
    clearAdminCookie,
    requireAdmin,
    requireSuperAdmin,
};


