const geminiModel = require("../models/geminiModel");
const config = require("../../config");
const { InternalServerError, NotFoundError } = require("../utils/error");
const productRepository = require("../repository/productRepository");
const Logger = require("../utils/logger");
const SuccessResponse = require("../responses/successResponse");
const { StatusCodes } = require("http-status-codes");

const getProductSummary = async (res, productID) => {
    try {
        // Get the product
        const product = await productRepository.getProductByID(productID);
        if (!product) {
            throw new NotFoundError("Product not found");
        }

        const productDescription = product.description;

        const apiKey = config.gemini.apiKey;
        if (!apiKey) {
            throw new InternalServerError("Gemini API key is not set");
        }
        const gemini = new geminiModel(config.gemini.apiKey);
        const summary = await gemini.getProductSummary(productDescription, productID);

        return SuccessResponse(res, StatusCodes.OK, summary, "Product summary fetched successfully.");
    } catch (error) {
        if (error instanceof NotFoundError) {
            Logger.error(`Product not found: ${error}`);
            throw new NotFoundError(error.message);
        }
        Logger.error(`Failed to get product summary: ${error}`);
        throw new InternalServerError(error.message);
    }
};

module.exports = { getProductSummary };
