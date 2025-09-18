const request = require("supertest");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

let testDb;

// Mock the database 
const mockGetDB = jest.fn();
jest.mock("../../config/database", () => ({
    getDB: mockGetDB,
}));

// Mock Redis service
jest.mock("../utils/redis", () => ({
    get: jest.fn(),
    set: jest.fn(),
    isHealthy: jest.fn(() => true),
}));

const app = require("../../app");
const redisService = require("../utils/redis");

describe("Products API", () => {
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

    describe("GET /api/v1/products", () => {
        it("Handle pagination with params ", async () => {
            // Set redis to null (cache miss)
            redisService.get.mockResolvedValue(null);
            redisService.set.mockResolvedValue(true);

            const response = await request(app)
                .get("/api/v1/products?page=2&limit=2")
                .expect(200);

            expect(response.body.data.page).toBe(2);
            expect(response.body.data.limit).toBe(2);

            // Verify correct cache key was used
            expect(redisService.get).toHaveBeenCalledWith(
                "Product:page:2:limit:2"
            );
        });
    });

    describe("GET /api/v1/products/:id", () => {
        it("Return product by ID", async () => {
            // Set redis to null (cache miss)
            redisService.get.mockResolvedValue(null);
            redisService.set.mockResolvedValue(true);

            const response = await request(app)
                .get("/api/v1/products/1")
                .expect(200);

            // Verify Redis was called correctly
            expect(redisService.get).toHaveBeenCalledWith("Product:1");
        });

        it("Return 404", async () => {
            redisService.get.mockResolvedValue(null);

            const response = await request(app)
                .get("/api/v1/products/999")
                .expect(404);

            expect(response.body).toHaveProperty( "message", "Product not found");
        });
    });
});
