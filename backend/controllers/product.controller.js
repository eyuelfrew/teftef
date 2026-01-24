const { Product, Users } = require("../models");
const asyncHandler = require("../middlewares/asyncHandler");
const AppError = require("../utils/AppError");
const fs = require("fs");
const path = require("path");

const uploadsRoot = path.join(__dirname, "..", "public", "uploads"); // Adjust if uploads root is different

exports.getAllProducts = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: products } = await Product.findAndCountAll({
        order: [["createdAt", "ASC"]],
        limit: limit,
        offset: offset,
    });

    // Manually fetch user details since no associations are defined
    const userIds = [...new Set(products.map(p => p.userId).filter(Boolean))];
    let usersMap = {};
    if (userIds.length > 0) {
        const users = await Users.findAll({
            where: { id: userIds },
            attributes: ['id', 'first_name', 'last_name', 'email', 'profile_pic']
        });
        usersMap = users.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {});
    }

    const productsWithUsers = products.map(product => {
        const productData = product.toJSON();
        productData.user = usersMap[product.userId] || null;
        return productData;
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
        status: "success",
        results: products.length,
        pagination: {
            totalResults: count,
            totalPages,
            currentPage: page,
            limit,
        },
        data: { products: productsWithUsers },
    });
});

exports.getProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
        return next(new AppError("Product not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: { product },
    });
});

exports.createProduct = asyncHandler(async (req, res, next) => {
    const { name, description, price, discount, stock, status, category, brand, metadata, userId } = req.body;

    let parsedMetadata = {};
    if (metadata) {
        try {
            parsedMetadata = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
        } catch (e) {
            return next(new AppError("Invalid metadata format", 400));
        }
    }

    // processed images
    let imageUrls = [];

    // Create product first
    const product = await Product.create({
        name,
        description,
        price,
        discount,
        stock,
        status: status || "draft",
        category,
        brand,
        metadata: parsedMetadata,
        images: [], // Will update after moving files
        userId: userId || req.user?.id, // Use userId from body or authenticated user
    });

    if (req.files && req.files.length > 0) {
        const targetDir = path.join(uploadsRoot, "products", String(product.id));
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        req.files.forEach((file) => {
            const oldPath = file.path;
            const newFilename = path.basename(file.path);
            const newPath = path.join(targetDir, newFilename);

            fs.renameSync(oldPath, newPath);
            imageUrls.push(`/uploads/products/${product.id}/${newFilename}`);
        });

        // Update product with images
        product.images = imageUrls;
        await product.save();
    }

    res.status(201).json({
        status: "success",
        data: { product },
    });
});

exports.updateProduct = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
        return next(new AppError("Product not found", 404));
    }

    const { name, description, price, discount, stock, status, category, brand, metadata, keepImages } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (discount !== undefined) product.discount = discount;
    if (stock !== undefined) product.stock = stock;
    if (status) product.status = status;
    if (category) product.category = category;
    if (brand) product.brand = brand;

    if (metadata) {
        try {
            product.metadata = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
        } catch (e) {
            // Ignore or error? Let's ignore invalid update attempt
        }
    }

    // Handle images
    // For simplicity: If new files uploaded, append or replace?
    // Let's adopt a strategy: if 'keepImages' is sent (as JSON array of URLs), we keep those.
    // Plus new files are added.

    let currentImages = product.images || [];
    if (keepImages) {
        try {
            const kept = typeof keepImages === "string" ? JSON.parse(keepImages) : keepImages;
            // Filter currentImages to only include kept ones (basic cleanup)
            currentImages = kept;
        } catch (e) { }
    }

    if (req.files && req.files.length > 0) {
        // Files are already in the correct folder because we used ID in route?
        // Wait, update route HAS ID. So upload middleware put them in /products/:id directly!
        // We just need to add paths.

        req.files.forEach((file) => {
            // The middleware 'upload.js' constructs filename. 
            // We need to construct the URL.
            const filename = path.basename(file.path);
            currentImages.push(`/uploads/products/${id}/${filename}`);
        });
    }

    product.images = currentImages;
    await product.save();

    res.status(200).json({
        status: "success",
        data: { product },
    });
});

exports.deleteProduct = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
        return next(new AppError("Product not found", 404));
    }

    // Cleanup images
    const targetDir = path.join(uploadsRoot, "products", String(id));
    if (fs.existsSync(targetDir)) {
        fs.rmSync(targetDir, { recursive: true, force: true });
    }

    await product.destroy();

    res.status(204).json({
        status: "success",
        data: null,
    });
});
