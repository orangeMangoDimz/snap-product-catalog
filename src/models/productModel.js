class productModel {
    static toJSON(product) {
        return {
            id: product.id,
            name: product.name,
            price: product.price,
            category: product.category,
            image_url: product.image_url,
            description: product.description,
        };
    }
}

module.exports = productModel;
