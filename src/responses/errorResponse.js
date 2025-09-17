const ErrorResponse = (
    res,
    statusCode = 500,
    message = "An error occurred"
) => {
    return res.status(statusCode).json({
        status: "error",
        message,
    });
};

module.exports = ErrorResponse;
