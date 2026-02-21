const jwt = require("jsonwebtoken");
const crypto = require("crypto");

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
 * Sign user access token (short-lived: 15 minutes)
 */
const signUserToken = (userId) => {
    return jwt.sign(
        { id: userId, role: "user" },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
    );
};

/**
 * Sign user refresh token (long-lived: 30 days with sliding window)
 * Returns plain token (not JWT) - stored in DB
 */
const signRefreshToken = () => {
    return crypto.randomBytes(40).toString("hex");
};

/**
 * Hash refresh token for secure storage
 */
const hashRefreshToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Set user token cookie (access token)
 */
const setUserCookie = (res, token) => {
    const maxAge = 15 * 60 * 1000; // 15 minutes
    res.cookie("user_token", token, { ...getCookieOptions(), maxAge });
};

/**
 * Set refresh token cookie (separate, longer-lived)
 */
const setRefreshCookie = (res, token) => {
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    res.cookie("refresh_token", token, { 
        ...getCookieOptions(), 
        maxAge,
        httpOnly: true,
    });
};

/**
 * Clear user token cookie
 */
const clearUserCookie = (res) => {
    res.clearCookie("user_token", getCookieOptions());
    res.clearCookie("refresh_token", getCookieOptions());
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
    signRefreshToken,
    hashRefreshToken,
    setUserCookie,
    setRefreshCookie,
    clearUserCookie,
    signAdminToken,
    setAdminCookie,
    clearAdminCookie,
};
