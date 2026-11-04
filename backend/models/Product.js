import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      sparse: true,
    },

    category: {
      type: String,
      enum: ["projector-screens", "books", "hardware", "clothing", "crackers", "other"],
      default: "projector-screens"
    },

    size: {
      type: String,
      default: "",
    },

    // Selling price, e.g. "926" or "₹926"
    price: {
      type: String,
      default: "",
    },

    // Original price shown struck through, e.g. "5999"
    mrp: {
      type: String,
      default: "",
    },

    inStock: {
      type: Boolean,
      default: true,
    },

    shortDescription: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    features: [
      {
        type: String,
      },
    ],

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    image: {
      type: String,
      default: "",
    },

    gallery: {
      type: [String],
      default: [],
    },

    topProductRank: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6, null],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ category: 1, createdAt: -1 });

const Product = mongoose.model("Product", productSchema);

export default Product;