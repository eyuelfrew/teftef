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
            originalRequestId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: true,
            },
            productId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
            },
            packageId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
            },
            userId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
            },
            agentId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: true,
            },
            transactionId: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            bankName: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM("approved", "rejected"),
                allowNull: false,
            },
            rejectionReason: {
                type: DataTypes.TEXT,
                allowNull: true,
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
            }
        },
        {
            tableName: "boost_history",
            timestamps: true,
            indexes: [
                { fields: ["productId"] },
                { fields: ["userId"] },
                { fields: ["transactionId"] }
            ]
        }
    );

    return BoostHistory;
};
