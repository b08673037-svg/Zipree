// Central error handler. Every error in the app ends up here as a consistent JSON shape:
//   { success: false, message: "...", ...optional details }
// Must be mounted LAST in app.js (after all routes and notFound).

export default function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isDev = process.env.NODE_ENV === "development";

  const payload = {
    success: false,
    message: err.message || "Internal Server Error",
  };

  // Only expose stack traces in development.
  if (isDev && err.stack) {
    payload.stack = err.stack;
  }

  // Log server-side for visibility during development.
  if (statusCode >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl} →`, err);
  }

  res.status(statusCode).json(payload);
}