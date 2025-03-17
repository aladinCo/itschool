import { redisClient, connectRedis } from "../redisClient.js";
import Queue from "bull";

// Підключення до Redis
connectRedis();

// Ініціалізація черг
export const singleTestQueue = new Queue("singleTestQueue", { redis: { client: redisClient } });
export const batchTestQueue = new Queue("batchTestQueue", { redis: { client: redisClient } });
export const compileQueue = new Queue("compileQueue", { redis: { client: redisClient } });


