const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const CategoryAttribute = sequelize.define(
        "CategoryAttribute",
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            category_id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                // No foreign key constraint as per requirements
            },
            field_label: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            field_type: {
                type: DataTypes.ENUM("text", "number", "dropdown"),
                allowNull: false,
            },
            field_options: {
                type: DataTypes.JSON,
                allowNull: true, // Only used for dropdowns
                defaultValue: [],
            },
            is_required: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        },
        {
            tableName: "category_attributes",
            timestamps: true,
            indexes: [
                {
                    fields: ["category_id"],
                },
            ],
        }
    );

    return CategoryAttribute;
};
