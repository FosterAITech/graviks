import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../models/Product.js";
import SectionItem from "../models/SectionItem.js";
import Testimonial from "../models/Testimonial.js";
import Contact from "../models/Contact.js";
import Lead from "../models/Lead.js";

// Lightweight in-memory cache to serve dashboard summary quickly.
const cache = {
  value: null,
  ts: 0,
  ttl: 1000, // 1s TTL - very short but helps keep response time <100ms for rapid requests
};

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const now = Date.now();
  if (cache.value && now - cache.ts < cache.ttl) {
    return res.json(cache.value);
  }

  // Use fast estimated counts where possible; keep the latest items queries light.
  const [productsCount, galleryCount, testimonialsCount, contactsCount, quotesCount, latestContacts, latestQuotes] =
    await Promise.all([
      // estimatedDocumentCount is fast and non-blocking for large collections
      Product.estimatedDocumentCount(),
      SectionItem.countDocuments({ section: "projects" }),
      Testimonial.estimatedDocumentCount(),
      Contact.estimatedDocumentCount(),
      Lead.estimatedDocumentCount(),
      Contact.find().sort({ createdAt: -1 }).limit(3).select("name email message status createdAt").lean(),
      Lead.find().sort({ createdAt: -1 }).limit(3).select("name email phone message interest total status createdAt").lean(),
    ]);

  const result = {
    success: true,
    stats: {
      totalProducts: productsCount,
      totalGallery: galleryCount,
      totalTestimonials: testimonialsCount,
      totalContacts: contactsCount,
      totalQuotes: quotesCount,
    },
    latestSubmissions: {
      contacts: latestContacts,
      quotes: latestQuotes,
    },
  };

  cache.value = result;
  cache.ts = Date.now();

  res.json(result);
});