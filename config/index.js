const dotenv = require("dotenv");
dotenv.config();

module.exports = {
    env: process.env.NODE_ENV || "development",
    port: process.env.PORT || 3000,
    db: {
        path: process.env.DB_PATH || "./data/database.sqlite",
    },
    api: {
        prefix: process.env.API_PREFIX || "/api/v1",
    },
};
