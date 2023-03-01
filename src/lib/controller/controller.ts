import { Request, Response } from "express";
import { Cache } from "../models/cache.model";

interface CacheConfig {
  cacheExpiry: number;
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
        cache.ttl = new Date(Date.now() + this.config.cacheExpiry); // Reset TTL on cache hit
        await cache.save();
        res.status(200).json({ value: cache.value });
      } else {
        console.log("Cache miss");
        const value = this.generateRandomString(10);
        const newCache = await Cache.create({
          key,
          value,
          ttl: new Date(Date.now() + this.config.cacheExpiry),
        });
        res.status(200).json({ key: newCache.key, value: newCache.value });
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
