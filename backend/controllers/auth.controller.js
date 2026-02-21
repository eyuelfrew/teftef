const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { Users: User, RefreshToken: RefreshTokenModel } = require("../models");
const { 
    signUserToken, 
    signRefreshToken, 
    hashRefreshToken,
    setUserCookie, 
    setRefreshCookie,
    clearUserCookie 
} = require("../utils/jwt");
const AppError = require("../utils/AppError");
const asyncHandler = require("../middlewares/asyncHandler");

// Generate 6-digit OTP
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Get client IP address
 */
const getClientIp = (req) => {
    return req.ip || 
           req.headers["x-forwarded-for"]?.split(",")[0] || 
           req.connection?.remoteAddress || 
           "unknown";
};

/**
 * Get device info from user agent
 */
const getDeviceInfo = (req) => {
    const userAgent = req.headers["user-agent"] || "Unknown";
    return userAgent.substring(0, 255);
};

/**
 * Create refresh token for user
 */
const createRefreshToken = async (userId, deviceInfo, ipAddress) => {
    const refreshToken = signRefreshToken();
    const tokenHash = hashRefreshToken(refreshToken);
    
    // 30 days from now (sliding window)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    await RefreshTokenModel.create({
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt,
        device_info: deviceInfo,
        ip_address: ipAddress,
        is_revoked: false,
    });
    
    return refreshToken;
};

/**
 * Extend refresh token expiry (sliding window)
 */
const extendRefreshToken = async (tokenHash) => {
    const refreshToken = await RefreshTokenModel.findOne({
        where: { token_hash: tokenHash, is_revoked: false },
    });
    
    if (!refreshToken) {
        return null;
    }
    
    // Check if expired
    if (new Date() > refreshToken.expires_at) {
        await refreshToken.destroy();
        return null;
    }
    
    // Slide the window: extend by 30 days from NOW
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + 30);
    
    await refreshToken.update({ expires_at: newExpiry });
    
    return refreshToken;
};

/**
 * Revoke a single refresh token (logout)
 */
const revokeRefreshToken = async (tokenHash) => {
    await RefreshTokenModel.update(
        { is_revoked: true },
        { where: { token_hash: tokenHash } }
    );
};

/**
 * Revoke all refresh tokens for a user (logout all)
 */
const revokeAllUserTokens = async (userId) => {
    await RefreshTokenModel.update(
        { is_revoked: true },
        { where: { user_id: userId } }
    );
};

/**
 * Cleanup expired refresh tokens (run periodically)
 */
const cleanupExpiredTokens = async () => {
    try {
        const deleted = await RefreshTokenModel.destroy({
            where: {
                expires_at: { [require("sequelize").Op.lt]: new Date() },
            },
        });
        if (deleted > 0) {
            console.log(`🧹 Cleaned up ${deleted} expired refresh tokens`);
        }
    } catch (error) {
        console.error("❌ Refresh token cleanup failed:", error);
    }
};

// Run cleanup every 24 hours
setInterval(cleanupExpiredTokens, 24 * 60 * 60 * 1000);

// ============================================================
// LOGIN / LOGOUT
// ============================================================

exports.logout = asyncHandler(async (req, res, next) => {
    // Revoke the refresh token if provided
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
        const tokenHash = hashRefreshToken(refreshToken);
        await revokeRefreshToken(tokenHash);
    }
    
    clearUserCookie(res);
    res.status(200).json({ 
        status: "success", 
        message: "Logged out successfully" 
    });
});

exports.logoutAll = asyncHandler(async (req, res, next) => {
    const user = await Users.findByPk(req.user.id);
    if (!user) {
        return next(new AppError("User not found", 404));
    }
    
    // Revoke ALL refresh tokens for this user
    await revokeAllUserTokens(user.id);
    
    clearUserCookie(res);
    res.status(200).json({ 
        status: "success", 
        message: "Logged out from all devices successfully" 
    });
});

exports.refreshToken = asyncHandler(async (req, res, next) => {
    const refreshToken = req.cookies?.refresh_token;
    
    if (!refreshToken) {
        return next(new AppError("Refresh token required", 401));
    }
    
    const tokenHash = hashRefreshToken(refreshToken);
    
    // Find and validate refresh token
    const storedToken = await RefreshTokenModel.findOne({
        where: { token_hash: tokenHash, is_revoked: false },
        include: [{ model: Users, as: "user", attributes: ["id", "email", "is_blocked", "status"] }],
    });
    
    if (!storedToken) {
        return next(new AppError("Invalid or revoked refresh token", 401));
    }
    
    // Check expiry
    if (new Date() > storedToken.expires_at) {
        await storedToken.destroy();
        return next(new AppError("Refresh token expired. Please login again.", 401));
    }
    
    const user = storedToken.user;
    
    // Check if user is blocked or disabled
    if (user.is_blocked) {
        return next(new AppError("Your account has been blocked. Contact support.", 403));
    }
    
    if (user.status !== "active") {
        return next(new AppError("Your account has been disabled. Contact support.", 403));
    }
    
    // Extend the refresh token (sliding window)
    await extendRefreshToken(tokenHash);
    
    // Generate new access token
    const newAccessToken = signUserToken(user.id);
    
    // Set cookies
    setUserCookie(res, newAccessToken);
    // Keep the same refresh token cookie (expiry extended in DB)
    setRefreshCookie(res, refreshToken);
    
    res.status(200).json({
        status: "success",
        data: {
            access_token: newAccessToken,
            user: {
                id: user.id,
                email: user.email,
            }
        }
    });
});

exports.getActiveSessions = asyncHandler(async (req, res, next) => {
    const user = await Users.findByPk(req.user.id);
    if (!user) {
        return next(new AppError("User not found", 404));
    }
    
    const activeTokens = await RefreshTokenModel.findAll({
        where: { 
            user_id: user.id, 
            is_revoked: false,
            expires_at: { [require("sequelize").Op.gt]: new Date() }
        },
        attributes: ["id", "device_info", "ip_address", "createdAt", "expires_at"],
        order: [["createdAt", "DESC"]],
    });
    
    res.status(200).json({
        status: "success",
        data: {
            sessions: activeTokens.map(token => ({
                id: token.id,
                device: token.device_info || "Unknown Device",
                ip: token.ip_address || "Unknown",
                created_at: token.createdAt,
                expires_at: token.expires_at,
            })),
        }
    });
});

// ============================================================
// SYNC USER (SOCIAL LOGIN)
// ============================================================

exports.syncUser = asyncHandler(async (req, res, next) => {
    const { email, display_name, photo_url, phone_number, provider } = req.body;

    if (!email) {
        return next(new AppError("Email is required", 400));
    }

    let user = await User.findOne({ where: { email } });

    if (!user && phone_number) {
        user = await User.findOne({ where: { phone_number } });
        if (user && !user.email) {
            user.email = email;
        }
    }

    if (user) {
        // Security Check: Blocked or Disabled
        if (user.is_blocked) {
            return next(new AppError("Your account has been blocked. Contact support.", 403));
        }
        if (user.status !== "active") {
            return next(new AppError("Your account has been disabled. Contact support.", 403));
        }

        // Update existing user
        user.last_login_at = new Date();
        if (photo_url && !user.profile_pic) user.profile_pic = photo_url;

        if (display_name) {
            const names = display_name.split(" ");
            if (!user.first_name) user.first_name = names[0];
            if (!user.last_name && names.length > 1) user.last_name = names.slice(1).join(" ");
        }

        if (phone_number && user.phone_number !== phone_number) {
            const userWithPhone = await User.findOne({ where: { phone_number } });
            if (userWithPhone && userWithPhone.id !== user.id) {
                return next(new AppError("This phone number is already linked to another account", 400));
            }
            user.phone_number = phone_number;
            user.is_phone_verified = false;
        }

        await user.save();
    } else {
        // Create new user
        const names = display_name ? display_name.split(" ") : ["User", ""];

        let otp = null;
        let otpExpiresAt = null;

        if (phone_number) {
            otp = generateOtp();
            otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
            console.log(`[OTP] Social login verification code for ${phone_number}: ${otp}`);
        }

        user = await User.create({
            email,
            first_name: names[0],
            last_name: names.slice(1).join(" ") || "",
            profile_pic: photo_url,
            auth_provider: provider || 'google',
            last_login_at: new Date(),
            phone_number: phone_number || null,
            is_phone_verified: false,
            otp_code: otp,
            otp_expires_at: otpExpiresAt,
            status: "active"
        });
    }

    // Generate tokens
    const accessToken = signUserToken(user.id);
    const refreshToken = await createRefreshToken(
        user.id, 
        getDeviceInfo(req), 
        getClientIp(req)
    );
    
    setUserCookie(res, accessToken);
    setRefreshCookie(res, refreshToken);

    res.status(200).json({
        status: "success",
        data: {
            user_id: user.id,
            access_token: accessToken,
            requires_phone_verification: user.phone_number && !user.is_phone_verified,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                phone_number: user.phone_number,
                profile_pic: user.profile_pic,
                is_phone_verified: user.is_phone_verified,
                is_email_verified: user.is_email_verified,
                auth_provider: user.auth_provider
            }
        },
    });
});

// ============================================================
// EMAIL/PHONE + PASSWORD LOGIN
// ============================================================

exports.login = asyncHandler(async (req, res, next) => {
    const { email, phone_number, password } = req.body;

    // Validation
    if (!password) {
        return next(new AppError("Password is required", 400));
    }

    if (!email && !phone_number) {
        return next(new AppError("Email or phone number is required", 400));
    }

    // Find user by email or phone number
    let user;
    if (email) {
        user = await User.findOne({ where: { email } });
    } else if (phone_number) {
        user = await User.findOne({ where: { phone_number } });
    }

    if (!user) {
        return next(new AppError("Invalid credentials. User not found.", 401));
    }

    // Check if user has a password (social login users won't have one)
    if (!user.password) {
        return next(new AppError("This account uses social login. Please sign in with your connected account.", 401));
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        return next(new AppError("Invalid credentials. Incorrect password.", 401));
    }

    // Check if user is blocked or disabled
    if (user.is_blocked) {
        return next(new AppError("Your account has been blocked. Contact support.", 403));
    }

    if (user.status !== "active") {
        return next(new AppError("Your account has been disabled. Contact support.", 403));
    }

    // Update last login
    user.last_login_at = new Date();
    await user.save();

    // Generate tokens
    const accessToken = signUserToken(user.id);
    const refreshToken = await createRefreshToken(
        user.id, 
        getDeviceInfo(req), 
        getClientIp(req)
    );
    
    setUserCookie(res, accessToken);
    setRefreshCookie(res, refreshToken);

    res.status(200).json({
        status: "success",
        data: {
            user_id: user.id,
            access_token: accessToken,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                phone_number: user.phone_number,
                profile_pic: user.profile_pic,
                is_phone_verified: user.is_phone_verified,
                is_email_verified: user.is_email_verified,
                auth_provider: user.auth_provider
            }
        }
    });
});

// ============================================================
// OTP VERIFICATION
// ============================================================

exports.requestOtp = asyncHandler(async (req, res, next) => {
    const user = await User.findByPk(req.user.id);
    if (!user) {
        return next(new AppError("User not found", 404));
    }

    if (!user.phone_number && !req.body.phone_number) {
        return next(new AppError("Phone number is required to request OTP", 400));
    }

    const phoneNumber = req.body.phone_number || user.phone_number;

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp_code = otp;
    user.otp_expires_at = expiry;

    if (req.body.phone_number && user.phone_number !== req.body.phone_number) {
        const existingUserWithPhone = await User.findOne({ where: { phone_number: req.body.phone_number } });
        if (existingUserWithPhone && existingUserWithPhone.id !== user.id) {
            return next(new AppError("This phone number is already in use by another account", 400));
        }
        user.phone_number = req.body.phone_number;
    }

    await user.save();

    console.log(`[OTP] Verification code for user ${user.id} (${phoneNumber}): ${otp}`);

    res.status(200).json({
        status: "success",
        message: "OTP sent successfully (Check console)",
    });
});

exports.verifyOtp = asyncHandler(async (req, res, next) => {
    const { otp } = req.body;
    if (!otp) {
        return next(new AppError("OTP is required", 400));
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
        return next(new AppError("User not found", 404));
    }

    if (!user.otp_code || !user.otp_expires_at) {
        return next(new AppError("No OTP requested for this user", 400));
    }

    if (new Date() > user.otp_expires_at) {
        return next(new AppError("OTP has expired", 400));
    }

    if (user.otp_code !== otp) {
        return next(new AppError("Invalid OTP", 400));
    }

    // Success
    user.is_phone_verified = true;
    user.otp_code = null;
    user.otp_expires_at = null;
    await user.save();

    res.status(200).json({
        status: "success",
        message: "Phone number verified successfully",
        data: {
            is_phone_verified: true
        }
    });
});

exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findByPk(req.user.id);

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                phone_number: user.phone_number,
                profile_pic: user.profile_pic,
                is_phone_verified: user.is_phone_verified,
                auth_provider: user.auth_provider,
                is_blocked: user.is_blocked,
                status: user.status,
                createdAt: user.createdAt,
            }
        }
    });
});

// ============================================================
// REGISTRATION WITH PHONE OTP VERIFICATION
// ============================================================

exports.register = asyncHandler(async (req, res, next) => {
    const { first_name, last_name, email, phone_number, password } = req.body;

    // Validation
    if (!first_name || !last_name || !email || !phone_number || !password) {
        return next(new AppError("First name, last name, email, phone number, and password are required", 400));
    }

    if (password.length < 6) {
        return next(new AppError("Password must be at least 6 characters long", 400));
    }

    // Check if email already exists
    const existingUserByEmail = await User.findOne({ where: { email } });
    if (existingUserByEmail) {
        return next(new AppError("This email is already registered. Please login instead.", 400));
    }

    // Check if phone number already exists
    const existingUserByPhone = await User.findOne({ where: { phone_number } });
    if (existingUserByPhone) {
        return next(new AppError("This phone number is already registered. Please login instead.", 400));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate OTP
    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user with unverified status
    const user = await User.create({
        first_name,
        last_name,
        email,
        phone_number,
        password: hashedPassword,
        auth_provider: "email",
        is_phone_verified: false,
        otp_code: otp,
        otp_expires_at: otpExpiresAt,
        status: "active"
    });

    // Log OTP for development (in production, send via SMS)
    console.log(`[OTP] Registration verification code for ${phone_number}: ${otp}`);

    // Generate tokens
    const accessToken = signUserToken(user.id);
    const refreshToken = await createRefreshToken(
        user.id, 
        getDeviceInfo(req), 
        getClientIp(req)
    );

    setUserCookie(res, accessToken);
    setRefreshCookie(res, refreshToken);

    res.status(201).json({
        status: "success",
        message: "Registration successful. Please verify your phone number with the OTP sent.",
        data: {
            user_id: user.id,
            access_token: accessToken,
            requires_phone_verification: true,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                phone_number: user.phone_number,
                is_phone_verified: user.is_phone_verified
            }
        }
    });
});

exports.resendRegistrationOtp = asyncHandler(async (req, res, next) => {
    const user = await User.findByPk(req.user.id);

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    if (user.is_phone_verified) {
        return next(new AppError("Phone number is already verified", 400));
    }

    // Generate new OTP
    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp_code = otp;
    user.otp_expires_at = otpExpiresAt;
    await user.save();

    console.log(`[OTP] New verification code for ${user.phone_number}: ${otp}`);

    res.status(200).json({
        status: "success",
        message: "OTP resent successfully. Please check your phone.",
    });
});

exports.verifyRegistrationOtp = asyncHandler(async (req, res, next) => {
    const { otp } = req.body;

    if (!otp) {
        return next(new AppError("OTP is required", 400));
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    if (user.is_phone_verified) {
        return next(new AppError("Phone number is already verified", 400));
    }

    if (!user.otp_code || !user.otp_expires_at) {
        return next(new AppError("No OTP found. Please request a new one.", 400));
    }

    if (new Date() > user.otp_expires_at) {
        return next(new AppError("OTP has expired. Please request a new one.", 400));
    }

    if (user.otp_code !== otp) {
        return next(new AppError("Invalid OTP. Please try again.", 400));
    }

    // Success - mark phone as verified and clear OTP
    user.is_phone_verified = true;
    user.otp_code = null;
    user.otp_expires_at = null;
    user.last_login_at = new Date();
    await user.save();

    res.status(200).json({
        status: "success",
        message: "Phone verified successfully. Registration complete!",
        data: {
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                phone_number: user.phone_number,
                is_phone_verified: user.is_phone_verified
            }
        }
    });
});

exports.cancelRegistration = asyncHandler(async (req, res, next) => {
    const user = await User.findByPk(req.user.id);

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    // Only allow cancellation if phone is not verified
    if (user.is_phone_verified) {
        return next(new AppError("Cannot cancel registration - phone is already verified. Please contact support to delete your account.", 400));
    }

    await user.destroy();

    res.status(200).json({
        status: "success",
        message: "Registration cancelled successfully."
    });
});

// ============================================================
// EMAIL VERIFICATION (OTP)
// ============================================================

exports.requestEmailVerification = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    // If providing a new email
    if (email && email !== user.email) {
        const existingEmailUser = await User.findOne({ where: { email } });
        if (existingEmailUser) {
            return next(new AppError("This email is already in use by another account", 400));
        }

        user.email = email;
        user.is_email_verified = false;
    }

    if (!user.email) {
        return next(new AppError("Email address is required. Please provide it in the request body or update your profile.", 400));
    }

    if (user.is_email_verified) {
        return next(new AppError("This email address is already verified", 400));
    }

    // Generate 6-digit OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.email_otp_code = otp;
    user.email_otp_expires_at = expiresAt;
    await user.save();

    console.log(`[EMAIL OTP] Verification code for ${user.email}: ${otp}`);

    res.status(200).json({
        status: "success",
        message: "OTP sent to your email. Please check your inbox.",
        data: {
            email: user.email,
            ...(process.env.NODE_ENV !== "production" && { otp })
        }
    });
});

exports.verifyEmail = asyncHandler(async (req, res, next) => {
    const { otp } = req.body;

    if (!otp) {
        return next(new AppError("OTP is required", 400));
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    if (user.is_email_verified) {
        return next(new AppError("Email is already verified", 400));
    }

    if (!user.email_otp_code || !user.email_otp_expires_at) {
        return next(new AppError("No OTP found. Please request a new one.", 400));
    }

    const now = new Date();
    if (now > user.email_otp_expires_at) {
        user.email_otp_code = null;
        user.email_otp_expires_at = null;
        await user.save();
        return next(new AppError("OTP has expired. Please request a new one.", 400));
    }

    if (user.email_otp_code !== otp) {
        return next(new AppError("Invalid OTP. Please try again.", 400));
    }

    // Success
    user.is_email_verified = true;
    user.email_otp_code = null;
    user.email_otp_expires_at = null;
    await user.save();

    res.status(200).json({
        status: "success",
        message: "Email verified successfully!",
        data: {
            is_email_verified: true
        }
    });
});

exports.resendEmailVerification = asyncHandler(async (req, res, next) => {
    const user = await User.findByPk(req.user.id);

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    if (user.is_email_verified) {
        return next(new AppError("Email is already verified", 400));
    }

    // Generate new OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.email_otp_code = otp;
    user.email_otp_expires_at = expiresAt;
    await user.save();

    console.log(`[EMAIL OTP] New verification code for ${user.email}: ${otp}`);

    res.status(200).json({
        status: "success",
        message: "OTP resent to your email.",
        data: {
            ...(process.env.NODE_ENV !== "production" && { otp })
        }
    });
});
