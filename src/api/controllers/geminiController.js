const geminiService = require("../../service/geminiService");

const getProductSummary = async (req, res, next) => {
    try {
      const productID = req.body.id;
        await geminiService.getProductSummary(res, productID);
    } catch (error) {
        next(error);
    }
};


module.exports = {
    getProductSummary,
};
