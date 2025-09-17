const productService = require("../../service/productService");

const getProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        await productService.getProducts( res, page, limit);
    } catch (error) {
        next(error);
    }
};

const getProductByID = async (req, res, next) => {
    try {
        const productID = req.params.id;
        await productService.getProductByID(productID, res);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProducts,
    getProductByID,
};
