const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const ActiveBoost = sequelize.define(
        "ActiveBoost",
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            productId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                unique: true, // Only one active boost per original product
            },
            packageId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
            },
            startsAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            expiresAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            // Copy of Product attributes
            name: {
                type: DataTypes.STRING(200),
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            discount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },
            category: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            brand: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            images: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            metadata: {
                type: DataTypes.JSON,
                allowNull: true,
                defaultValue: {},
            },
            userId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: true,
            },
            // Copy of Owner attributes (for Admin Dashboard)
            userFirstName: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            userLastName: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
        },
        {
            tableName: "active_boosts",
            timestamps: true,
            indexes: [
                {
                    fields: ["expiresAt"],
                },
                {
                    fields: ["productId"],
                },
            ],
        }
    );

    return ActiveBoost;
};
