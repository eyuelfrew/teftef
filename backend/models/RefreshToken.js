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
                indexes: true, // ✅ Fast lookup by user
            },
            token_hash: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true, // ✅ Fast lookup + prevent duplicates
            },
            expires_at: {
                type: DataTypes.DATE,
                allowNull: false,
                indexes: true, // ✅ Fast cleanup of expired tokens
            },
            device_info: {
                type: DataTypes.STRING(255),
                allowNull: true,
                comment: "Device/browser info (e.g., 'Chrome on Windows')",
            },
            ip_address: {
                type: DataTypes.STRING(45),
                allowNull: true,
                comment: "IP address when token was issued",
            },
            is_revoked: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                comment: "Soft delete for token revocation",
            },
        },
        {
            tableName: "refresh_tokens",
            timestamps: true,
            updatedAt: false, // Only track creation time
            indexes: [
                {
                    fields: ["user_id", "is_revoked"],
                    name: "idx_user_active_tokens"
                },
                {
                    fields: ["expires_at"],
                    name: "idx_expired_tokens",
                    where: { is_revoked: false }
                }
            ]
        }
    );

    return RefreshToken;
};
