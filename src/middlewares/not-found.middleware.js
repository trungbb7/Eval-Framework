import { AppError } from "#src/utils/AppError.js";

export function notFoundMiddleware(req, res, next) {
  next(
    new AppError(
      `Route ${req.method} ${req.originalUrl} not found`,
      404,
      "ROUTE_NOT_FOUND",
    ),
  );
}
