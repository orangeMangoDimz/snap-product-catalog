const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");
const path = require("path");
const fs = require("fs");
const config = require("./index");

let db;

const connectDB = async () => {
    try {
        const dbDir = path.dirname(config.db.path);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }

        db = await open({
            filename: config.db.path,
            driver: sqlite3.Database,
        });

        await db.exec("PRAGMA foreign_keys = ON");

        console.log("Connection established successfully");
    } catch (error) {
        console.log("Connection established failed: ", error.message);
        process.exit(1);
    }
};

const getDB = () => {
    if (!db) {
        throw new Error("Database is not set up")
    }
    return db
}

module.exports = { connectDB, getDB };
