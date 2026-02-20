const { sequelize, PaymentAgent } = require("../models");

async function createPaymentAgent() {
    try {
        console.log("🔧 Creating default payment agent...");

        // Check if agent already exists
        const existing = await PaymentAgent.findOne();
        if (existing) {
            console.log("✅ Payment agent already exists:");
            console.log(existing);
            process.exit(0);
        }

        // Create default agent
        const agent = await PaymentAgent.create({
            name: "Bank Transfer",
            bankName: "Commercial Bank of Ethiopia",
            accountNumber: "1234567890",
            isEnabled: true
        });

        console.log("✅ Payment agent created successfully:");
        console.log(agent);
        process.exit(0);
    } catch (error) {
        console.error("❌ Failed to create payment agent:", error);
        process.exit(1);
    }
}

createPaymentAgent();
