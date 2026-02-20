const { BoostPackage, BoostRequest, Product, Users, BankAccount, ActiveBoost, BoostHistory } = require("../models");
const { Op } = require("sequelize");
const asyncHandler = require("../middlewares/asyncHandler");
const AppError = require("../utils/AppError");

// Package CRUD
exports.createPackage = asyncHandler(async (req, res, next) => {
    const { name, durationDays, price, isEnabled } = req.body;
    const boostPackage = await BoostPackage.create({ name, durationDays, price, isEnabled: isEnabled !== undefined ? isEnabled : true });
    res.status(201).json({ status: "success", data: { package: boostPackage } });
});

exports.getAllPackages = asyncHandler(async (req, res, next) => {
    const packages = await BoostPackage.findAll({ order: [["durationDays", "ASC"]] });
    res.status(200).json({ status: "success", results: packages.length, data: { packages } });
});

exports.getPackage = asyncHandler(async (req, res, next) => {
    const boostPackage = await BoostPackage.findByPk(req.params.id);
    if (!boostPackage) return next(new AppError("Boost package not found", 404));
    res.status(200).json({ status: "success", data: { boostPackage } });
});

exports.updatePackage = asyncHandler(async (req, res, next) => {
    const boostPackage = await BoostPackage.findByPk(req.params.id);
    if (!boostPackage) return next(new AppError("Boost package not found", 404));
    const { name, durationDays, price, isEnabled } = req.body;
    if (name) boostPackage.name = name;
    if (durationDays !== undefined) boostPackage.durationDays = durationDays;
    if (price !== undefined) boostPackage.price = price;
    if (isEnabled !== undefined) boostPackage.isEnabled = isEnabled;
    await boostPackage.save();
    res.status(200).json({ status: "success", data: { boostPackage } });
});

exports.deletePackage = asyncHandler(async (req, res, next) => {
    const boostPackage = await BoostPackage.findByPk(req.params.id);
    if (!boostPackage) return next(new AppError("Boost package not found", 404));
    await boostPackage.destroy();
    res.status(204).json({ status: "success", data: null });
});

// Bank Account CRUD
exports.createBankAccount = asyncHandler(async (req, res, next) => {
    // Enforce single bank account limit (optional, but keeping it for simplicity as per user request)
    const existingAccount = await BankAccount.findOne();
    if (existingAccount) {
        return next(new AppError("A bank account already exists. Please edit the existing one.", 400));
    }

    const { name, bankName, accountNumber, isEnabled } = req.body;
    const account = await BankAccount.create({ name, bankName, accountNumber, isEnabled: isEnabled !== undefined ? isEnabled : true });
    res.status(201).json({ status: "success", data: { account } });
});

exports.getBankAccount = asyncHandler(async (req, res, next) => {
    const account = await BankAccount.findOne({ order: [["createdAt", "DESC"]] });
    res.status(200).json({ status: "success", data: { bankAccount: account } });
});

exports.updateBankAccount = asyncHandler(async (req, res, next) => {
    const account = await BankAccount.findByPk(req.params.id);
    if (!account) return next(new AppError("Bank account not found", 404));
    const { name, bankName, accountNumber, isEnabled } = req.body;
    if (name) account.name = name;
    if (bankName) account.bankName = bankName;
    if (accountNumber) account.accountNumber = accountNumber;
    if (isEnabled !== undefined) account.isEnabled = isEnabled;
    await account.save();
    res.status(200).json({ status: "success", data: { account } });
});

exports.deleteBankAccount = asyncHandler(async (req, res, next) => {
    const account = await BankAccount.findByPk(req.params.id);
    if (!account) return next(new AppError("Bank account not found", 404));
    await account.destroy();
    res.status(204).json({ status: "success", data: null });
});

// Request Management
exports.getBoostRequests = asyncHandler(async (req, res, next) => {
    const { history } = req.query;
    const isHistory = history === "true";
    const Model = isHistory ? BoostHistory : BoostRequest;

    const requests = await Model.findAll({
        order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ status: "success", results: requests.length, data: { requests, isHistory } });
});

exports.verifyBoostRequest = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!["approved", "rejected"].includes(status)) {
        return next(new AppError("Invalid status", 400));
    }

    const boostRequest = await BoostRequest.findByPk(id, {
        include: [
            { model: BoostPackage, as: "package" },
            { model: Product, as: "product" },
            { model: Users, as: "user", attributes: ["first_name", "last_name", "email"] }
        ]
    });
    if (!boostRequest) return next(new AppError("Boost request not found", 404));
    if (boostRequest.status !== "pending") return next(new AppError("Already processed", 400));

    if (status === "approved") {
        const product = await Product.findByPk(boostRequest.productId, {
            include: [{ model: Users, as: "user", attributes: ["first_name", "last_name"] }]
        });
        if (!product) return next(new AppError("Product not found", 404));

        // Calculate timing: Use requested startTime if provided, otherwise start now
        const startsAt = req.body.startTime ? new Date(req.body.startTime) : new Date();
        const expiresAt = new Date(startsAt.getTime() + (boostRequest.package.durationDays * 24 * 60 * 60 * 1000));

        product.isBoosted = true;
        product.boostExpiresAt = expiresAt;
        product.boostPackageId = boostRequest.packageId;
        await product.save();

        // Create or update ActiveBoost record with full product data (Standalone)
        const activeBoostData = {
            productId: product.id,
            packageId: boostRequest.packageId,
            startsAt: startsAt,
            expiresAt: expiresAt,
            name: product.name,
            description: product.description,
            price: product.price,
            discount: product.discount,
            category: product.category,
            brand: product.brand,
            images: product.images,
            metadata: product.metadata,
            userId: product.userId,
            userFirstName: product.user?.first_name,
            userLastName: product.user?.last_name
        };

        const [activeBoost, created] = await ActiveBoost.findOrCreate({
            where: { productId: product.id },
            defaults: activeBoostData
        });

        if (!created) {
            await activeBoost.update(activeBoostData);
        }

        // Sync flags to the original Product table for user-side visibility
        await product.update({
            isBoosted: true,
            boostExpiresAt: expiresAt,
            boostPackageId: boostRequest.packageId
        });

        // Update the request with the actual applied times
        boostRequest.startTime = startsAt;
        boostRequest.endTime = expiresAt;
        boostRequest.status = "approved";
    } else {
        boostRequest.status = "rejected";
        boostRequest.rejectionReason = rejectionReason || "Payment verification failed";
        await boostRequest.save();
        return res.status(200).json({ status: "success", message: "Request rejected and kept in queue." });
    }

    // 1. Save to History (Permanent Denormalized Snapshot) - ONLY FOR APPROVED
    await BoostHistory.create({
        userId: boostRequest.userId,
        transactionId: boostRequest.transactionId,
        bankName: boostRequest.bankName,
        paidAmount: boostRequest.package?.price || 0,
        startTime: boostRequest.startTime,
        endTime: boostRequest.endTime,
        processedAt: new Date(),

        // Snapshot Data
        productName: boostRequest.product?.name || "Deleted Product",
        productPrice: boostRequest.product?.price || 0,
        packageName: boostRequest.package?.name || "Deleted Package",
        packageDurationDays: boostRequest.package?.durationDays || 0,
        userEmail: boostRequest.user?.email || "Deleted User",
        userFullName: boostRequest.user ? `${boostRequest.user.first_name} ${boostRequest.user.last_name}` : "Deleted User"
    });

    // 2. Remove from active Requests table
    await boostRequest.destroy();

    res.status(200).json({ status: "success", message: `Request approved and archived.` });
});

exports.getActiveBoosts = asyncHandler(async (req, res, next) => {
    const { search, category, user } = req.query;

    const now = new Date();

    // Build where clause for active boosts
    const whereClause = {
        startsAt: { [Op.lte]: now },
        expiresAt: { [Op.gt]: now }
    };

    if (search) {
        whereClause.name = { [Op.like]: `%${search}%` };
    }

    if (category) {
        whereClause.category = category;
    }

    if (user) {
        whereClause.userId = parseInt(user);
    }

    const activeBoosts = await ActiveBoost.findAll({
        where: whereClause,
        order: [["expiresAt", "ASC"]], // Show expiring soon first
    });

    res.status(200).json({
        status: "success",
        results: activeBoosts.length,
        data: { activeBoosts }
    });
});

exports.terminateBoost = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const activeBoost = await ActiveBoost.findOne({ where: { productId: id } });
    if (!activeBoost) return next(new AppError("Active boost not found", 404));

    await activeBoost.destroy();

    // Update the product flags for status visibility
    await Product.update(
        { isBoosted: false, boostExpiresAt: null, boostPackageId: null },
        { where: { id } }
    );

    res.status(200).json({ status: "success", message: "Boost terminated successfully" });
});


