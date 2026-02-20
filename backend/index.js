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
const activeBoostsRoutes = require("./routes/active-boosts.routes");
const boostRequestsRoutes = require("./routes/boost-requests.routes");
const attributeRoutes = require("./routes/categoryAttribute.routes");
const searchRoutes = require("./routes/search.routes");
const bankAccountRoutes = require("./routes/bank-account.routes");
const userManagementRoutes = require("./routes/userManagement.routes");

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
const origins = [
  "https://teftefadmin.virallinkdigital.com",
  "https://teftef.virallinkdigital.com",
  "http://localhost:5173",
  "http://localhost:5174"
];

if (CLIENT_ORIGIN && !origins.includes(CLIENT_ORIGIN)) {
  origins.push(CLIENT_ORIGIN);
}

app.use(
  cors({
    origin: origins,
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
    next();
  },
  express.static(path.join(__dirname, "public/uploads"), {
    index: false,
    dotfiles: "ignore",
    maxAge: "7d",
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

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Backend is running and healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes
// Admin Namespace
app.use("/api/v1/admin/auth", adminAuthRoutes);
app.use("/api/v1/admin/management", adminManagementRoutes);
app.use("/api/v1/admin/boost-packages", boostRoutes);
app.use("/api/v1/admin/active-boosts", activeBoostsRoutes);
app.use("/api/v1/admin/boost-requests", boostRequestsRoutes);
app.use("/api/v1/admin/bank-accounts", bankAccountRoutes);
app.use("/api/v1/admin/users", userManagementRoutes);
app.use("/api/v1/admin/search-analytics", searchRoutes);

// User/Public Namespace
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/ads", adRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/sponsorships", sponsorshipRoutes);
app.use("/api/v1/attributes", attributeRoutes);

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