import express, { Express } from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { AppRouter } from "./routes/route";
dotenv.config();
import { Controller } from "./controller/controller";
interface AppConfig {
  port: number;
  databaseUri: string;
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
    const port = Number(process.env.PORT) ?? 3000;
    const databaseUri =
      process.env.DATABASE_URI ?? "mongodb://localhost:27017/cache";
    return { port, databaseUri };
  }

  public start(): void {
    this.server.listen(this.config.port, () => {
      console.log(`Server started at http://localhost:${this.config.port}`);
    });
  }

  private initMiddleware(): void {
    this.server.use(express.json());
    this.server.use(cors());
    this.server.set("X-Powered-By", false);
    this.server.set("name", "Cache API");
    this.server.set("version", "1.0.0");
  }

  private initRoutes(): void {
    const cacheController = new Controller();
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
