import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema, source: "body" | "query" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const input = source === "query" ? req.query : req.body;
    const result = schema.safeParse(input);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return res.status(400).json({ message: "Validation failed", errors });
    }

    if (source === "query") {
      res.locals.validatedQuery = result.data;
    } else {
      req.body = result.data;
    }

    return next();
  };
