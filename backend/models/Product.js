const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Product = sequelize.define(
        "Product",
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
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
                validate: {
                    min: 0,
                },
            },
            discount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
                validate: {
                    min: 0,
                },
            },
            stock: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                defaultValue: 0,
            },
            status: {
                type: DataTypes.ENUM("draft", "active", "archived"),
                allowNull: false,
                defaultValue: "draft",
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
                comment: "Dynamic attributes for the product based on category",
            },
        },
        {
            tableName: "products",
            timestamps: true,
            paranoid: true, // soft delete support
        }
    );

    return Product;
};


