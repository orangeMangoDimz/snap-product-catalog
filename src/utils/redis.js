const redis = require("redis");
const config = require("../../config");
const Logger = require("./logger");

class RedisService {
    constructor() {
        this.client = null;
        this.isConnected = false;
    }

    async connect() {
        try {
            this.client = redis.createClient({
                host: config.redis.host,
                port: config.redis.port,
                password: config.redis.password,
                db: config.redis.db,
            });

            // Handle all redis events
            this.client.on("error", (err) => {
                Logger.error(`Redis client error: ${err}`);
                this.isConnected = false;
            });

            this.client.on("connect", () => {
                Logger.info("Redis client connected");
                this.isConnected = true;
            });

            this.client.on("ready", () => {
                Logger.info("Redis client ready");
                this.isConnected = true;
            });

            this.client.on("end", () => {
                Logger.info("Redis client disconnected");
                this.isConnected = false;
            });

            await this.client.connect();
        } catch (error) {
            Logger.error(`Failed to connect to Redis: ${error.message}`);
            this.isConnected = false;
        }
    }

    async disconnect() {
        try {
            if (this.client && this.isConnected) {
                await this.client.disconnect();
                Logger.info("Redis client disconnected");
            }
        } catch (error) {
            Logger.error(`Error disconnecting redis: ${error.message}`);
        }
    }

    async get(key) {
        try {
            if (!this.isConnected) {
                Logger.warn("Redis not connected");
                return null;
            }
            
            const value = await this.client.get(key);
            if (value) {
                Logger.info(`Cache hit for key: ${key}`);
                return JSON.parse(value);
            }
            
            Logger.info(`Cache miss for key: ${key}`);
            return null;
        } catch (error) {
            Logger.error(`Redis get error for key ${key}: ${error.message}`);
            return null;
        }
    }

    async set(key, value, ttl = config.redis.ttl) {
        try {
            if (!this.isConnected) {
                Logger.warn("Redis is not connected");
                return false;
            }

            const serializedValue = JSON.stringify(value);
            await this.client.setEx(key, ttl, serializedValue);
            return true;
        } catch (error) {
            Logger.error(` Error for key ${key} on redis: ${error.message}`);
            return false;
        }
    }

    async del(key) {
        try {
            if (!this.isConnected) {
                Logger.warn("Redis is not connected");
                return false;
            }

            const result = await this.client.del(key);
            return result > 0;
        } catch (error) {
            Logger.error(` Error for key ${key} on redis: ${error.message}`);
            return false;
        }
    }

    async exists(key) {
        try {
            if (!this.isConnected) {
                return false;
            }

            const exists = await this.client.exists(key);
            return exists === 1;
        } catch (error) {
            Logger.error(` Error for key ${key} on redis: ${error.message}`);
            return false;
        }
    }

    isHealthy() {
        return this.isConnected;
    }
}

// Create a singleton instance
const redisService = new RedisService();

module.exports = redisService;
