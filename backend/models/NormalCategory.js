const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const NormalCategory = sequelize.define(
        "NormalCategory",
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
            image: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            displayOrder: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                defaultValue: 0,
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
        },
        {
            tableName: "normal_categories",
            timestamps: true,
        }
    );

    return NormalCategory;
};
