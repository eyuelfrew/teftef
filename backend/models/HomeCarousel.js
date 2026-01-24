const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const HomeCarousel = sequelize.define(
        "HomeCarousel",
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
            image_url: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            target_category_id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: true,
            },
            category_type: {
                type: DataTypes.ENUM("rooted", "normal"),
                allowNull: false,
                defaultValue: "rooted",
            },
            priority: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
        },
        {
            tableName: "home_carousels",
            timestamps: true,
        }
    );

    return HomeCarousel;
};
