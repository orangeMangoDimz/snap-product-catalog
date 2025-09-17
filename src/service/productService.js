const productRepository = require("../repository/productRepository");
const ErrorResponse = require("../responses/errorResponse");
const SuccessResponse = require("../responses/successResponse");
const { ValidationError, NotFoundError } = require("../utils/error");
const Logger = require("../utils/logger");
const { StatusCodes } = require("http-status-codes");

const getProducts = async (res, page, limit) => {
    try {
        const offset = (page - 1) * limit;
        // Since I'm not using redis for caching, I'm going to call to DB twice to handle pagination
        const products = await productRepository.getProducts(offset, limit);
        const total = await productRepository.getTotalProducts();

        const paginationData = {
            page,
            limit,
            total,
            products,
        };

        return SuccessResponse(
            res,
            StatusCodes.CREATED,
            paginationData,
            "Products fetched successfully."
        );
    } catch (error) {
        if (error instanceof ValidationError) {
            Logger.warn("Validation check error");
            return ErrorResponse(error, error.statusCode, error.message);
        }
        return ErrorResponse(
            res,
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Internal server error"
        );
    }
};

const getProductByID = async (productID, res) => {
    try {
        const product = await productRepository.getProductByID(productID);

        if (!product) {
            throw new NotFoundError("Product not found");
        }

        return SuccessResponse(
            res,
            StatusCodes.OK,
            product,
            "Successfully fetched product"
        );
    } catch (error) {
        if (error instanceof NotFoundError) {
            Logger.warn(`Product with ID ${productID} not found`);
            return ErrorResponse(res, error.statusCode, error.message);
        }
        return ErrorResponse(
            res,
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Internal server error"
        );
    }
};

module.exports = { getProducts, getProductByID };
