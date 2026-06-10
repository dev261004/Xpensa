import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";

const formatZodErrors = (error) =>
  error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));

export const validate = (schema) => (req, _res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    req.body = parsed.body ?? req.body;
    req.params = parsed.params ?? req.params;
    req.validated = parsed;
    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      return next(new ApiError(400, "Validation failed", formatZodErrors(error)));
    }
    return next(error);
  }
};
