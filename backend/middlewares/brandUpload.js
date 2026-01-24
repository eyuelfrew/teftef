const multer = require("multer");
const path = require("path");
const fs = require("fs");
const AppError = require("../utils/AppError");

const uploadsRoot = path.join(__dirname, "..", "uploads");

const ensureDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let brandId = req.params.id;

        // For new brands, we don't have an ID yet.
        if (!brandId) {
            const tempDir = path.join(uploadsRoot, "brands", "temp");
            ensureDir(tempDir);
            return cb(null, tempDir);
        }

        const targetDir = path.join(uploadsRoot, "brands", String(brandId));

        const normalized = path.normalize(targetDir);
        if (!normalized.startsWith(uploadsRoot)) {
            return cb(new AppError("Invalid upload path", 400));
        }

        ensureDir(targetDir);
        cb(null, targetDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        // We keep the logic for logo vs cover naming
        const newName = file.fieldname === 'logo' ? `logo${ext}` : `cover${ext}`;
        cb(null, newName.toLowerCase()); // Lowercase extension for consistency
    },
});

/**
 * UPDATED FILE FILTER
 * Instead of a fixed list, we check if the mimetype starts with "image/"
 * This automatically includes: avif, webp, gif, svg, bmp, tiff, etc.
 */
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new AppError("Unsupported file type. Please upload an image file (AVIF, WebP, GIF, etc.)", 400), false);
    }
};

const uploadBrandImages = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // Increased to 10MB for high-res brand assets
    },
}).fields([
    { name: 'logo', maxCount: 1 },
    { name: 'cover', maxCount: 1 } // Added cover here since your filename logic mentions it
]);

module.exports = { uploadBrandImages };