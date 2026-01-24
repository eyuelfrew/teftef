const bcrypt = require("bcryptjs");
const { Admin } = require("../models");
const AppError = require("../utils/AppError");
const asyncHandler = require("../middlewares/asyncHandler");

exports.getAllAdmins = asyncHandler(async (req, res, next) => {
    const admins = await Admin.findAll({
        attributes: { exclude: ["password"] },
    });

    res.status(200).json({
        status: "success",
        results: admins.length,
        data: { admins },
    });
});

exports.createAdmin = asyncHandler(async (req, res, next) => {
    const { first_name, last_name, email, password, is_super_admin } = req.body;

    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
        return next(new AppError("Email already in use", 400));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newAdmin = await Admin.create({
        first_name,
        last_name,
        email,
        password: hashedPassword,
        is_super_admin: is_super_admin || false,
    });

    newAdmin.password = undefined;

    res.status(201).json({
        status: "success",
        data: { admin: newAdmin },
    });
});

exports.updateAdmin = asyncHandler(async (req, res, next) => {
    const { first_name, last_name, email, status, is_super_admin } = req.body;

    const admin = await Admin.findByPk(req.params.id);
    if (!admin) {
        return next(new AppError("No admin found with that ID", 404));
    }

    // Prevent disabling the last super admin or self? 
    // For now simple update
    await admin.update({
        first_name,
        last_name,
        email,
        status,
        is_super_admin,
    });

    admin.password = undefined;

    res.status(200).json({
        status: "success",
        data: { admin },
    });
});

exports.deleteAdmin = asyncHandler(async (req, res, next) => {
    const admin = await Admin.findByPk(req.params.id);
    if (!admin) {
        return next(new AppError("No admin found with that ID", 404));
    }

    if (admin.is_super_admin && admin.id === req.admin.id) {
        return next(new AppError("You cannot delete yourself", 400));
    }

    await admin.destroy();

    res.status(204).json({
        status: "success",
        data: null,
    });
});
