import { Request, Response } from "express";
import { Cache, ICache } from "../models/cache.model";

interface CacheConfig {
  timeToLive: number;
  maxEntries: number;
}

export class Controller {
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
  }

  getAllCacheKeys = async (req: Request, res: Response): Promise<void> => {
    try {
      const caches = await Cache.find({}, { key: 1 });
      res.status(200).json(caches.map((cache) => cache.key));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  getCacheByKey = async (req: Request, res: Response): Promise<void> => {
    try {
      const key = req.params.key;
      const cache = await Cache.findOne({ key });
      if (cache) {
        console.log("Cache hit");
        cache.ttl = new Date(Date.now() + this.config.timeToLive); // Reset TTL on cache hit
        await cache.save();
        res.status(200).json({ value: cache.value });
      } else {
        console.log("Cache miss");
        const value = this.generateRandomString(10);
        const newCache = await this.createCache(key, value);
        res.status(201).json({ key: newCache.key, value: newCache.value });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  removeCacheByKey = async (req: Request, res: Response): Promise<void> => {
    try {
      const key = req.params.key;
      await Cache.deleteOne({ key });
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  removeAllCache = async (req: Request, res: Response): Promise<void> => {
    try {
      await Cache.deleteMany({});
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  createOrUpdateCache = async (req: Request, res: Response): Promise<void> => {
    const { key } = req.body;
    const value = this.generateRandomString(10);
    try {
      let cache = await Cache.findOne({ key });
      if (cache) {
        cache.value = value;
        cache.ttl = new Date(Date.now() + this.config.timeToLive);
        await cache.save();
        res.status(200).json({ key: cache.key, value: cache.value });
      } else {
        const newCache = await this.createCache(key, value);
        res.status(201).json({ key: newCache.key, value: newCache.value });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  };

  private async createCache(key: string, value: string): Promise<ICache> {
    const { timeToLive, maxEntries } = this.config;

    // Check if cache count exceeds the maximum entries
    const count = await Cache.countDocuments();
    if (count >= maxEntries) {
      // If the limit is exceeded, find the oldest cache item and overwrite it
      const oldestCache = await Cache.findOne().sort({ ttl: 1 });
      if (oldestCache) {
        oldestCache.key = key;
        oldestCache.value = value;
        oldestCache.ttl = new Date(Date.now() + timeToLive);
        return await oldestCache.save();
      }
    }

    // If the limit is not exceeded, create a new cache item
    const cache = new Cache({
      key,
      value,
      ttl: new Date(Date.now() + timeToLive),
    });
    return await cache.save();
  }

  private generateRandomString(length: number): string {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }
}
