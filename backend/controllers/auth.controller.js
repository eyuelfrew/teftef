const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Users: User } = require("../models");
const { signUserToken, setUserCookie, clearUserCookie } = require("../utils/jwt");
const AppError = require("../utils/AppError");
const asyncHandler = require("../middlewares/asyncHandler");

exports.logout = (req, res) => {
    clearUserCookie(res);
    res.status(200).json({ status: "success", message: "Logged out successfully" });
};

// Token logic moved to utils/jwt.js

// Generate 6-digit OTP
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

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
            user.is_phone_verified = false; // Reset if changed via social
        }

        await user.save();
    } else {
        // Create new user
        const names = display_name ? display_name.split(" ") : ["User", ""];

        let otp = null;
        let otpExpiresAt = null;

        // If social login provides a phone number, it still needs verification 
        // as social providers usually only vouch for the email.
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

    const accessToken = signUserToken(user.id);
    setUserCookie(res, accessToken);

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

/**
 * Login with email or phone number and password
 */
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

    // Generate token
    const accessToken = signUserToken(user.id);
    setUserCookie(res, accessToken);

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
        // Check if phone is already in use
        const existingUserWithPhone = await User.findOne({ where: { phone_number: req.body.phone_number } });
        if (existingUserWithPhone && existingUserWithPhone.id !== user.id) {
            return next(new AppError("This phone number is already in use by another account", 400));
        }
        user.phone_number = req.body.phone_number;
    }

    await user.save();

    // Log to console as requested
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

/**
 * Step 1: Register user with basic info
 * Creates a user with unverified phone, sends OTP
 */
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

    // Sign token but user is not fully verified yet
    const accessToken = signUserToken(user.id);

    // Set cookie
    setUserCookie(res, accessToken);

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

/**
 * Step 2: Resend OTP for registration verification
 * For users who didn't receive the OTP or it expired
 */
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

    // Log OTP for development
    console.log(`[OTP] New verification code for ${user.phone_number}: ${otp}`);

    res.status(200).json({
        status: "success",
        message: "OTP resent successfully. Please check your phone.",
    });
});

/**
 * Step 3: Verify OTP and complete registration
 * Activates the user account after phone verification
 */
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

/**
 * Cancel registration - for users who want to restart the process
 * Deletes unverified users
 */
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

/**
 * Request email verification OTP
 * Can be used for a new email (not yet on profile) or the existing one.
 */
exports.requestEmailVerification = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    // If providing a new email
    if (email && email !== user.email) {
        // Check if email already exists on another account
        const existingEmailUser = await User.findOne({ where: { email } });
        if (existingEmailUser) {
            return next(new AppError("This email is already in use by another account", 400));
        }

        // Update user email and set to unverified
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

    // In production, send email with OTP
    console.log(`[EMAIL OTP] Verification code for ${user.email}: ${otp}`);

    res.status(200).json({
        status: "success",
        message: "OTP sent to your email. Please check your inbox.",
        data: {
            email: user.email,
            // In development, include OTP for testing
            ...(process.env.NODE_ENV !== "production" && {
                otp: otp
            })
        }
    });
});

/**
 * Verify email with OTP
 * Verifies the OTP and marks email as verified
 */
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
    console.log(`[EMAIL VERIFY] Checking OTP for ${user.email}`);
    console.log(`[EMAIL VERIFY] Stored OTP: ${user.email_otp_code}`);
    console.log(`[EMAIL VERIFY] Submitted OTP: ${otp}`);
    console.log(`[EMAIL VERIFY] OTP expires at: ${user.email_otp_expires_at}`);
    console.log(`[EMAIL VERIFY] Current time: ${now}`);
    console.log(`[EMAIL VERIFY] Time remaining: ${user.email_otp_expires_at - now} ms`);

    if (now > user.email_otp_expires_at) {
        console.log(`[EMAIL VERIFY] ❌ OTP expired`);
        // Clear expired OTP
        user.email_otp_code = null;
        user.email_otp_expires_at = null;
        await user.save();
        return next(new AppError("OTP has expired. Please request a new one.", 400));
    }

    if (user.email_otp_code !== otp) {
        console.log(`[EMAIL VERIFY] ❌ Invalid OTP`);
        return next(new AppError("Invalid OTP. Please try again.", 400));
    }

    console.log(`[EMAIL VERIFY] ✅ Email verified successfully`);

    // Success - mark email as verified
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

/**
 * Resend email verification OTP
 * Generates and sends a new OTP
 */
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

    // In production, send email with OTP
    console.log(`[EMAIL OTP] New verification code for ${user.email}: ${otp}`);

    res.status(200).json({
        status: "success",
        message: "OTP resent to your email.",
        data: {
            // In development, include OTP for testing
            ...(process.env.NODE_ENV !== "production" && {
                otp: otp
            })
        }
    });
});
