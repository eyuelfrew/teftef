const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Sponsorship = sequelize.define(
        "Sponsorship",
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            company_name: {
                type: DataTypes.STRING(100),
                allowNull: false,
                comment: "Name of the partner company (e.g., Ride, Betting App)",
            },
            title: {
                type: DataTypes.STRING(150),
                allowNull: false,
                comment: "Promotional title (e.g., 50% Off First Ride)",
            },
            image_url: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            external_link: {
                type: DataTypes.STRING(500),
                allowNull: false,
                comment: "The destination URL for this partner",
            },
            priority: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            start_date: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            end_date: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            tableName: "sponsorships",
            timestamps: true,
            paranoid: false,
        }
    );

    return Sponsorship;
};
