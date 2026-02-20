const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const BoostHistory = sequelize.define(
        "BoostHistory",
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            userId: {
                // Keep for user's personal revenue/boost history
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
            },
            transactionId: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            bankName: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            paidAmount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },
            startTime: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            endTime: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            processedAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            // Denormalized Product Metadata (Snapshot)
            productName: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            productPrice: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
            },
            // Denormalized Package Metadata (Snapshot)
            packageName: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            packageDurationDays: {
                type: DataTypes.DECIMAL(10, 6),
                allowNull: true,
            },
            // Denormalized User Metadata (Snapshot)
            userEmail: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            userFullName: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
        },
        {
            tableName: "boost_history",
            timestamps: true,
            indexes: [
                { fields: ["userId"] },
                { fields: ["transactionId"] }
            ]
        }
    );

    return BoostHistory;
};
