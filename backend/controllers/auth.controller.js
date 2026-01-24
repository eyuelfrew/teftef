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
        if (phone_number && !user.phone_number) user.phone_number = phone_number;

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
                photo_url: user.profile_pic
            }
        },
    });
});
