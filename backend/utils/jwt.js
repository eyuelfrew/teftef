const jwt = require("jsonwebtoken");

/**
 * Verify JWT access token
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error("Invalid or expired access token");
    }
};

/**
 * Get common cookie options
 */
const getCookieOptions = () => {
    const isProd = process.env.NODE_ENV === "production";
    return {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
    };
};

/**
 * Sign user token
 */
const signUserToken = (userId) => {
    return jwt.sign(
        { id: userId, role: "user" },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
};

/**
 * Set user token cookie
 */
const setUserCookie = (res, token) => {
    const maxAge = (parseInt(process.env.JWT_COOKIE_DAYS, 10) || 7) * 24 * 60 * 60 * 1000;
    res.cookie("user_token", token, { ...getCookieOptions(), maxAge });
};

/**
 * Clear user token cookie
 */
const clearUserCookie = (res) => {
    res.clearCookie("user_token", getCookieOptions());
};

/**
 * Sign admin token
 */
const signAdminToken = (admin) => {
    const payload = {
        id: admin.id,
        email: admin.email,
        role: "admin",
        is_super_admin: !!admin.is_super_admin,
    };
    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_ADMIN_EXPIRES_IN || "1d" }
    );
};

/**
 * Set admin token cookie
 */
const setAdminCookie = (res, token) => {
    const maxAge = (parseInt(process.env.JWT_ADMIN_COOKIE_DAYS, 10) || 1) * 24 * 60 * 60 * 1000;
    res.cookie("admin_token", token, { ...getCookieOptions(), maxAge });
};

/**
 * Clear admin token cookie
 */
const clearAdminCookie = (res) => {
    res.clearCookie("admin_token", getCookieOptions());
};

module.exports = {
    verifyToken,
    signUserToken,
    setUserCookie,
    clearUserCookie,
    signAdminToken,
    setAdminCookie,
    clearAdminCookie,
};
