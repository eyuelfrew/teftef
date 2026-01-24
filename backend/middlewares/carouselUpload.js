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
        const targetDir = path.join(uploadsRoot, "carousels");
        ensureDir(targetDir);
        cb(null, targetDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, "_");
        cb(null, `carousel_${base}_${timestamp}${ext.toLowerCase()}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new AppError("Please upload image files only (JPG, PNG, WebP, AVIF, etc.)", 400), false);
    }
};

const uploadCarouselImage = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
}).single("image");

module.exports = { uploadCarouselImage };
