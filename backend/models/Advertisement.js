const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Advertisement = sequelize.define(
        "Advertisement",
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            title: {
                type: DataTypes.STRING(100),
                allowNull: false,
                comment: "Internal name for the ad",
            },
            ad_type: {
                type: DataTypes.ENUM("interstitial_popup", "mini_popup", "home_banner", "category_banner"),
                allowNull: false,
            },
            image_url: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            target_type: {
                type: DataTypes.ENUM("category", "product", "external_url"),
                allowNull: false,
                comment: "What happens when the ad is clicked",
            },
            target_id: {
                type: DataTypes.STRING(100), // Using String to be flexible (can store int ID or UUID)
                allowNull: true,
                comment: "ID of the category or product if target_type is category/product",
            },
            external_link: {
                type: DataTypes.STRING(500),
                allowNull: true,
                comment: "URL if target_type is external_url",
            },
            priority: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                comment: "Higher number means higher priority",
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
        },
        {
            tableName: "advertisements",
            timestamps: true,
            paranoid: false, // Hard delete is fine for ads
        }
    );

    return Advertisement;
};
