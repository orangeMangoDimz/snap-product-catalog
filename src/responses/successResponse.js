const SuccessResponse = (res, statusCode = 200, data, message = "Success") => {
    return res.status(statusCode).json({
        status: "success",
        message,
        data,
    });
};

module.exports = SuccessResponse;
