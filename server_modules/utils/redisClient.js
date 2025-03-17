// redisClient.js
import { createClient } from '@redis/client';

const redisClient = createClient({
  url: 'redis://127.0.0.1:6379', // або ваш Redis сервер
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();  // Підключення до Redis тільки якщо ще не підключено
  }
}

export { redisClient, connectRedis };