const jwt = require("jsonwebtoken");

/**
 * Verify JWT access token
 * @param {string} token - The token to verify
 * @returns {object} - Decoded token payload
 */
const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error("Invalid or expired access token");
    }
};

/**
 * Sign user token
 * @param {number} userId - The user ID to sign
 * @returns {string} - Signed JWT token
 */
const signUserToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
};

/**
 * Get cookie options for user token
 */
const getUserCookieOptions = () => {
    const isProd = process.env.NODE_ENV === "production";
    return {
        httpOnly: true,
        secure: isProd,
        sameSite: "none",
        maxAge: (parseInt(process.env.JWT_COOKIE_DAYS, 10) || 7) * 24 * 60 * 60 * 1000,
    };
};

/**
 * Set user token cookie
 */
const setUserCookie = (res, token) => {
    const cookieOptions = getUserCookieOptions();
    res.cookie("user_token", token, cookieOptions);
};

/**
 * Clear user token cookie
 */
const clearUserCookie = (res) => {
    const cookieOptions = getUserCookieOptions();
    res.clearCookie("user_token", cookieOptions);
};

module.exports = {
    verifyAccessToken,
    signUserToken,
    setUserCookie,
    clearUserCookie,
};
