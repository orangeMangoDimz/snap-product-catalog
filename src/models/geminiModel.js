const { InternalServerError } = require("../utils/error");
const Logger = require("../utils/logger");
const { GoogleGenAI } = require("@google/genai");
const redisService = require("../utils/redis");

class geminiModel {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.ai = new GoogleGenAI(this.apiKey);
    }

    async getProductSummary(productDescription, productId) {
        try {
            // Create cache key using Product:ID format
            const cacheKey = `Product:${productId}`;

            // Check Redis cache first
            const cachedSummary = await redisService.get(cacheKey);
            if (cachedSummary) {
                Logger.info(`Returning cached summary for key: ${cacheKey}`);
                return cachedSummary;
            }

            // If not cached, make API call to Gemini
            Logger.info(`Cache miss, making API call for key: ${cacheKey}`);
            const instruction = `
            You are a helpful assistant that can summarize product descriptions
            Below is the product description:
            ${productDescription}
            Please summarize the product description with max 1 sentence, like TL;DR
            `;
            const response = await this.ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: instruction,
            });

            const summary = response.text;

            // Cache the response in Redis
            await redisService.set(cacheKey, summary);
            Logger.info(`Cached summary for key: ${cacheKey}`);

            return summary;
        } catch (error) {
            Logger.error(`Failed to get product summary: ${error}`);
            throw new InternalServerError(error.message);
        }
    }
}

module.exports = geminiModel;
