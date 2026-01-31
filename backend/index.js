const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const { createDatabase } = require("./config/DB_CONFIG");
const { initDb, ensureSuperAdmin, Product, ActiveBoost } = require("./models");
const { Op } = require("sequelize");
const { apiLimiter } = require("./middlewares/rateLimiter");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const adminAuthRoutes = require("./routes/adminAuth.routes");
const authRoutes = require("./routes/auth.routes");
const adminManagementRoutes = require("./routes/adminManagement.routes");
const adRoutes = require("./routes/ad.routes");
const categoryRoutes = require("./routes/category.routes");
const productRoutes = require("./routes/product.routes");
const sponsorshipRoutes = require("./routes/sponsorship.routes");
const boostRoutes = require("./routes/boost.routes");
const attributeRoutes = require("./routes/categoryAttribute.routes");

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception thrown:", err);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const app = express();

/* ======================================================
   GLOBAL CORS
===================================================== */
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const staticPath = path.join(__dirname, "public/uploads");
console.log(`📂 Serving static files from: ${staticPath}`);

/* ======================================================
   TRUST PROXY
====================================================== */
app.set("trust proxy", 1);

/* ======================================================
   STATIC UPLOADS
====================================================== */
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
  },
  express.static(path.join(__dirname, "public/uploads"), {
    index: false,
    dotfiles: "ignore",
    maxAge: "7d",
  })
);

/* ======================================================
   GLOBAL CORS
====================================================== */
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ======================================================
   LOGGING + BODY + COOKIES
====================================================== */
app.use(morgan('tiny'));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

/* ======================================================
   RATE LIMITING + ROUTES
====================================================== */
app.use("/api", apiLimiter);

app.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    message: "Teftef E-commerce Admin API is running 🚀",
  });
});
// Routes
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin/management", adminManagementRoutes);
app.use("/api/ads", adRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sponsorships", sponsorshipRoutes);
app.use("/api/admin/boost-packages", boostRoutes);
app.use("/api/attributes", attributeRoutes);

app.use(notFound);
app.use(errorHandler);

/* ======================================================
   BOOST CLEANUP TASK
====================================================== */
const runBoostCleanup = async () => {
  try {
    const now = new Date();
    const [updatedCount] = await Product.update(
      { isBoosted: false, boostExpiresAt: null },
      {
        where: {
          isBoosted: true,
          boostExpiresAt: { [Op.lt]: now }
        }
      }
    );

    // Also remove from standalone ActiveBoost table
    const deletedCount = await ActiveBoost.destroy({
      where: {
        expiresAt: { [Op.lt]: now }
      }
    });

    if (updatedCount > 0 || deletedCount > 0) {
      console.log(`🧹 Cleaned up ${updatedCount} product flags and ${deletedCount} active boosts.`);
    }
  } catch (error) {
    console.error("❌ Boost cleanup failed:", error);
  }
};

// Check every hour
setInterval(runBoostCleanup, 60 * 60 * 1000);

/* ======================================================
   START SERVER
====================================================== */
const startServer = async () => {
  try {
    console.log("🔧 Initializing database...");
    await createDatabase();
    await initDb();
    await ensureSuperAdmin();
    console.log("✅ Database ready.");

    // Run initial cleanup on startup
    await runBoostCleanup();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} is already in use. Please kill the process using it.`);
      } else {
        console.error("❌ Server error:", err);
      }
      process.exit(1);
    });
  } catch (err) {
    console.error("❌ Server startup failed:", err);
    process.exit(1);
  }
};

startServer();