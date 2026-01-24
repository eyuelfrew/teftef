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

module.exports = {
    verifyAccessToken,
};
