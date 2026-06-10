import { ApiError } from "../utils/ApiError.js";

export const errorHandler = (err, _req, res, _next) => {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : err.statusCode || 500;

  if (!isApiError) {
    console.error(err);
  }

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message: err.message || "Something went wrong",
    errors: err.errors || [],
  });
};
