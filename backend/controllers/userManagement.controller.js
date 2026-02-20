const { Users } = require("../models");
const AppError = require("../utils/AppError");
const asyncHandler = require("../middlewares/asyncHandler");

/**
 * Get detailed information about a specific user for administrative purposes.
 */
exports.getUserDetails = asyncHandler(async (req, res, next) => {
    const user = await Users.findByPk(req.params.id, {
        attributes: [
            "id",
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "profile_pic",
            "status",
            "is_phone_verified",
            "is_email_verified",
            "is_blocked",
            "last_login_at",
            "createdAt"
        ]
    });

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: { user }
    });
});
