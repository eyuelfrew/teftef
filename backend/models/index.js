const { sequelize } = require("../config/DB_CONFIG");
const defineUser = require("./User");
const defineAdmin = require("./Admin");
const defineCategory = require("./Category");
const defineNormalCategory = require("./NormalCategory");
const defineProduct = require("./Product");
const defineRefreshToken = require("./RefreshToken");
const defineBrand = require("./Brand");
const defineHomeCarousel = require("./HomeCarousel");
const defineAdvertisement = require("./Advertisement");
const defineSponsorship = require("./Sponsorship");
const defineCategoryAttribute = require("./CategoryAttribute");
const bcrypt = require("bcryptjs");

// Define models
const Users = defineUser(sequelize);
const Admin = defineAdmin(sequelize);
const RootedCategory = defineCategory(sequelize);
const NormalCategory = defineNormalCategory(sequelize);
const Product = defineProduct(sequelize);
const RefreshToken = defineRefreshToken(sequelize);
const Brand = defineBrand(sequelize);
const HomeCarousel = defineHomeCarousel(sequelize);
const Advertisement = defineAdvertisement(sequelize);
const Sponsorship = defineSponsorship(sequelize);
const CategoryAttribute = defineCategoryAttribute(sequelize);

// No associations - using manual queries instead

// Initialize database and sync models
const initDb = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connection established.");

        const alterSync = process.env.DB_SYNC_ALTER === "true" || true; // Default to true as per user preference

        await sequelize.sync({ alter: alterSync });

        console.log(`✅ All Tables synchronized successfully.`);
    } catch (error) {
        console.error("❌ Database initialization failed:", error.message);
        throw error;
    }
};

// Create default super admin if not exists
const ensureSuperAdmin = async () => {
    try {
        const existingSuperAdmin = await Admin.findOne({
            where: { is_super_admin: true },
        });

        if (existingSuperAdmin) {
            console.log("✅ Super admin already exists.");
            return;
        }

        const hashedPassword = await bcrypt.hash("admin", 10);

        await Admin.create({
            first_name: "Super",
            last_name: "Admin",
            email: "admin@example.com",
            password: hashedPassword,
            is_super_admin: true,
            status: "active",
        });

        console.log("✅ Super admin created successfully.");
        console.log("   Email: admin@example.com");
        console.log("   Password: admin");
    } catch (error) {
        console.error("❌ Super admin creation failed:", error.message);
    }
};

module.exports = {
    sequelize,
    initDb,
    ensureSuperAdmin,
    Users,
    Admin,
    RootedCategory,
    NormalCategory,
    Product,
    RefreshToken,
    Brand,
    HomeCarousel,
    Advertisement,
    Sponsorship,
    CategoryAttribute,
};


