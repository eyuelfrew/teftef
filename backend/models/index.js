const { sequelize } = require("../config/DB_CONFIG");
const bcrypt = require("bcryptjs");

const defineCategory = require("./Category");
const defineProduct = require("./Product");
const defineAd = require("./Advertisement");
const defineSponsorship = require("./Sponsorship");
const defineAdmin = require("./Admin");
const defineUser = require("./User");
const defineCategoryAttribute = require("./CategoryAttribute");
const defineBoostPackage = require("./BoostPackage");
const defineBoostRequest = require("./BoostRequest");
const definePaymentAgent = require("./PaymentAgent");
const defineBrand = require("./Brand");
const defineHomeCarousel = require("./HomeCarousel");
const defineNormalCategory = require("./NormalCategory");
const defineRefreshToken = require("./RefreshToken");
const defineActiveBoost = require("./ActiveBoost");
const defineBoostHistory = require("./BoostHistory");
const defineSearchTracking = require("./SearchTracking");

// Initialize models
const Category = defineCategory(sequelize);
const Product = defineProduct(sequelize);
const Advertisement = defineAd(sequelize);
const Sponsorship = defineSponsorship(sequelize);
const Admin = defineAdmin(sequelize);
const Users = defineUser(sequelize);
const CategoryAttribute = defineCategoryAttribute(sequelize);
const BoostPackage = defineBoostPackage(sequelize);
const BoostRequest = defineBoostRequest(sequelize);
const PaymentAgent = definePaymentAgent(sequelize);
const Brand = defineBrand(sequelize);
const HomeCarousel = defineHomeCarousel(sequelize);
const NormalCategory = defineNormalCategory(sequelize);
const RefreshToken = defineRefreshToken(sequelize);
const ActiveBoost = defineActiveBoost(sequelize);
const BoostHistory = defineBoostHistory(sequelize);
const { SearchLog, PopularSearch } = defineSearchTracking(sequelize);

// Associations
Product.belongsTo(Users, { foreignKey: "userId", as: "user", constraints: false });
Users.hasMany(Product, { foreignKey: "userId", as: "products", constraints: false });

BoostRequest.belongsTo(Product, { foreignKey: "productId", as: "product", constraints: false });
BoostRequest.belongsTo(BoostPackage, { foreignKey: "packageId", as: "package", constraints: false });
BoostRequest.belongsTo(Users, { foreignKey: "userId", as: "user", constraints: false });
BoostRequest.belongsTo(PaymentAgent, { foreignKey: "agentId", as: "agent", constraints: false });

BoostHistory.belongsTo(Users, { foreignKey: "userId", as: "user", constraints: false });

Product.hasMany(BoostRequest, { foreignKey: "productId", as: "boostRequests", constraints: false });

// Initialize database and sync models

// Initialize database and sync models
const initDb = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connection established.");

        if (process.env.DB_SYNC_ALTER === "true" || true) {
            await sequelize.sync({ alter: true });
            console.log("✅ Models synchronized with database.");
        }
    } catch (error) {
        console.error("❌ Database initialization failed:", error.message);
        throw error;
    }
};

const ensureSuperAdmin = async () => {
    try {
        const superAdmin = await Admin.findOne({ where: { is_super_admin: true } });
        if (!superAdmin) {
            console.log("ℹ️ No Super Admin found. Creating default...");
            const hashedPassword = await bcrypt.hash("admin123", 12);
            await Admin.create({
                first_name: "Super",
                last_name: "Admin",
                email: "admin@teftef.com",
                password: hashedPassword,
                is_super_admin: true,
                status: "active"
            });
            console.log("✅ Default Super Admin created (admin@teftef.com / admin123).");
        }
    } catch (error) {
        console.error("❌ Failed to ensure Super Admin:", error.message);
    }
};

module.exports = {
    sequelize,
    initDb,
    ensureSuperAdmin,
    Category,
    Product,
    Advertisement,
    Sponsorship,
    Admin,
    Users,
    CategoryAttribute,
    BoostPackage,
    BoostRequest,
    PaymentAgent,
    Brand,
    HomeCarousel,
    NormalCategory,
    RefreshToken,
    ActiveBoost,
    BoostHistory,
    SearchLog,
    PopularSearch,
};
