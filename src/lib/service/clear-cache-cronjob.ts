import cron from "node-cron";
import { Cache } from "../models/cache.model";

// Schedule a cron job to run every minute to remove the expired cached items
// Configure the cron job interval in the .env or in app.ts
export function startCronJob(interval: string) {
  cron.schedule(interval, async () => {
    console.log("Running cron job to delete expired cached items");
    try {
      const expiredCache = await Cache.find({ ttl: { $lt: new Date() } });
      if (expiredCache.length > 0) {
        await Cache.deleteMany({ ttl: { $lt: new Date() } });
        console.log(`Deleted ${expiredCache.length} expired cached items`);
      }
    } catch (err) {
      console.error("Error in cron job:", err);
    }
  });
}
