const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    // Table to log individual search queries
    const SearchLog = sequelize.define(
        "SearchLog",
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            search_term: {
                type: DataTypes.STRING(255),
                allowNull: false,
                comment: "The search term entered by the user"
            },
            userId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: true,
                comment: "ID of the user who performed the search (null for anonymous users)"
            },
            ipAddress: {
                type: DataTypes.STRING(45),
                allowNull: true,
                comment: "IP address of the user (anonymized if required)"
            },
            userAgent: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: "User agent string for analytics"
            },
            resultsCount: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                defaultValue: 0,
                comment: "Number of results returned for this search"
            },
            referrer: {
                type: DataTypes.STRING(500),
                allowNull: true,
                comment: "Page that referred the user to the search"
            }
        },
        {
            tableName: "search_logs",
            timestamps: true,
            indexes: [
                {
                    name: "idx_search_term",
                    fields: ["search_term"]
                },
                {
                    name: "idx_created_at",
                    fields: ["createdAt"]
                },
                {
                    name: "idx_user_id",
                    fields: ["userId"]
                }
            ]
        }
    );

    // Table to track popular searches (aggregated data)
    const PopularSearch = sequelize.define(
        "PopularSearch",
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            search_term: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
                comment: "The popular search term"
            },
            searchCount: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                defaultValue: 1,
                comment: "Total number of times this term has been searched"
            },
            lastSearchedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
                comment: "When this term was last searched"
            }
        },
        {
            tableName: "popular_searches",
            timestamps: true,
            indexes: [
                {
                    name: "idx_search_count",
                    fields: ["searchCount"],
                    order: "DESC"
                },
                {
                    name: "idx_last_searched_at",
                    fields: ["lastSearchedAt"],
                    order: "DESC"
                }
            ]
        }
    );

    return { SearchLog, PopularSearch };
};