import express, { Express, Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { AppRouter } from "./routes/route";
dotenv.config();
import { Controller } from "./controller/controller";
interface AppConfig {
  port: number;
  databaseUri: string;
  cacheExpiry: number;
  maxEntries: number;
}

class App {
  private static instance: App;
  private server: Express;
  private config: AppConfig;

  private constructor(config: AppConfig) {
    this.server = express();
    this.config = config;
    this.initMiddleware();
    this.initRoutes();
    this.connectDb();
  }

  public static getInstance(): App {
    if (!App.instance) {
      const config = this.loadConfig();
      App.instance = new App(config);
    }
    return App.instance;
  }

  static loadConfig(): AppConfig {
    const port = process.env.PORT ? Number(process.env.PORT) : 4000;
    const databaseUri =
      process.env.DATABASE_URI ?? "mongodb://localhost:27017/cache";
    const cacheExpiry = process.env.CACHE_EXPIRY
      ? Number(process.env.CACHE_EXPIRY)
      : 600000;
    const maxEntries = process.env.MAX_ENTRIES
      ? Number(process.env.MAX_ENTRIES)
      : 100;
    return { port, databaseUri, cacheExpiry, maxEntries };
  }

  public start(): void {
    this.server.listen(this.config.port, () => {
      console.log(`Server started at http://localhost:${this.config.port}`);
    });
    console.log("Server up & running", this.config);
  }

  private initMiddleware(): void {
    this.server.use(express.json());
    this.server.use(cors());
    this.server.set("X-Powered-By", false);
    this.server.set("name", "Cache API");
    this.server.set("version", "1.0.0");
  }

  private initRoutes(): void {
    this.server.get("/", (req: Request, res: Response) => {
      res.send("Server up & running ");
    });
    const cacheController = new Controller({
      cacheExpiry: this.config.cacheExpiry,
      maxEntries: this.config.maxEntries,
    });
    const router = new AppRouter(cacheController).router;
    this.server.use("/cache", router);
  }

  private connectDb(): void {
    mongoose.set("strictQuery", true);
    mongoose
      .connect(this.config.databaseUri)
      .then(() => {
        console.log("Database connection successful");
      })
      .catch((err) => {
        console.error("Database connection error:", err);
        process.exit(1);
      });
  }
}

export default App.getInstance();
