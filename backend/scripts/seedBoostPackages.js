const { BoostPackage, initDb } = require("../models");
require("dotenv").config();

const seedBoostPackages = async () => {
    try {
        await initDb();

        const packages = [
            {
                name: "24 Hours Boost",
                durationHours: 24,
                price: 50.00,
                isEnabled: true,
            },
            {
                name: "7 Days Boost",
                durationHours: 168,
                price: 300.00,
                isEnabled: true,
            },
            {
                name: "1 Month Boost",
                durationHours: 720,
                price: 1000.00,
                isEnabled: true,
            },
        ];

        for (const pkg of packages) {
            const [item, created] = await BoostPackage.findOrCreate({
                where: { durationHours: pkg.durationHours },
                defaults: pkg,
            });

            if (created) {
                console.log(`✅ Created package: ${item.name}`);
            } else {
                console.log(`ℹ️ Package already exists: ${item.name}`);
            }
        }

        console.log("✅ Boost packages seeding completed.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedBoostPackages();
