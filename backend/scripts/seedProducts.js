const { Product, sequelize } = require("../models");

const seedProducts = async () => {
    try {
        console.log("🌱 Starting product seeding...");

        const productsToCreate = [];
        const baseProduct = {
            description: "This is a high-quality test product generated for demonstration and testing purposes. It features a modern design and reliable performance suitable for various use cases. The product has been thoroughly tested to ensure it meets our quality standards.",
            price: 1500.00,
            discount: 150.00,
            stock: 50,
            status: "active",
            category: "Electronics > Accessories",
            brand: "Generic",
            images: ["/uploads/products/placeholder.jpg"],
            metadata: { color: "Black", material: "Plastic", warranty: "1 Year" },
            userId: 1 // Using identified user ID
        };

        for (let i = 1; i <= 100; i++) {
            productsToCreate.push({
                ...baseProduct,
                name: `Premium Gadget Pro - Model ${i}`,
                price: (Math.random() * 5000 + 500).toFixed(2), // Random price
                stock: Math.floor(Math.random() * 200) + 1  // Random stock
            });
        }

        await Product.bulkCreate(productsToCreate);

        console.log("✅ Successfully seeded 100 products.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedProducts();
