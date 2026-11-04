import mongoose from "mongoose";
import Lead from "../models/Lead.js";
import Product from "../models/Product.js";

// "₹5,999" -> 5999
const parsePrice = (value) => {
  const number = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(number) ? number : 0;
};
import asyncHandler from "../middleware/asyncHandler.js";

export const getLeads = asyncHandler(async (req, res) => {
  const leads = await Lead.find().sort({ createdAt: -1 }).lean();
  res.json(leads);
});

export const createLead = asyncHandler(async (req, res) => {
  const { name, email, phone, interest, message, source, address, city, pincode, items } = req.body;

  // Order placed from the cart
  if (Array.isArray(items) && items.length > 0) {
    if (!name || !phone || !address) {
      res.status(400);
      throw new Error("Name, phone number and delivery address are required");
    }

    const requested = items
      .filter((item) => item && mongoose.isValidObjectId(item.product))
      .slice(0, 50)
      .map((item) => ({
        product: item.product,
        quantity: Math.min(Math.max(Math.round(Number(item.quantity) || 1), 1), 999),
      }));

    // Prices and names always come from the database, never from the browser.
    const products = await Product.find({ _id: { $in: requested.map((item) => item.product) } })
      .select("name slug price inStock status")
      .lean();
    const byId = new Map(products.map((product) => [String(product._id), product]));

    const orderItems = requested
      .map((item) => {
        const product = byId.get(String(item.product));
        if (!product || product.status === "inactive") return null;
        return {
          product: product._id,
          name: product.name,
          slug: product.slug,
          price: parsePrice(product.price),
          quantity: item.quantity,
        };
      })
      .filter(Boolean);

    if (orderItems.length === 0) {
      res.status(400);
      throw new Error("The products in your cart are no longer available");
    }

    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Lead.create({
      name,
      email,
      phone,
      address,
      city,
      pincode,
      message,
      items: orderItems,
      total,
      interest: orderItems.map((item) => `${item.name} × ${item.quantity}`).join(", "),
      source: "website-order",
    });

    res.status(201).json({ message: "Order received", lead: order });
    return;
  }

  // Simple enquiry
  if (!name || !(email || phone) || !message) {
    res.status(400);
    throw new Error("Name, a phone number or email, and a message are required");
  }

  const lead = await Lead.create({
    name,
    email,
    phone,
    interest,
    message,
    source: source || "website",
  });

  res.status(201).json({
    message: "Enquiry received",
    lead
  });
});

export const updateLeadStatus = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    res.status(404);
    throw new Error("Lead not found");
  }

  const { status } = req.body;
  if (status) {
    lead.status = status;
  }

  await lead.save();
  res.json(lead);
});

export const deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    res.status(404);
    throw new Error("Lead not found");
  }

  await lead.deleteOne();
  res.json({ message: "Lead deleted successfully" });
});