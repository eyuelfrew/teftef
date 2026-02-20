const bcrypt = require("bcryptjs");
const { Admin } = require("../models");
const { signAdminToken, setAdminCookie, clearAdminCookie } = require("../utils/jwt");
const AppError = require("../utils/AppError");
const asyncHandler = require("../middlewares/asyncHandler");

exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError("Please provide email and password", 400));
    }

    const admin = await Admin.findOne({ where: { email } });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
        return next(new AppError("Incorrect email or password", 401));
    }

    if (admin.status !== "active") {
        return next(new AppError("Your account has been disabled", 403));
    }

    const token = signAdminToken(admin);
    setAdminCookie(res, token);

    admin.password = undefined;

    res.status(200).json({
        status: "success",
        data: { admin },
    });
});

exports.logout = (req, res) => {
    clearAdminCookie(res);
    res.status(200).json({ status: "success", message: "Logged out successfully" });
};

exports.getMe = asyncHandler(async (req, res, next) => {
    const admin = await Admin.findByPk(req.admin.id);

    if (!admin) {
        return next(new AppError("Admin no longer exists", 404));
    }

    admin.password = undefined;

    res.status(200).json({
        status: "success",
        data: { admin },
    });
});
