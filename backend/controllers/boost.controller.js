const { BoostPackage, BoostRequest, Product, Users, PaymentAgent, ActiveBoost, BoostHistory } = require("../models");
const asyncHandler = require("../middlewares/asyncHandler");
const AppError = require("../utils/AppError");

// Package CRUD
exports.createPackage = asyncHandler(async (req, res, next) => {
    const { name, durationHours, price, isEnabled } = req.body;
    const boostPackage = await BoostPackage.create({ name, durationHours, price, isEnabled: isEnabled !== undefined ? isEnabled : true });
    res.status(201).json({ status: "success", data: { boostPackage } });
});

exports.getAllPackages = asyncHandler(async (req, res, next) => {
    const packages = await BoostPackage.findAll({ order: [["durationHours", "ASC"]] });
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
    const { name, durationHours, price, isEnabled } = req.body;
    if (name) boostPackage.name = name;
    if (durationHours !== undefined) boostPackage.durationHours = durationHours;
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

// Agent CRUD
exports.createAgent = asyncHandler(async (req, res, next) => {
    // Enforce single agent limit
    const existingAgent = await PaymentAgent.findOne();
    if (existingAgent) {
        return next(new AppError("Only one payment agent is allowed. Please edit the existing one.", 400));
    }

    const { name, bankName, accountNumber, isEnabled } = req.body;
    const agent = await PaymentAgent.create({ name, bankName, accountNumber, isEnabled: isEnabled !== undefined ? isEnabled : true });
    res.status(201).json({ status: "success", data: { agent } });
});

exports.getAllAgents = asyncHandler(async (req, res, next) => {
    const agents = await PaymentAgent.findAll({ limit: 1, order: [["createdAt", "DESC"]] });
    res.status(200).json({ status: "success", results: agents.length, data: { agents } });
});

exports.updateAgent = asyncHandler(async (req, res, next) => {
    const agent = await PaymentAgent.findByPk(req.params.id);
    if (!agent) return next(new AppError("Agent not found", 404));
    const { name, bankName, accountNumber, isEnabled } = req.body;
    if (name) agent.name = name;
    if (bankName) agent.bankName = bankName;
    if (accountNumber) agent.accountNumber = accountNumber;
    if (isEnabled !== undefined) agent.isEnabled = isEnabled;
    await agent.save();
    res.status(200).json({ status: "success", data: { agent } });
});

exports.deleteAgent = asyncHandler(async (req, res, next) => {
    const agent = await PaymentAgent.findByPk(req.params.id);
    if (!agent) return next(new AppError("Agent not found", 404));
    await agent.destroy();
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
        const expiresAt = new Date(startsAt.getTime() + (boostRequest.package.durationHours * 60 * 60 * 1000));

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
        packageDurationHours: boostRequest.package?.durationHours || 0,
        userEmail: boostRequest.user?.email || "Deleted User",
        userFullName: boostRequest.user ? `${boostRequest.user.first_name} ${boostRequest.user.last_name}` : "Deleted User"
    });

    // 2. Remove from active Requests table
    await boostRequest.destroy();

    res.status(200).json({ status: "success", message: `Request approved and archived.` });
});

exports.terminateBoost = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const activeBoost = await ActiveBoost.findOne({ where: { productId: id } });
    if (!activeBoost) return next(new AppError("Active boost not found", 404));

    await activeBoost.destroy();

    // Also update the product flags for status visibility
    const product = await Product.findByPk(id);
    if (product) {
        product.isBoosted = false;
        product.boostExpiresAt = null;
        product.boostPackageId = null;
        await product.save();
    }

    res.status(200).json({ status: "success", message: "Boost terminated successfully" });
});

exports.getUserInfo = asyncHandler(async (req, res, next) => {
    const user = await Users.findByPk(req.params.id, {
        attributes: ["id", "first_name", "last_name", "email", "phone_number", "profile_pic", "createdAt"]
    });

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: { user }
    });
});
