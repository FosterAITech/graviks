import mongoose from "mongoose";

const sectionItemSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: true,
      enum: ["projects", "buying-guide", "about", "team"]
    },
    title: { type: String, trim: true },
    text: { type: String, trim: true },
    category: { type: String, trim: true },
    name: { type: String, trim: true },
    role: { type: String, trim: true },
    image: { type: String, trim: true }
  },
  { timestamps: true }
);

sectionItemSchema.index({ section: 1 });

const SectionItem = mongoose.model("SectionItem", sectionItemSchema);

export default SectionItem;
