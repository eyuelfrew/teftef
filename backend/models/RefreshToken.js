const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const RefreshToken = sequelize.define(
        "RefreshToken",
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            user_id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
            },
            token_hash: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            expires_at: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        },
        {
            tableName: "refresh_tokens",
            timestamps: true,
            updatedAt: false, // Only track creation time
        }
    );

    return RefreshToken;
};
