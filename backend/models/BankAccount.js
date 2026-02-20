const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const BankAccount = sequelize.define(
        "BankAccount",
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
                comment: "Account Holder Name",
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
            tableName: "bank_accounts",
            timestamps: true,
        }
    );

    return BankAccount;
};
