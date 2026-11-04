import mongoose from "mongoose";
import Testimonial from "../models/Testimonial.js";
import asyncHandler from "../middleware/asyncHandler.js";

// Ratings come from a number input as strings; keep them a whole number between 1 and 5.
const parseRating = (value) => {
  const rating = Math.round(Number(value));
  if (!Number.isFinite(rating)) return 5;
  return Math.min(5, Math.max(1, rating));
};

// ✅ GET
export const getTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find(req.query.all === "true" ? {} : { isFeatured: true, status: { $ne: "inactive" } }).sort({
    createdAt: -1,
  }).lean();

  res.json(testimonials);
});

// controllers/testimonialController.js

// ✅ FIXED POST CONTROLLER
export const createTestimonial = asyncHandler(async (req, res) => {
  const { name, location, image, review, rating, status } = req.body;

  if (!name || !location || !review) {
    res.status(400);
    throw new Error("Name, location and review are required");
  }

  const testimonial = new Testimonial({
    name,
    location,
    image,
    review,
    rating: parseRating(rating),
    status: status === "inactive" ? "inactive" : "active",
  });

  const created = await testimonial.save();

  res.status(201).json(created);
});

export const updateTestimonial = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400);
    throw new Error("Invalid testimonial id");
  }

  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) {
    res.status(404);
    throw new Error("Testimonial not found");
  }

  const { name, location, image, review, rating, status, isFeatured } = req.body;

  const nextName = name ?? testimonial.name;
  const nextLocation = location ?? testimonial.location;
  const nextReview = review ?? testimonial.review;
  if (!nextName || !nextLocation || !nextReview) {
    res.status(400);
    throw new Error("Name, location and review are required");
  }

  testimonial.name = nextName;
  testimonial.location = nextLocation;
  testimonial.review = nextReview;
  if (typeof image !== "undefined") {
    testimonial.image = image;
  }
  if (rating !== undefined && rating !== "") {
    testimonial.rating = parseRating(rating);
  }
  if (status !== undefined) {
    testimonial.status = status === "inactive" ? "inactive" : "active";
  }
  if (typeof isFeatured === "boolean") {
    testimonial.isFeatured = isFeatured;
  }

  const updated = await testimonial.save();
  res.json(updated);
});

export const deleteTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) {
    res.status(404);
    throw new Error("Testimonial not found");
  }

  await testimonial.deleteOne();
  res.json({ message: "Testimonial deleted successfully" });
});
