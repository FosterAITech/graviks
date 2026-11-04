import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    interest: { type: String, trim: true },
    message: { type: String, trim: true },
    // Order details (for orders placed from the cart)
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    pincode: { type: String, trim: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: { type: String, trim: true },
        slug: { type: String, trim: true },
        price: { type: Number, default: 0 },
        quantity: { type: Number, default: 1, min: 1 },
      },
    ],
    total: { type: Number, default: 0 },
    source: { type: String, default: "website" },
    status: {
      type: String,
      enum: ["new", "contacted", "confirmed", "delivered", "cancelled", "closed"],
      default: "new"
    }
  },
  { timestamps: true }
);

leadSchema.index({ email: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ createdAt: -1 });

const Lead = mongoose.model("Lead", leadSchema);

export default Lead;