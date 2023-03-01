import { Router } from "express";
import { Controller } from "../controller/controller";

export class AppRouter {
  public router: Router;

  constructor(cacheController: Controller) {
    this.router = Router();
    this.initRoutes(cacheController);
  }

  private initRoutes(cacheController: Controller): void {
    this.router.get("/:key", cacheController.getCacheByKey);
    this.router.get("/", cacheController.getAllCacheKeys);
    this.router.delete("/:key", cacheController.removeCacheByKey);
    this.router.delete("/", cacheController.removeAllCache);
  }
}
