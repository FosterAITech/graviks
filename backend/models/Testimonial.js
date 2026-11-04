import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    image: { type: String },
    review: { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },
    isFeatured: { type: Boolean, default: true }
  },
  { timestamps: true }
);

testimonialSchema.index({ isFeatured: 1 });
testimonialSchema.index({ status: 1 });

const Testimonial = mongoose.model("Testimonial", testimonialSchema);

export default Testimonial;