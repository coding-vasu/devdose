import { Request, Response, NextFunction } from "express";

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Error:", err);

  // Default error
  let status = 500;
  let error = "Internal Server Error";
  let message = "An unexpected error occurred";

  // Handle specific error types
  if (err.status) {
    status = err.status;
  }

  if (err.message) {
    message = err.message;
  }

  // Supabase errors
  if (err.code) {
    if (err.code === "PGRST116") {
      status = 404;
      error = "Not Found";
      message = "Resource not found";
    } else if (err.code === "22P02") {
      status = 400;
      error = "Bad Request";
      message = "Invalid UUID format";
    }
  }

  res.status(status).json({
    error,
    message,
    ...(process.env.NODE_ENV === "development" && { details: err }),
  });
}
