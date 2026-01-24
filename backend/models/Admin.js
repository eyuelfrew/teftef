const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Admin = sequelize.define(
        "Admin",
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            first_name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            last_name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
                validate: {
                    isEmail: true,
                },
            },
            password: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            is_super_admin: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            status: {
                type: DataTypes.ENUM("active", "disabled"),
                defaultValue: "active",
            },
        },
        {
            tableName: "admins",
            timestamps: true,
            paranoid: false,
        }
    );

    return Admin;
};


