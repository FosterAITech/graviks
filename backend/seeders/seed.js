import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import ensureAdminUser from "../config/ensureAdmin.js";
import Product from "../models/Product.js";
import products from "../data/products.js";

dotenv.config();

// Adds sample products only if the shop has none. Never deletes anything.
const seed = async () => {
  const connected = await connectDB();
  if (!connected) process.exit(1);

  await ensureAdminUser();

  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany(products);
    console.log(`Added ${products.length} sample product(s).`);
  } else {
    console.log(`Shop already has ${count} product(s); nothing added.`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

seed();
