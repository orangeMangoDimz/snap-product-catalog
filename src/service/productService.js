const productRepository = require("../repository/productRepository");
const ErrorResponse = require("../responses/errorResponse");
const SuccessResponse = require("../responses/successResponse");
const { ValidationError, NotFoundError } = require("../utils/error");
const Logger = require("../utils/logger");
const { StatusCodes } = require("http-status-codes");
const redisService = require("../utils/redis");

const getProducts = async (res, page, limit, q, filter) => {
    try {
        const offset = (page - 1) * limit;

        const cacheKey = `Product:page:${page}:limit:${limit}:q:${q}:filter:${filter}`;

        let products = [];
        let total = 0;

        const cachedData = await redisService.get(cacheKey);
        if (cachedData) {
            Logger.info(`Returning cached products for key: ${cacheKey}`);
            products = cachedData.products;
            total = cachedData.total;
        } else {
            products = await productRepository.getProducts(limit, offset, q, filter);
            total = await productRepository.getTotalProducts(q, filter);

            const dataToCache = { products, total };
            await redisService.set(cacheKey, dataToCache);
        }

        const paginationData = {
            page,
            limit,
            total,
            products,
        };

        return SuccessResponse(
            res,
            StatusCodes.OK,
            paginationData,
            "Products fetched successfully."
        );
    } catch (error) {
        if (error instanceof ValidationError) {
            Logger.warn("Validation check error");
            return ErrorResponse(error, error.statusCode, error.message);
        }
        Logger.error(`Failed to get products: ${error}`);
        return ErrorResponse(
            res,
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Internal server error"
        );
    }
};

const getProductByID = async (productID, res) => {
    try {
        const cacheKey = `Product:${productID}`;

        let product = await redisService.get(cacheKey);

        if (product) {
            Logger.info(`Returning cached product for key: ${cacheKey}`);
        } else {
            product = await productRepository.getProductByID(productID);
            if (!product) {
                throw new NotFoundError("Product not found");
            }
            await redisService.set(cacheKey, product);
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
        Logger.error(`Failed to get product by ID: ${error}`);
        return ErrorResponse(
            res,
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Internal server error"
        );
    }
};

module.exports = { getProducts, getProductByID };
