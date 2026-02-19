const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const User = sequelize.define(
        "User",
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },

            first_name: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            last_name: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
                validate: {
                    isEmail: true,
                },
            },
            phone_number: {
                type: DataTypes.STRING(20),
                allowNull: true,
            },
            password: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            auth_provider: {
                type: DataTypes.ENUM("google", "email", "phone", "apple", "github"),
                allowNull: false,
                defaultValue: "email",
            },
            is_blocked: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            last_login_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM("active", "disabled"),
                defaultValue: "active",
            },
            is_phone_verified: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            is_email_verified: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            email_otp_code: {
                type: DataTypes.STRING(10),
                allowNull: true,
            },
            email_otp_expires_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            otp_code: {
                type: DataTypes.STRING(10),
                allowNull: true,
            },
            otp_expires_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            profile_pic: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            tableName: "users",
            timestamps: true,
            paranoid: false,
        }
    );

    return User;
};
