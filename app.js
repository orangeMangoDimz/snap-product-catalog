const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const config = require("./config");
const v1Routes = require("./src/api/routes/v1");
const { SuccessResponse } = require("./src/responses");
const { StatusCodes } = require("http-status-codes");

const app = express();

app.use(helmet());
app.use(express.json());

app.use(cors());
app.options("*", cors()); // TODO: need to adjust later

app.get("/health", (req, res) => {
    const healthData = {
        env: config.api.env,
        status: "ok",
    };
    return SuccessResponse(res, StatusCodes.OK, healthData);
});

app.use(config.api.prefix, v1Routes);

module.exports = app;
