const app = require("./app");
const config = require("./config");
const { connectDB } = require("./config/database");
const Logger = require("./src/utils/logger");

connectDB();

const server = app.listen(config.port, () => {
    Logger.info(`Server is running on port ${config.port}`);
});

process.on("unhandledRejection", (err) => {
    Logger.error("Error Handing server ", err.message);
    server.close(() => process.exit(1));
});