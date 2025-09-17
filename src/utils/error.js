const { StatusCodes } = require("http-status-codes");

class BaseError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends BaseError {
    constructor(message = "Invalid input data") {
        super(message, StatusCodes.BAD_REQUEST);
    }
}

class NotFoundError extends BaseError {
    constructor(message = "Resource not found") {
        super(message, StatusCodes.NOT_FOUND);
    }
}

class InternalServerError extends BaseError {
    constructor(message = "Something went wrong") {
        super(message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

module.exports = {
    BaseError,
    ValidationError,
    NotFoundError,
    InternalServerError,
};
