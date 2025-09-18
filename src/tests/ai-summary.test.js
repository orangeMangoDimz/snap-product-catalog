const request = require("supertest");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

let testDb;

// Mock the database 
const mockGetDB = jest.fn();
jest.mock("../../config/database", () => ({
    getDB: mockGetDB,
}));


// Mock Gemini model
const mockGeminiModel = {
    getProductSummary: jest.fn(),
};

jest.mock("../models/geminiModel", () => {
    return jest.fn().mockImplementation(() => mockGeminiModel);
});

// Mock config
jest.mock("../../config", () => ({
    env: "test",
    api: {
        prefix: "/api/v1",
    },
    gemini: {
        apiKey: "test-api-key",
    },
}));

const app = require("../../app");
const redisService = require("../utils/redis");

describe("AI Summary API", () => {
    beforeAll(async () => {
        // Create test database 
        testDb = await open({
            filename: ":memory:",
            driver: sqlite3.Database,
        });

        // Create table
        await testDb.exec(`
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                price REAL NOT NULL,
                category TEXT,
                image_url TEXT,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Insert data
        await testDb.run(`
            INSERT INTO products (name, price, category, image_url, description) VALUES 
            ('Test Product 1', 99.99, 'Electronics', 'https://example.com/image1.jpg', 'This is a test product 1'),
            ('Test Product 2', 149.99, 'Electronics', 'https://example.com/image2.jpg', 'This is a test product 2'),
            ('Test Product 3', 29.99, 'Books', 'https://example.com/image3.jpg', 'This is a test product 3')
        `);

        mockGetDB.mockImplementation(() => testDb);
    });

    afterAll(async () => {
        if (testDb) {
            await testDb.close();
        }
    });

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe("POST /api/v1/ai-summary", () => {
        it("Generate AI summary for existing product", async () => {
            // Set redis to null (cache miss)
            redisService.get.mockResolvedValue(null);
            redisService.set.mockResolvedValue(true);

            const mockSummary = "This is a test AI-generated summary for the product.";
            mockGeminiModel.getProductSummary.mockResolvedValue(mockSummary);

            const response = await request(app)
                .post("/api/v1/ai-summary")
                .send({ id: 1 })
                .expect(200);

            expect(response.body.data).toBe(mockSummary);

            // Verify Redis 
            expect(redisService.get).toHaveBeenCalledWith("Product:1");
        });

        it("Return 404", async () => {
            const response = await request(app)
                .post("/api/v1/ai-summary")
                .send({ id: 999 })
                .expect(404);

            expect(mockGeminiModel.getProductSummary).not.toHaveBeenCalled();
        });
    });
});
