const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const PaymentAgent = sequelize.define(
        "PaymentAgent",
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            bankName: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            accountNumber: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            isEnabled: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
        },
        {
            tableName: "payment_agents",
            timestamps: true,
        }
    );

    return PaymentAgent;
};
