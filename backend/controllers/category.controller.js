const { Category: RootedCategory } = require("../models");
const asyncHandler = require("../middlewares/asyncHandler");
const AppError = require("../utils/AppError");
const fs = require("fs");
const path = require("path");

// Helper to build tree
const buildTree = (categories, parentId = null) => {
    const categoryList = [];
    let categoriesToProcess;

    if (parentId === null) {
        categoriesToProcess = categories.filter(cat => cat.parentId === null);
    } else {
        categoriesToProcess = categories.filter(cat => cat.parentId === parentId);
    }

    categoriesToProcess.forEach(cat => {
        const children = buildTree(categories, cat.id);
        categoryList.push({
            ...cat.dataValues,
            children: children.length > 0 ? children : [],
        });
    });

    return categoryList;
};

exports.getCategoryTree = asyncHandler(async (req, res, next) => {
    // Fetch all active categories sorted by displayOrder or name
    const categories = await RootedCategory.findAll({
        order: [["level", "ASC"], ["name", "ASC"]], // Simple sort, precise sorting is handled by buildTree structure usually
    });

    // Build recursive tree
    const tree = buildTree(categories);

    res.status(200).json({
        status: "success",
        results: tree.length, // Root items count
        data: { categories: tree },
    });
});

exports.getAllCategories = asyncHandler(async (req, res, next) => {
    // Flat list for dropdowns if needed
    const categories = await RootedCategory.findAll({
        order: [["name", "ASC"]],
    });

    res.status(200).json({
        status: "success",
        results: categories.length,
        data: { categories },
    });
});

exports.createCategory = asyncHandler(async (req, res, next) => {
    const { name, parentId, description, color, displayOrder } = req.body;

    let level = 1; // Default Root
    let processedParentId = null;

    if (parentId) {
        const parent = await RootedCategory.findByPk(parentId);
        if (!parent) {
            return next(new AppError("Parent category not found", 404));
        }
        level = parent.level + 1;
        processedParentId = parent.id;
    }

    let image_url = null;
    if (req.file) {
        image_url = `/uploads/categories/${req.file.filename}`;
    } else if (req.body.image) {
        image_url = req.body.image;
    }

    const category = await RootedCategory.create({
        name,
        parentId: processedParentId,
        level,
        description,
        color,
        displayOrder: displayOrder || 0,
        image: image_url,
    });

    res.status(201).json({
        status: "success",
        data: { category },
    });
});

exports.updateCategory = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const category = await RootedCategory.findByPk(id);

    if (!category) {
        return next(new AppError("Category not found", 404));
    }

    const { name, parentId, description, color, displayOrder, isActive } = req.body;

    // Handle re-parenting and level updates
    if (parentId !== undefined && parentId != category.parentId) {
        // Prevent circular reference (parent cannot be itself or its own child) - simpler check: parent cannot be itself
        if (parentId == id) {
            return next(new AppError("Category cannot be its own parent", 400));
        }

        if (parentId) {
            const parent = await RootedCategory.findByPk(parentId);
            if (!parent) return next(new AppError("New parent not found", 404));
            category.level = parent.level + 1;
            category.parentId = parent.id;
        } else {
            // Moving to root
            category.level = 1;
            category.parentId = null;
        }
        // NOTE: Ideally we should recursively update children's levels if this category has children.
        // For MVP, we'll assume depth isn't changing drastically or we'll add that logic later if needed.
    }

    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (color !== undefined) category.color = color;
    if (displayOrder !== undefined) category.displayOrder = displayOrder;
    if (isActive !== undefined) category.isActive = isActive;

    if (req.file) {
        // delete old image logic could go here
        category.image = `/uploads/categories/${req.file.filename}`;
    } else if (req.body.image) {
        category.image = req.body.image;
    }

    await category.save();

    res.status(200).json({
        status: "success",
        data: { category },
    });
});

exports.deleteCategory = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const category = await RootedCategory.findByPk(id);

    if (!category) {
        return next(new AppError("Category not found", 404));
    }

    // Check for children
    const childrenRequest = await RootedCategory.count({ where: { parentId: id } });
    if (childrenRequest > 0) {
        return next(new AppError("Cannot delete category with sub-categories. Please delete/move them first.", 400));
    }

    await category.destroy();

    res.status(204).json({
        status: "success",
        data: null,
    });
});
