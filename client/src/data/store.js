// Business details and store settings used across the site.
export const business = {
  name: "Garviks Private Limited",
  shortName: "Garviks",
  phoneDisplay: "+91 89296 83949",
  phoneHref: "tel:+918929683949",
  whatsappNumber: "918929683949",
  email: "graviks@gmail.com",
  // Add social profile links here when ready, e.g. instagram: "https://instagram.com/..."
  social: {},
};

export const whatsappLink = (message = "Hello Garviks, I have a question about your products.") =>
  `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(message)}`;

export const categories = [
  { key: "projector-screens", label: "Projector Screens", blurb: "Foldable and hanging screens for home theatre, offices and events." },
  { key: "books", label: "Books", blurb: "Titles for students, readers and gifting." },
  { key: "hardware", label: "Nuts & Bolts", blurb: "Fasteners and hardware for workshops and repairs." },
  { key: "clothing", label: "Clothing", blurb: "Everyday clothing for men, women and kids." },
  { key: "crackers", label: "Crackers", blurb: "Festive crackers, available in season." },
];

export const categoryLabel = (key) => categories.find((item) => item.key === key)?.label || "Other";

// "₹5,999" -> 5999
export const parsePrice = (value) => {
  const number = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(number) ? number : 0;
};

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
export const formatPrice = (value) => {
  const number = typeof value === "number" ? value : parsePrice(value);
  return number > 0 ? inr.format(number) : "";
};

export const discountPercent = (price, mrp) => {
  const selling = parsePrice(price);
  const original = parsePrice(mrp);
  if (!selling || !original || original <= selling) return 0;
  return Math.round(((original - selling) / original) * 100);
};

export const team = [
  { name: "Rahul Sharma" },
  { name: "Rohit Chaudhary" },
  { name: "Himesh Pandey" },
];

export const screenGuide = [
  {
    title: "Match the size to your room",
    text: "Measure the wall first. A 100 to 120 inch screen suits most living rooms; smaller rooms are often better with 84 to 100 inches.",
  },
  {
    title: "Pick 16:9 for movies and sport",
    text: "16:9 matches modern projectors, TV content and streaming. Choose 4:3 only if you mainly show older slides or classroom material.",
  },
  {
    title: "Sit at a comfortable distance",
    text: "A simple rule: sit roughly 1.5 times the screen width away, so the whole picture fits in view without moving your head.",
  },
  {
    title: "Plan how you'll hang it",
    text: "Eyelet screens hang on hooks, nails or rope, indoors or outdoors. Keep the fabric tight and flat for the sharpest picture.",
  },
];

export const faqs = [
  {
    question: "How do I place an order?",
    answer:
      "Add products to your cart and send the order with your name, phone number and delivery address. Our team will call or WhatsApp you to confirm availability, delivery and payment before anything is dispatched.",
  },
  {
    question: "Do I pay online?",
    answer:
      "Not on the website at the moment. Our team confirms your order first and then shares the payment options with you.",
  },
  {
    question: "Which areas do you deliver to?",
    answer: "Tell us your pincode when you order and we'll confirm delivery to your address and any delivery charges.",
  },
  {
    question: "Can I order in bulk?",
    answer: "Yes. Send us a message on WhatsApp or through the contact page with the products and quantities you need.",
  },
  {
    question: "Are crackers available all year?",
    answer: "Crackers are seasonal and depend on local rules. Contact us to check what's available for your area.",
  },
  {
    question: "How can I contact Garviks?",
    answer: `Call or WhatsApp ${business.phoneDisplay}, email ${business.email}, or use the contact page.`,
  },
];
