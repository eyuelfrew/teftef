const { Product, BoostPackage, initDb } = require('../models');
const { Op } = require('sequelize');

const verifyManagementAndCleanup = async () => {
    try {
        await initDb();

        console.log("--- 1. Testing Boost Package Management ---");
        // Create a test package
        const testPkg = await BoostPackage.create({
            name: "Test Package (1 Min)",
            durationHours: 0.016, // Approx 1 minute
            price: 1.00,
            isEnabled: true
        });
        console.log(`✅ Created test package: ${testPkg.name}`);

        // Update package
        testPkg.price = 2.00;
        await testPkg.save();
        console.log(`✅ Updated test package price to: ${testPkg.price}`);

        console.log("\n--- 2. Testing Boosting Activation & Priority ---");
        // Get a product
        const product = await Product.findOne();
        if (!product) {
            console.log("❌ No products found to test.");
            process.exit(1);
        }

        // Activate boost
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 1); // Expire in 1 min

        product.isBoosted = true;
        product.boostExpiresAt = expiresAt;
        product.boostPackageId = testPkg.id;
        await product.save();
        console.log(`✅ Product [${product.id}] boosted until ${expiresAt.toISOString()}`);

        // Verify listing
        const allProducts = await Product.findAll({
            order: [['isBoosted', 'DESC'], ['createdAt', 'DESC']]
        });
        if (allProducts[0].id === product.id) {
            console.log("✅ SUCCESS: Boosted product is at the top.");
        } else {
            console.log("❌ FAILURE: Boosted product is NOT at the top.");
        }

        console.log("\n--- 3. Testing Cleanup Logic ---");
        // Manually expire the boost
        product.boostExpiresAt = new Date(Date.now() - 1000); // 1 second ago
        await product.save();
        console.log("🕒 Boost manually expired in DB.");

        // Run cleanup logic (same as in index.js)
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
        console.log(`🧹 Cleanup ran. updatedCount: ${updatedCount}`);

        // Verify deactivation
        const updatedProduct = await Product.findByPk(product.id);
        if (!updatedProduct.isBoosted) {
            console.log("✅ SUCCESS: Product boost deactivated after cleanup.");
        } else {
            console.log("❌ FAILURE: Product boost still active.");
        }

        // Cleanup test data
        await testPkg.destroy();
        console.log("\n✅ Verification complete.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Verification failed:", error);
        process.exit(1);
    }
};

verifyManagementAndCleanup();
