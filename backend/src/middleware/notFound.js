// Catches any request that didn't match a route and forwards it to the error handler.

export default function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}