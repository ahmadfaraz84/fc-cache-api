import request from "supertest";
import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import app from "../src/lib/app";
// import { Cache } from "../dist/lib/models/cache.model";

let server: any;

beforeAll(async () => {
  server = app.server.listen(4000);
});

afterAll(async () => {
  process.exit(1);
});

describe("Cache API", () => {
  describe("Happy Flows", () => {
    test("Successful creation", async () => {
      const res = await request(app.server).get("/cache");
      expect(res.status).toEqual(200);
      expect(res.body).toEqual(expect.any(Array));
    });
  });
});
