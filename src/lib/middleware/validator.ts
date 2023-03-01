import { Request, Response, NextFunction } from "express";
import HttpStatusCodes from "../utils/httpStatusCodes";

export const validate = (req: Request, res: Response, next: NextFunction) => {
  if (!req.body) {
    return res
      .status(HttpStatusCodes.BAD_REQUEST)
      .json({ error: "Missing request body" });
  }
  const key = req.body.key;
  if (key === undefined || key === null) {
    return res
      .status(HttpStatusCodes.BAD_REQUEST)
      .json({ error: "Key is required" });
  } else if (typeof key !== "string") {
    return res
      .status(HttpStatusCodes.BAD_REQUEST)
      .json({ error: "Key must be a string" });
  } else {
    if (key.trim() === "") {
      return res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ error: "Key must not be empty" });
    }
  }
  next();
};
