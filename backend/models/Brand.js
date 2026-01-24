const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Brand = sequelize.define(
        "Brand",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            logo: {
                type: DataTypes.STRING(255),
            },
            primary_color: {
                type: DataTypes.STRING(7),
            },
            secondary_color: {
                type: DataTypes.STRING(7),
            },
            description: {
                type: DataTypes.TEXT,
            },
            status: {
                type: DataTypes.ENUM('active', 'inactive'),
                defaultValue: 'active',
            },
        },
        {
            tableName: "brands",
            timestamps: true,
        }
    );

    return Brand;
};
