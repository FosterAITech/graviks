import Product from "../models/Product.js";
import asyncHandler from "../middleware/asyncHandler.js";
import mongoose from "mongoose";

export const getProducts = asyncHandler(async (req, res) => {
  const { category, limit, fields, q, includeInactive } = req.query;
  const filters = {};

  if (category) filters.category = category;
  // Hidden products only appear in the admin panel
  if (includeInactive !== "true") filters.status = { $ne: "inactive" };
  if (q && String(q).trim()) {
    const escaped = String(q).trim().slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filters.name = { $regex: escaped, $options: "i" };
  }

  const page = Math.max(Number(req.query.page) || 1, 1);
  const perPage = Math.min(Number(limit) || 12, 100);
  const skip = (page - 1) * perPage;

  let query = Product.find(filters)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(perPage);

  if (!fields) {
    query = query.select(
      "name slug image gallery category size price mrp inStock shortDescription status topProductRank"
    );
  } else {
    query = query.select(
      fields
        .split(",")
        .map((field) => field.trim())
        .join(" ")
    );
  }

  query = query.lean();

  const [products, total] = await Promise.all([
    query,
    Product.countDocuments(filters),
  ]);

  res.setHeader("X-Total-Count", String(total));
  res.setHeader("X-Page", String(page));
  res.setHeader("X-Per-Page", String(perPage));

  res.json(products);
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const { related, relatedLimit = 3 } = req.query;
  const slug = req.params.slug.toLowerCase();

  const product = await Product.findOne({ slug }).lean();

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (related === "true") {
    const relatedProducts = await Product.find({
      slug: { $ne: slug },
      status: "active",
    })
      .limit(Number(relatedLimit))
      .select(
        "name slug image gallery category size price mrp inStock shortDescription status topProductRank"
      )
      .lean();

    return res.json({ product, relatedProducts });
  }

  res.json(product);
});

export const getProductById = asyncHandler(async (req, res) => {
  const { related, relatedLimit = 3 } = req.query;
  const { id } = req.params;

  const product = mongoose.isValidObjectId(id)
    ? await Product.findById(id).lean()
    : await Product.findOne({ slug: id }).lean();

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (related === "true") {
    const relatedProducts = await Product.find({
      slug: { $ne: product.slug },
      status: "active",
    })
      .limit(Number(relatedLimit))
      .select(
        "name slug image gallery category size price mrp inStock shortDescription status topProductRank"
      )
      .lean();

    return res.json({ product, relatedProducts });
  }

  res.json(product);
});

const parseFeatures = (value) => {
  if (!value) return [];

  const items = Array.isArray(value) ? value : String(value).split(/\r?\n|,/);

  return items.map((item) => String(item).trim()).filter(Boolean);
};

const parseGallery = (gallery) => {
  if (Array.isArray(gallery)) return gallery.filter(Boolean);
  if (typeof gallery === "string" && gallery.trim() !== "") return [gallery];
  return [];
};

// Returns 1..6, or null for "None" / anything invalid.
const parseTopProductRank = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const rank = Number(value);
  return Number.isInteger(rank) && rank >= 1 && rank <= 6 ? rank : null;
};

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "product";

// Slugs must be unique, so two products with the same name get "name", "name-2", ...
const buildUniqueSlug = async (name, excludeId = null) => {
  const base = slugify(name);
  let slug = base;
  let counter = 2;

  // eslint-disable-next-line no-await-in-loop
  while (await Product.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    slug = `${base}-${counter}`;
    counter += 1;
  }

  return slug;
};

// Only one product can hold each Top rank: free the rank from any other product first.
const releaseTopProductRank = async (rank, excludeId = null) => {
  if (!rank) return;
  await Product.updateMany(
    { topProductRank: rank, ...(excludeId ? { _id: { $ne: excludeId } } : {}) },
    { $set: { topProductRank: null } }
  );
};

export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    category,
    size,
    price,
    shortDescription,
    description,
    features,
    status,
    image,
    gallery,
    topProductRank,
    mrp,
    inStock,
  } = req.body;

  if (!name || !description) {
    res.status(400);
    throw new Error("Name and Description are required");
  }

  const rank = parseTopProductRank(topProductRank);
  await releaseTopProductRank(rank);

  const product = await Product.create({
    name,
    slug: await buildUniqueSlug(name),
    category: category || "projector-screens",
    size: size || "",
    price: price || "",
    shortDescription: shortDescription || "",
    description,
    features: parseFeatures(features),
    status: status === "inactive" ? "inactive" : "active",
    image: image || "",
    gallery: parseGallery(gallery),
    topProductRank: rank,
    mrp: mrp || "",
    inStock: !(inStock === false || inStock === "false"),
  });

  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    res.status(400);
    throw new Error("Invalid product id");
  }

  const {
    name,
    category,
    size,
    price,
    shortDescription,
    description,
    features,
    status,
    image,
    gallery,
    topProductRank,
    mrp,
    inStock,
  } = req.body;

  const product = await Product.findById(id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Update only the fields that were sent.
  if (name !== undefined && String(name).trim() !== "") {
    product.name = name;
    product.slug = await buildUniqueSlug(name, product._id);
  }

  if (category !== undefined && category !== "") product.category = category;
  if (size !== undefined) product.size = size;
  if (price !== undefined) product.price = price;
  if (mrp !== undefined) product.mrp = mrp;
  if (inStock !== undefined) product.inStock = !(inStock === false || inStock === "false");
  if (shortDescription !== undefined) product.shortDescription = shortDescription;
  if (description !== undefined && description !== "") product.description = description;
  if (features !== undefined) product.features = parseFeatures(features);
  if (status !== undefined) product.status = status === "inactive" ? "inactive" : "active";

  // Main image stays unless a new one is sent.
  if (image !== undefined && image !== "") product.image = image;

  if (gallery !== undefined) product.gallery = parseGallery(gallery);

  if (topProductRank !== undefined) {
    const rank = parseTopProductRank(topProductRank);
    await releaseTopProductRank(rank, product._id);
    product.topProductRank = rank;
  }

  const updatedProduct = await product.save();

  res.json(updatedProduct);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  await product.deleteOne();

  res.json({
    message: "Product deleted successfully",
  });
});
