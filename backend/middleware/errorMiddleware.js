// middleware/errorMiddleware.js

// ❌ 404 NOT FOUND
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// ❌ GLOBAL ERROR HANDLER
// Turns common Mongoose/Express errors into clear messages so the admin panel can show them.
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Bad id in the URL, or a value of the wrong type
  if (err.name === "CastError") {
    statusCode = err.kind === "ObjectId" ? 404 : 400;
    message = err.kind === "ObjectId" ? "Resource not found" : `Invalid value for ${err.path}`;
  }

  // Schema validation (required fields, enums, min/max, email format…)
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors || {})
      .map((item) => item.message)
      .join(", ") || message;
  }

  // Unique index clash, e.g. duplicate email
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `A record with this ${field} already exists`;
  }

  // Request body larger than the express.json limit (usually big images)
  if (err.type === "entity.too.large") {
    statusCode = 413;
    message = "Upload is too large. Please use smaller images.";
  }

  // Malformed JSON body
  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid request body";
  }

  if (statusCode >= 500) {
    console.error(`[${req.method} ${req.originalUrl}]`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
