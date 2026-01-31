const jwt = require("jsonwebtoken");
const { Users: User } = require("../models");
const AppError = require("../utils/AppError");
const asyncHandler = require("../middlewares/asyncHandler");

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "90d",
    });
};

exports.syncUser = asyncHandler(async (req, res, next) => {
    const { email, display_name, photo_url, phone_number, provider, id_token } = req.body;

    if (!email) {
        return next(new AppError("Email is required", 400));
    }

    let user = await User.findOne({ where: { email } });

    if (!user && phone_number) {
        // Try finding by phone number if email didn't match
        user = await User.findOne({ where: { phone_number } });

        // If we found a user by phone number but the email is different (or missing on the user),
        // we might want to update the email or handle it. 
        // For this logic, let's assume if found by phone, it's the same person.
        if (user && !user.email) {
            user.email = email;
        }
    }

    if (user) {
        // Update existing user
        user.last_login_at = new Date();
        if (photo_url) user.profile_pic = photo_url;
        if (display_name) {
            const names = display_name.split(" ");
            if (!user.first_name) user.first_name = names[0];
            if (!user.last_name && names.length > 1) user.last_name = names.slice(1).join(" ");
        }
        if (phone_number && user.phone_number !== phone_number) {
            // Check if another user already has this phone number
            const userWithPhone = await User.findOne({ where: { phone_number } });
            if (userWithPhone && userWithPhone.id !== user.id) {
                return next(new AppError("This phone number is already linked to another account", 400));
            }
            user.phone_number = phone_number;
        }

        await user.save();
    } else {
        // Create new user
        const names = display_name ? display_name.split(" ") : ["User", ""];
        user = await User.create({
            email,
            first_name: names[0],
            last_name: names.slice(1).join(" ") || "",
            profile_pic: photo_url,
            auth_provider: provider || 'google',
            last_login_at: new Date(),
            phone_number: phone_number || null
        });
    }

    const accessToken = signToken(user.id);

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
                photo_url: user.profile_pic,
                is_phone_verified: user.is_phone_verified
            }
        },
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
