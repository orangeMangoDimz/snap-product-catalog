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
    } catch (error) {
        Logger.error(`Failed to create product`, error);
        throw new InternalServerError(error);
    }
};

const getProducts = async (limit, offset, q, filter) => {
    try {
        const db = getDB();
        let sqlQuery =
            "SELECT id, name, price, category, image_url, description FROM products";

        let queryParams = [];

        if (q != "" && filter != "") {
            sqlQuery += " WHERE name LIKE ? AND category = ?";
            queryParams = [`%${q}%`, filter];
        } else if (q != "") {
            sqlQuery += " WHERE name LIKE ?";
            queryParams = [`%${q}%`];
        } else if (filter != "") {
            sqlQuery += " WHERE category = ?";
            queryParams = [filter];
        }
        sqlQuery += " LIMIT ? OFFSET ?";
        const products = await db.all(sqlQuery, [
            ...queryParams,
            limit,
            offset,
        ]);
        return products.map((product) => productModel.toJSON(product));
    } catch (error) {
        Logger.error(`Failed to get products`, error);
        throw new InternalServerError(error);
    }
};

const getTotalProducts = async (q, filter) => {
    try {
        const db = getDB();
        let sqlQuery = "SELECT COUNT(*) as total FROM products";
        let queryParams = [];
        if (q != "" && filter != "") {
            sqlQuery += " WHERE name LIKE ? AND category = ?";
            queryParams = [q, filter];
        } else if (q != "") {
            sqlQuery += " WHERE name LIKE ?";
        } else if (filter != "") {
            sqlQuery += " WHERE category = ?";
            queryParams = [filter];
        }
        const result = await db.get(sqlQuery, [...queryParams]);
        return result.total;
    } catch (error) {
        Logger.error(`Failed to get total products`, error);
        throw new InternalServerError(error);
    }
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
