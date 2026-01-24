const { CategoryAttribute } = require("../models");
const AppError = require("../utils/AppError");
const asyncHandler = require("../middlewares/asyncHandler");

exports.createAttribute = asyncHandler(async (req, res, next) => {
    const { category_id, field_label, field_type, field_options, is_required } = req.body;

    const attribute = await CategoryAttribute.create({
        category_id,
        field_label,
        field_type,
        field_options: field_options || [],
        is_required: is_required || false,
    });

    res.status(201).json({
        status: "success",
        data: { attribute },
    });
});

exports.getAttributesByCategory = asyncHandler(async (req, res, next) => {
    const { categoryId } = req.params;

    const attributes = await CategoryAttribute.findAll({
        where: { category_id: categoryId },
    });

    res.status(200).json({
        status: "success",
        results: attributes.length,
        data: { attributes },
    });
});

exports.updateAttribute = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const attribute = await CategoryAttribute.findByPk(id);

    if (!attribute) {
        return next(new AppError("Attribute not found", 404));
    }

    const { field_label, field_type, field_options, is_required } = req.body;

    if (field_label) attribute.field_label = field_label;
    if (field_type) attribute.field_type = field_type;
    if (field_options) attribute.field_options = field_options;
    if (is_required !== undefined) attribute.is_required = is_required;

    await attribute.save();

    res.status(200).json({
        status: "success",
        data: { attribute },
    });
});

exports.deleteAttribute = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const attribute = await CategoryAttribute.findByPk(id);

    if (!attribute) {
        return next(new AppError("Attribute not found", 404));
    }

    await attribute.destroy();

    res.status(204).json({
        status: "success",
        data: null,
    });
});
