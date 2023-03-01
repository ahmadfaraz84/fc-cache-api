import express, { Express, Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { AppRouter } from "./routes/route";
dotenv.config();
import { Controller } from "./controller/controller";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import HttpStatusCodes from "./utils/httpStatusCodes";
import { startCronJob } from "./service/clear-cache-cronjob";

interface AppConfig {
  port: number;
  databaseUri: string;
  timeToLive: number;
  maxEntries: number;
  jobInterval: string;
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
    this.initSwagger();
  }

  public static getInstance = (): App => {
    if (!App.instance) {
      const config = this.loadConfig();
      App.instance = new App(config);
    }
    return App.instance;
  };

  static loadConfig = (): AppConfig => {
    const port = process.env.PORT ? Number(process.env.PORT) : 4000;
    const databaseUri =
      process.env.DATABASE_URI ?? "mongodb://localhost:27017/cache";
    const timeToLive = process.env.TIME_TO_LIVE
      ? Number(process.env.TIME_TO_LIVE)
      : 600000;
    const maxEntries = process.env.MAX_ENTRIES
      ? Number(process.env.MAX_ENTRIES)
      : 100;
    const jobInterval = process.env.JOB_INTERVAL ?? "* * * * *";
    return { port, databaseUri, timeToLive, maxEntries, jobInterval };
  };

  public start = (): void => {
    this.server.listen(this.config.port, () => {
      console.log(`Server started at http://localhost:${this.config.port}`);
    });
    startCronJob(this.config.jobInterval);
  };

  private initMiddleware = (): void => {
    this.server.use(express.json());
    this.server.use(cors());
    this.server.set("X-Powered-By", false);
    this.server.set("name", "Cache API");
    this.server.set("version", "1.0.0");
  };

  private initRoutes = (): void => {
    this.server.get("/", (req: Request, res: Response) => {
      res.status(HttpStatusCodes.OK).send("Server up & running ");
    });
    const cacheController = new Controller({
      timeToLive: this.config.timeToLive,
      maxEntries: this.config.maxEntries,
    });
    const router = new AppRouter(cacheController).router;
    this.server.use("/cache", router);
  };

  private connectDb = (): void => {
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
  };

  private initSwagger = (): void => {
    const swaggerOptions = {
      swaggerDefinition: {
        openapi: "3.0.0",
        info: {
          title: "Cache API",
          version: "1.0.0",
          description: "API for caching data",
        },
      },
      apis: ["./src/lib/swagger/swagger-docs.yaml"],
    };
    const swaggerDocs = swaggerJsDoc(swaggerOptions);
    this.server.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  };
}

export default App.getInstance();
