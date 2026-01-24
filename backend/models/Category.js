const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const RootedCategory = sequelize.define(
        "RootedCategory",
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING(150),
                allowNull: false,
            },
            parentId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            image: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            color: {
                type: DataTypes.STRING(20),
                allowNull: true,
            },
            displayOrder: {
                // for custom sorting in UI
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                defaultValue: 0,
            },
            level: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                defaultValue: 1, // 1 for Root, 2 for Sub, 3 for Leaf
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
        },
        {
            tableName: "rooted_categories",
            timestamps: true,
        }
    );

    return RootedCategory;
};


