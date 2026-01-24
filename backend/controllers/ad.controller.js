const { Advertisement } = require("../models");
const AppError = require("../utils/AppError");
const asyncHandler = require("../middlewares/asyncHandler");
const fs = require("fs");
const path = require("path");

exports.createAd = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError("Please upload an advertisement image", 400));
    }

    const { title, ad_type, target_type, target_id, external_link, priority, is_active } = req.body;

    const image_url = `/uploads/ads/${req.file.filename}`;

    const ad = await Advertisement.create({
        title,
        ad_type,
        image_url,
        target_type,
        target_id: target_id ? String(target_id) : null,
        external_link,
        priority: priority || 0,
        is_active: is_active === "true" || is_active === true,
    });

    res.status(201).json({
        status: "success",
        data: { ad },
    });
});

exports.getAllAds = asyncHandler(async (req, res, next) => {
    const ads = await Advertisement.findAll({
        order: [["priority", "DESC"], ["createdAt", "DESC"]],
    });

    res.status(200).json({
        status: "success",
        results: ads.length,
        data: { ads },
    });
});

exports.getActiveAds = asyncHandler(async (req, res, next) => {
    const ads = await Advertisement.findAll({
        where: { is_active: true },
        order: [["priority", "DESC"], ["createdAt", "DESC"]],
    });

    res.status(200).json({
        status: "success",
        results: ads.length,
        data: { ads },
    });
});

exports.updateAd = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const ad = await Advertisement.findByPk(id);

    if (!ad) {
        return next(new AppError("Advertisement not found", 404));
    }

    // Handle Image Update
    if (req.file) {
        // Delete old image if it exists
        const oldImagePath = path.join(__dirname, "../public", ad.image_url);
        if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
        }
        ad.image_url = `/uploads/ads/${req.file.filename}`;
    }

    const { title, ad_type, target_type, target_id, external_link, priority, is_active } = req.body;

    if (title) ad.title = title;
    if (ad_type) ad.ad_type = ad_type;
    if (target_type) ad.target_type = target_type;
    // target_id can be null/empty, allowing explicit removal or update
    if (target_id !== undefined) ad.target_id = target_id ? String(target_id) : null;
    if (external_link !== undefined) ad.external_link = external_link;
    if (priority !== undefined) ad.priority = priority;
    if (is_active !== undefined) ad.is_active = is_active === "true" || is_active === true;

    await ad.save();

    res.status(200).json({
        status: "success",
        data: { ad },
    });
});

exports.deleteAd = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const ad = await Advertisement.findByPk(id);

    if (!ad) {
        return next(new AppError("Advertisement not found", 404));
    }

    // Delete image file
    const imagePath = path.join(__dirname, "../public", ad.image_url);
    if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
    }

    await ad.destroy();

    res.status(204).json({
        status: "success",
        data: null,
    });
});
