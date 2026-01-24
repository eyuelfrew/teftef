const { Sponsorship } = require("../models");
const AppError = require("../utils/AppError");
const asyncHandler = require("../middlewares/asyncHandler");
const fs = require("fs");
const path = require("path");

exports.createSponsorship = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError("Please upload a banner image", 400));
    }

    const { company_name, title, external_link, priority, is_active, start_date, end_date } = req.body;

    const image_url = `/uploads/ads/${req.file.filename}`; // Reuse ad uploads folder

    const sponsorship = await Sponsorship.create({
        company_name,
        title,
        image_url,
        external_link,
        priority: priority || 0,
        is_active: is_active === "true" || is_active === true,
        start_date: start_date || null,
        end_date: end_date || null,
    });

    res.status(201).json({
        status: "success",
        data: { sponsorship },
    });
});

exports.getAllSponsorships = asyncHandler(async (req, res, next) => {
    const sponsorships = await Sponsorship.findAll({
        order: [["priority", "DESC"], ["createdAt", "DESC"]],
    });

    res.status(200).json({
        status: "success",
        results: sponsorships.length,
        data: { sponsorships },
    });
});

exports.getActiveSponsorships = asyncHandler(async (req, res, next) => {
    const sponsorships = await Sponsorship.findAll({
        where: { is_active: true },
        order: [["priority", "DESC"], ["createdAt", "DESC"]],
    });

    res.status(200).json({
        status: "success",
        results: sponsorships.length,
        data: { sponsorships },
    });
});

exports.updateSponsorship = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const sponsorship = await Sponsorship.findByPk(id);

    if (!sponsorship) {
        return next(new AppError("Sponsorship not found", 404));
    }

    // Handle Image Update
    if (req.file) {
        // Delete old image if it exists
        const oldImagePath = path.join(__dirname, "../public", sponsorship.image_url);
        if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
        }
        sponsorship.image_url = `/uploads/ads/${req.file.filename}`;
    }

    const { company_name, title, external_link, priority, is_active, start_date, end_date } = req.body;

    if (company_name) sponsorship.company_name = company_name;
    if (title) sponsorship.title = title;
    if (external_link) sponsorship.external_link = external_link;
    if (priority !== undefined) sponsorship.priority = priority;
    if (is_active !== undefined) sponsorship.is_active = is_active === "true" || is_active === true;
    if (start_date !== undefined) sponsorship.start_date = start_date;
    if (end_date !== undefined) sponsorship.end_date = end_date;

    await sponsorship.save();

    res.status(200).json({
        status: "success",
        data: { sponsorship },
    });
});

exports.deleteSponsorship = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const sponsorship = await Sponsorship.findByPk(id);

    if (!sponsorship) {
        return next(new AppError("Sponsorship not found", 404));
    }

    // Delete image file
    const imagePath = path.join(__dirname, "../public", sponsorship.image_url);
    if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
    }

    await sponsorship.destroy();

    res.status(204).json({
        status: "success",
        data: null,
    });
});
