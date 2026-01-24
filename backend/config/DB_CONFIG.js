const { Sequelize } = require("sequelize");
const mysql = require("mysql2/promise");
require("dotenv").config();

const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;

// Function to create database if it doesn't exist
const createDatabase = async () => {
    try {
        const connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASS,
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
        console.log(`✅ Database '${DB_NAME}' is ready.`);
        await connection.end();
    } catch (error) {
        console.error("❌ Database creation failed:", error.message);
    }
};

// Initialize Sequelize instance (shared across models)
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    dialect: "mysql",
    logging: false, // Disable SQL logs in production logs
});

// Export database utilities
module.exports = { sequelize, createDatabase };