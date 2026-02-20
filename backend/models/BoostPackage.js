const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const BoostPackage = sequelize.define(
        "BoostPackage",
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
                comment: "Name of the package (e.g., 24 Hours, 7 Days)",
            },
            durationDays: {
                type: DataTypes.DECIMAL(10, 6),
                allowNull: false,
                comment: "Duration in days (e.g., 1.0 for 24 hours, 0.000694 for 1 minute)",
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },
            isEnabled: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
        },
        {
            tableName: "boost_packages",
            timestamps: true,
        }
    );

    return BoostPackage;
};
