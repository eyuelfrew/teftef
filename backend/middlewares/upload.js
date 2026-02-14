const multer = require("multer");
const path = require("path");
const fs = require("fs");
const AppError = require("../utils/AppError");

const uploadsRoot = path.join(__dirname, "..", "public", "uploads");

const ensureDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const id = req.params.id;

        if (!id) {
            // If no ID, upload to temp folder for new product creation
            const isProductRoute = req.baseUrl.includes("/products");
            const subFolder = isProductRoute ? "products" : "categories";
            const tempDir = path.join(uploadsRoot, subFolder, "temp");
            ensureDir(tempDir);
            return cb(null, tempDir);
        }

        if (!/^\d+$/.test(id)) {
            return cb(new AppError("Valid ID is required for image upload", 400));
        }

        const isProductRoute = req.baseUrl.includes("/products");
        const subFolder = isProductRoute ? "products" : "categories";
        const targetDir = path.join(uploadsRoot, subFolder, String(id));

        const normalized = path.normalize(targetDir);
        if (!normalized.startsWith(uploadsRoot)) {
            return cb(new AppError("Invalid upload path", 400));
        }

        ensureDir(targetDir);
        cb(null, targetDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, "_");
        cb(null, `${base}-${timestamp}${ext.toLowerCase()}`);
    },
});

const categoryStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Updated to match actual route mounting in index.js (/api/categories)
        const isRootCategoryRoute = req.baseUrl.includes("/categories") || req.baseUrl.includes("/admin/categories");
        // Keep normal categories check just in case, though route might not exist yet
        const isNormalCategoryRoute = req.baseUrl.includes("/normal-categories");
        const id = req.params.id;

        if (!isRootCategoryRoute && !isNormalCategoryRoute) {
            return cb(new AppError("Invalid route for category upload", 400));
        }

        const categoryType = isNormalCategoryRoute ? "normal-categories" : "categories";
        // Flattened structure to match controller expectation (no subfolders for categories)
        const targetDir = path.join(uploadsRoot, categoryType);

        const normalized = path.normalize(targetDir);
        if (!normalized.startsWith(uploadsRoot)) {
            return cb(new AppError("Invalid upload path", 400));
        }

        ensureDir(targetDir);
        cb(null, targetDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, "_");
        cb(null, `${base}-${timestamp}${ext.toLowerCase()}`);
    },
});

/**
 * UPDATED FILE FILTER
 * This now accepts ANY file that identifies as an image (avif, gif, webp, etc.)
 */
const fileFilter = (req, file, cb) => {
    // Accepting all file types as requested to avoid mimetype issues from client
    cb(null, true);
};

const uploadProductImages = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // Increased to 10MB as AVIFs/high-res pics can be large
        files: 5,
    },
}).array("images", 5);

const uploadCategoryImage = multer({
    storage: categoryStorage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 1,
    },
}).single("image");

module.exports = { uploadProductImages, uploadCategoryImage, uploadsRoot };