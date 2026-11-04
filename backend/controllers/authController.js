import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "../middleware/asyncHandler.js";

const createToken = (user) =>
  jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

const authResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  token: createToken(user)
});

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required");
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    res.status(409);
    throw new Error("User already exists");
  }

  // New accounts are always regular users; admins come from ADMIN_EMAIL / ADMIN_PASSWORD.
  const user = await User.create({ name, email, password, role: "user" });
  res.status(201).json(authResponse(user));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email: String(email).toLowerCase().trim() });

  if (user && (await user.matchPassword(password))) {
    res.json(authResponse(user));
    return;
  }

  res.status(401);
  throw new Error("Invalid email or password");
});
// Returns the logged-in user's details (used to check the admin session).
export const me = asyncHandler(async (req, res) => {
  res.json({ _id: req.user._id, email: req.user.email, role: req.user.role });
});
