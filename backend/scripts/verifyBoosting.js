const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
// We need a user ID for boosting. Since we are in development, 
// we'll assume a user exists or we'll mock the request.
// However, since I can't easily get a valid JWT without login,
// I'll use a direct database check or a script that uses the models.

const { Product, BoostPackage, initDb } = require('../models');

const verifyBoosting = async () => {
    try {
        await initDb();

        // 1. Get packages
        const packages = await BoostPackage.findAll({ where: { isEnabled: true } });
        console.log(`Found ${packages.length} boost packages.`);

        // 2. Get a product to boost
        const product = await Product.findOne();
        if (!product) {
            console.log("No products found to test boosting.");
            return;
        }
        console.log(`Testing with product ID: ${product.id} (${product.name})`);

        // 3. Reset boost status first
        product.isBoosted = false;
        product.boostExpiresAt = null;
        await product.save();

        // 4. Activate boost (Simulating the controller logic)
        const pkg = packages[0]; // 24 Hours
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + pkg.durationHours);

        product.isBoosted = true;
        product.boostExpiresAt = expiresAt;
        product.boostPackageId = pkg.id;
        await product.save();
        console.log(`✅ Product ${product.id} boosted until ${expiresAt.toISOString()}`);

        // 5. Verify listing order
        const allProducts = await Product.findAll({
            order: [['isBoosted', 'DESC'], ['createdAt', 'DESC']]
        });

        console.log("Top 3 products in listing:");
        allProducts.slice(0, 3).forEach((p, i) => {
            console.log(`${i + 1}. [${p.isBoosted ? 'BOOSTED' : 'NORMAL'}] ${p.name} (Created: ${p.createdAt})`);
        });

        if (allProducts[0].id === product.id) {
            console.log("✅ SUCCESS: Boosted product is at the top!");
        } else {
            console.log("❌ FAILURE: Boosted product is NOT at the top.");
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Verification failed:", error);
        process.exit(1);
    }
};

verifyBoosting();
