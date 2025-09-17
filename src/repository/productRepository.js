const { getDB } = require("../../config/database");
const { InternalServerError } = require("../utils/error");
const Logger = require("../utils/logger");
const productModel = require("../models/productModel");

const createProduct = async (product) => {
    try {
        const db = getDB();
        const q =
            "INSERT INTO products (name, price, category, image_url, description) VALUES (?, ?, ?, ?, ?)";
        const result = await db.run(q, [
            product.name,
            product.price,
            product.category,
            product.image_url,
            product.description,
        ]);
        return productModel.toJSON(result);
    } catch (err0r) {
        Logger.error(`Failed to create product: ${error}`);
        throw new InternalServerError(error.message);
    }
};

const getProducts = async (offset, limit) => {
    try {
        const db = getDB();
        const q = "SELECT * FROM products LIMIT ? OFFSET ?";
        const products = await db.all(q, [limit, offset]);
        return products.map((product) => productModel.toJSON(product));
    } catch (error) {
        Logger.error(`Failed to get products: ${error}`);
        throw new InternalServerError(error.message);
    }
};

const getTotalProducts = async () => {
    const db = getDB();
    const q = "SELECT COUNT(*) as total FROM products";
    const result = await db.get(q);
    return result.total
};

const getProductByID = async (id) => {
    const db = getDB();
    const product = await db.get("SELECT * FROM products WHERE id = ?", [id]);
    return product ? productModel.toJSON(product) : null;
};

module.exports = {
    createProduct,
    getProducts,
    getProductByID,
    getTotalProducts,
};
