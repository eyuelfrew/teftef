const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const BoostRequest = sequelize.define(
        "BoostRequest",
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
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
            transactionId: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true,
            },
            agentId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: true,
            },
            bankName: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM("pending", "approved", "rejected"),
                defaultValue: "pending",
            },
            rejectionReason: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            startTime: {
                type: DataTypes.DATE,
                allowNull: true,
                comment: "User requested start time",
            },
            endTime: {
                type: DataTypes.DATE,
                allowNull: true,
                comment: "User requested end time",
            },
        },
        {
            tableName: "boost_requests",
            timestamps: true,
        }
    );

    return BoostRequest;
};
