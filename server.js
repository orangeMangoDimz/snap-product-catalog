const app = require("./app");
const config = require("./config");
const { connectDB } = require("./config/database");
const Logger = require("./src/utils/logger");
const redisService = require("./src/utils/redis");

connectDB();

redisService.connect().catch(err => {
    Logger.error(`Failed to connect to redis: ${err.message}`);
});

const server = app.listen(config.port, () => {
    Logger.info(`Server is running on port ${config.port}`);
});

process.on("unhandledRejection", (err) => {
    Logger.error("Error Handling server ", err.message);
    server.close(() => process.exit(1));
});

// Handle terminated by system tools
process.on("SIGTERM", async () => {
    Logger.info("Stop redis immediately");
    await redisService.disconnect();
    server.close(() => {
        process.exit(0);
    });
});

// Handle Ctrl+C
process.on("SIGINT", async () => {
    Logger.info("Stop redis immediately");
    await redisService.disconnect();
    server.close(() => {
        process.exit(0);
    });
});