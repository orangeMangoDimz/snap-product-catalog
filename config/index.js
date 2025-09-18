const dotenv = require("dotenv");
dotenv.config();

module.exports = {
    env: process.env.NODE_ENV || "development",
    port: process.env.PORT || 3000,
    db: {
        path: process.env.DB_PATH || "./data/database.sqlite",
    },
    gemini: {
        apiKey: process.env.GEMINI_API_KEY,
    },
    redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || null,
        db: process.env.REDIS_DB || 0,
        ttl: process.env.REDIS_TTL || 5 * 60,  // 5 minutes to prevent long inconsistency data product
    },
    api: {
        prefix: process.env.API_PREFIX || "/api/v1",
    },
};
