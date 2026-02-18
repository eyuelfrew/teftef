const { Product, Category, Users, BoostPackage, BoostRequest, PaymentAgent, ActiveBoost, SearchLog, PopularSearch } = require("../models");
const { Op } = require("sequelize");
const fs = require('fs');
const path = require('path');
const asyncHandler = require("../middlewares/asyncHandler");
const AppError = require("../utils/AppError");
const { logSearch } = require("../controllers/search.controller");

exports.getAllProducts = asyncHandler(async (req, res, next) => {
    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const queryOptions = {
        where: {},
        include: [
            { model: Users, as: "user", attributes: ["id", "first_name", "last_name", "email", "profile_pic", "phone_number"] }
        ],
        order: [
            ["isBoosted", "DESC"],
            ["createdAt", "DESC"]
        ],
        limit: limitNum,
        offset: offset,
    };

    if (search) {
        queryOptions.where.name = { [Op.like]: `%${search}%` };
    }

    if (category) {
        queryOptions.where.category = category;
    }

    if (minPrice || maxPrice) {
        queryOptions.where.price = {};
        if (minPrice) queryOptions.where.price[Op.gte] = minPrice;
        if (maxPrice) queryOptions.where.price[Op.lte] = maxPrice;
    }

    const { count, rows } = await Product.findAndCountAll(queryOptions);

    // Log the search if a search term was provided
    if (search) {
        await logSearch(
            search,
            req.user?.id,
            req.ip,
            req.get('User-Agent'),
            rows.length,
            req.get('Referer')
        );
    }

    res.status(200).json({
        status: "success",
        results: rows.length,
        pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(count / limitNum),
            totalResults: count,
            limit: limitNum
        },
        data: { products: rows }
    });
});

exports.getMyProducts = asyncHandler(async (req, res, next) => {
    const products = await Product.findAll({
        where: { userId: req.user.id },
        include: [
            {
                model: BoostRequest,
                as: "boostRequests",
                limit: 1,
                order: [["createdAt", "DESC"]],
                separate: true
            }
        ],
        order: [["createdAt", "DESC"]]
    });

    const productsWithStatus = products.map(product => {
        const plainProduct = product.get({ plain: true });
        let boostStatus = 'none';

        if (plainProduct.isBoosted) {
            boostStatus = 'active';
        } else {
            const hasPending = (plainProduct.boostRequests || []).some(r => r.status === 'pending');
            if (hasPending) boostStatus = 'pending';
        }

        return { ...plainProduct, boostStatus };
    });
    console.log(productsWithStatus);
    res.status(200).json({
        status: "success",
        results: products.length,
        data: { products: productsWithStatus }
    });
});

exports.getProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findByPk(req.params.id, {
        include: [
            { model: Users, as: "user", attributes: ["id", "first_name", "last_name", "email", "profile_pic", "phone_number"] },
            {
                model: BoostRequest,
                as: "boostRequests",
                // Only show boost request status to the owner
                where: req.user ? { userId: req.user.id } : { id: 0 },
                required: false,
                limit: 1,
                order: [["createdAt", "DESC"]],
                separate: true
            }
        ]
    });

    if (!product) {
        return next(new AppError("Product not found", 404));
    }

    const plainProduct = product.get({ plain: true });
    let boostStatus = 'none';

    // Only calculate status if user exists (owner check)
    if (req.user && plainProduct.userId === req.user.id) {
        if (plainProduct.isBoosted) {
            boostStatus = 'active';
        } else {
            const hasPending = (plainProduct.boostRequests || []).some(r => r.status === 'pending');
            if (hasPending) boostStatus = 'pending';
        }
    }

    res.status(200).json({
        status: "success",
        data: { product: { ...plainProduct, boostStatus } }
    });
});

exports.createProduct = asyncHandler(async (req, res, next) => {
    const { name, description, price, category, brand, metadata } = req.body;

    // Handle images from middleware - files are stored in temp directory for new products
    let images = [];
    if (req.files && req.files.length > 0) {
        // Move files from temp directory to product-specific directory after getting product ID
        // For now, we'll store the temporary paths and the moving will happen after product creation
        images = req.files.map(file => {
            // Check if file is in temp directory, if so, adjust path accordingly
            if (file.path.includes('/temp/')) {
                // For new products, files are temporarily in the temp directory
                return `/uploads/products/temp/${file.filename}`;
            } else {
                return `/uploads/products/${file.filename}`;
            }
        });
    }

    const product = await Product.create({
        name,
        description,
        price,
        category,
        brand,
        metadata: typeof metadata === 'string' ? JSON.parse(metadata) : metadata,
        images,
        userId: req.user.id,
        status: "active"
    });

    // After product creation, we should move temp files to product-specific directory
    if (req.files && req.files.length > 0) {

        // Create product-specific directory
        const productDir = path.join(__dirname, '..', 'public', 'uploads', 'products', String(product.id));
        if (!fs.existsSync(productDir)) {
            fs.mkdirSync(productDir, { recursive: true });
        }

        // Move files from temp to product directory
        const newImages = [];
        for (const file of req.files) {
            const tempFilePath = file.path;
            const fileName = path.basename(tempFilePath);
            const newFilePath = path.join(productDir, fileName);

            // Move the file
            fs.renameSync(tempFilePath, newFilePath);

            // Update the image path in the database
            newImages.push(`/uploads/products/${product.id}/${fileName}`);
        }

        // Update the product with the new image paths
        await product.update({ images: newImages });
    }

    res.status(201).json({
        status: "success",
        data: { product }
    });
});

exports.updateProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
        return next(new AppError("Product not found", 404));
    }

    // Check ownership or admin
    if (product.userId !== req.user?.id && !req.admin) {
        return next(new AppError("Unauthorized", 403));
    }

    const { name, description, price, category, brand, metadata, status } = req.body;

    if (req.files && req.files.length > 0) {

        // Create product-specific directory if it doesn't exist
        const productDir = path.join(__dirname, '..', 'public', 'uploads', 'products', String(product.id));
        if (!fs.existsSync(productDir)) {
            fs.mkdirSync(productDir, { recursive: true });
        }

        // Move files from temp to product directory (if they were uploaded to temp)
        const newImages = [];
        for (const file of req.files) {
            const tempFilePath = file.path;
            const fileName = path.basename(tempFilePath);
            const newFilePath = path.join(productDir, fileName);

            // Move the file if it's not already in the correct location
            if (tempFilePath !== newFilePath) {
                fs.renameSync(tempFilePath, newFilePath);
            }

            newImages.push(`/uploads/products/${product.id}/${fileName}`);
        }

        product.images = newImages;
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (brand) product.brand = brand;
    if (metadata) product.metadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
    if (status) product.status = status;

    await product.save();

    res.status(200).json({
        status: "success",
        data: { product }
    });
});

exports.deleteProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
        return next(new AppError("Product not found", 404));
    }

    if (product.userId !== req.user?.id && !req.admin) {
        return next(new AppError("Unauthorized", 403));
    }



    const deletedId = product.id;

    // Remove product image directory if it exists
    const productDir = path.join(__dirname, '..', 'public', 'uploads', 'products', String(deletedId));
    if (fs.existsSync(productDir)) {
        try {
            fs.rmSync(productDir, { recursive: true, force: true });
            console.log(`Deleted image directory for product ${deletedId}`);
        } catch (err) {
            console.error(`Failed to delete images for product ${deletedId}:`, err);
            // We continue even if file deletion fails
        }
    }

    await product.destroy();

    res.status(200).json({
        status: "success",
        message: "Product deleted successfully",
        data: { id: deletedId }
    });

});

exports.getBoostPackages = asyncHandler(async (req, res, next) => {
    const packages = await BoostPackage.findAll({
        where: { isEnabled: true },
        order: [["durationHours", "ASC"]]
    });

    res.status(200).json({
        status: "success",
        data: { packages }
    });
});

exports.getPaymentAgents = asyncHandler(async (req, res, next) => {
    const agents = await PaymentAgent.findAll({
        where: { isEnabled: true },
        order: [["name", "ASC"]]
    });

    res.status(200).json({
        status: "success",
        data: { agents }
    });
});

exports.getMyBoostHistory = asyncHandler(async (req, res, next) => {
    const requests = await BoostRequest.findAll({
        where: { userId: req.user.id },
        include: [
            { model: Product, as: "product", attributes: ["id", "name", "price", "images"] },
            { model: BoostPackage, as: "package" }
        ],
        order: [["createdAt", "DESC"]]
    });

    res.status(200).json({
        status: "success",
        results: requests.length,
        data: { requests }
    });
});

exports.activateBoost = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { packageId, transactionId, agentId } = req.body;

    if (!transactionId) return next(new AppError("Transaction ID is required", 400));
    if (!agentId) return next(new AppError("Please select a payment agent", 400));

    const product = await Product.findByPk(id);
    if (!product) return next(new AppError("Product not found", 404));

    if (product.userId !== req.user?.id && !req.admin) {
        return next(new AppError("Unauthorized", 403));
    }

    const boostPackage = await BoostPackage.findByPk(packageId);
    if (!boostPackage || !boostPackage.isEnabled) return next(new AppError("Invalid package", 400));

    const agent = await PaymentAgent.findByPk(agentId);
    if (!agent || !agent.isEnabled) return next(new AppError("Invalid agent", 400));

    // Check for existing pending request for THIS product
    const pendingRequest = await BoostRequest.findOne({
        where: {
            productId: product.id,
            status: "pending"
        }
    });

    if (pendingRequest) {
        return next(new AppError("You already have a pending boost request for this product. Please wait for approval.", 400));
    }

    const existingRequest = await BoostRequest.findOne({ where: { transactionId } });
    if (existingRequest) return next(new AppError("Transaction ID already submitted", 400));

    const boostRequest = await BoostRequest.create({
        productId: product.id,
        packageId: boostPackage.id,
        userId: req.user.id,
        transactionId,
        agentId: agent.id,
        bankName: agent.bankName,
        status: "pending"
    });

    res.status(201).json({
        status: "success",
        message: "Boost request submitted successfully.",
        data: { boostRequest }
    });
});

exports.getBoostedProducts = asyncHandler(async (req, res, next) => {
    const now = new Date();

    // 1. "Just-In-Time" Cleanup: Find expired boosts
    const expiredBoosts = await ActiveBoost.findAll({
        where: { expiresAt: { [Op.lte]: now } },
        attributes: ["productId"]
    });

    if (expiredBoosts.length > 0) {
        const expiredProductIds = expiredBoosts.map(b => b.productId);

        // Remove from standalone table
        await ActiveBoost.destroy({
            where: { productId: expiredProductIds }
        });

        // Update original product flags to keep them in sync for user-side visibility
        await Product.update(
            { isBoosted: false, boostExpiresAt: null, boostPackageId: null },
            { where: { id: expiredProductIds } }
        );

        console.log(`🧹 Lazy cleanup: Removed ${expiredBoosts.length} expired boosts.`);
    }

    // 2. Fetch only live promotions (Started and not yet Expired)
    const products = await ActiveBoost.findAll({
        where: {
            startsAt: { [Op.lte]: now },
            // expiresAt check is implicit because we just deleted everything <= now
        },
        order: [["createdAt", "DESC"]]
    });

    res.status(200).json({
        status: "success",
        results: products.length,
        data: {
            products,
            serverTime: now
        }
    });
});

exports.getProductPoster = asyncHandler(async (req, res, next) => {
    // Basic implementation for now
    const product = await Product.findByPk(req.params.id);
    if (!product) return next(new AppError("Product not found", 404));

    res.status(200).json({
        status: "success",
        data: { posterUrl: `https://yourdomain.com/poster/${product.id}` }
    });
});
