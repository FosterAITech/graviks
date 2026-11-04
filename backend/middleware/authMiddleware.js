import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.js";

// Requires a valid "Authorization: Bearer <token>" header.
export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Please log in to continue");
  }

  try {
    const decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
    req.user = { _id: decoded.id, id: decoded.id, email: decoded.email, role: decoded.role || "user" };
  } catch {
    res.status(401);
    throw new Error("Your session has expired. Please log in again");
  }

  next();
});

// Only admins may continue.
export const adminOnly = [
  protect,
  (req, res, next) => {
    if (req.user?.role !== "admin") {
      res.status(403);
      return next(new Error("Admin access only"));
    }
    return next();
  },
];
