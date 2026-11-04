import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ClipboardList,
  FileText,
  Layers,
  Mail,
  Menu,
  Phone,
  PlusCircle,
  Save,
  Search,
  Sparkles,
  Calendar,
  Tag,
} from "lucide-react";
import { ADMIN_TOKEN_KEY, productApi, sectionItemApi, testimonialApi, leadApi, contactApi, settingsApi, adminApi } from "../api/http";
import ProductCard from "../components/ProductCard";
import { saveCachedProducts } from "../utils/productCatalog";
import { getImmediateProducts } from "../utils/productCatalog";

const sidebarSections = [
  {
    title: null,
    items: [{ key: "dashboard", label: "Dashboard", module: "dashboard", icon: Layers }],
  },
  {
    title: "Products",
    items: [
      { key: "products-add", label: "Add Product", module: "products", icon: PlusCircle },
      { key: "products-manage", label: "Manage Products", module: "products", icon: FileText },
    ],
  },
  {
    title: "Testimonials",
    items: [
      { key: "testimonials-add", label: "Add Testimonial", module: "testimonials", icon: PlusCircle },
      { key: "testimonials-manage", label: "Manage Testimonials", module: "testimonials", icon: FileText },
    ],
  },
  {
    title: "Team",
    items: [
      { key: "team-add", label: "Add Member", module: "team", icon: PlusCircle },
      { key: "team-manage", label: "Manage Team", module: "team", icon: FileText },
    ],
  },
  {
    title: "Orders & Messages",
    items: [
      { key: "quote-enquiries", label: "Orders", module: "quote-enquiries", icon: ClipboardList },
      { key: "contact-enquiries", label: "Messages", module: "contact-enquiries", icon: Mail },
    ],
  },
  /*
  {
    title: "Settings",
    items: [
      { key: "settings-company", label: "Company Details", module: "settings", icon: Search },
      { key: "settings-social", label: "Social Media Links", module: "settings", icon: MessageSquare },
      { key: "settings-whatsapp", label: "WhatsApp Number", module: "settings", icon: Phone },
    ],
  },
  */
];

const initialForms = {
  products: {
    name: "",
    category: "projector-screens",
    topProductRank: "",
    size: "",
    price: "",
    mrp: "",
    inStock: "true",
    shortDescription: "",
    description: "",
    features: "",
    status: "active",
    image: "",
    gallery: [],
  },
  testimonials: {
    name: "",
    location: "",
    image: "",
    review: "",
    rating: 5,
    status: "active",
  },
  gallery: {
    title: "",
    category: "bathtubs",
    image: "",
    section: "projects",
  },
  team: {
    name: "",
    role: "",
    image: "",
    section: "team",
  },
  settings: {
    companyName: "",
    phone: "",
    email: "",
    address: "",
    whatsappNumber: "",
    instagram: "",
    facebook: "",
    footerText: "",
    logo: "",
  },
};

const cardTitles = {
  dashboard: "Dashboard",
  products: "Products",
  gallery: "Gallery",
  testimonials: "Testimonials",
  team: "Team",
  "contact-enquiries": "Messages",
  "quote-enquiries": "Orders",
  settings: "Settings",
};

const categories = [
  { value: "projector-screens", label: "Projector Screens" },
  { value: "books", label: "Books" },
  { value: "hardware", label: "Nuts & Bolts" },
  { value: "clothing", label: "Clothing" },
  { value: "crackers", label: "Crackers" },
  { value: "other", label: "Other" },
];

const orderStatuses = ["new", "contacted", "confirmed", "delivered", "cancelled"];
const messageStatuses = ["new", "contacted", "closed"];
const rupees = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const imageAcceptTypes = [
  "image/*",
  ".apng",
  ".avif",
  ".bmp",
  ".gif",
  ".ico",
  ".jfif",
  ".jpeg",
  ".jpg",
  ".jpe",
  ".png",
  ".svg",
  ".tif",
  ".tiff",
  ".webp",
  ".heic",
  ".heif",
].join(",");


const FormattedDate = ({ iso }) => {
  if (!iso) return null;
  const d = new Date(iso);
  return (
    <span>
      {d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}{" "}
      <span className="text-ink/50">{d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
    </span>
  );
};

const AdminPannel = () => {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState("dashboard");
  const [activeSidebarKey, setActiveSidebarKey] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const activeAction = useMemo(() => {
    if (activeSidebarKey.endsWith("-manage")) return "manage";
    if (activeSidebarKey.endsWith("-add")) return "add";
    return activeSidebarKey === "dashboard" ? "dashboard" : "default";
  }, [activeSidebarKey]);
  const activeSidebarLabel = useMemo(() => {
    if (activeSidebarKey === "dashboard") return "Dashboard";
    const found = sidebarSections.flatMap((section) => section.items).find((item) => item.key === activeSidebarKey);
    return found?.label || cardTitles[activeModule] || "";
  }, [activeSidebarKey, activeModule]);
  const [expandedSections, setExpandedSections] = useState(() =>
    sidebarSections.reduce((acc, section) => {
      if (section.title) acc[section.title] = false;
      return acc;
    }, {})
  );
  const [forms, setForms] = useState(initialForms);
  const [lists, setLists] = useState({
    products: getImmediateProducts("all"),
    productsCount: getImmediateProducts("all").length,
    testimonials: [],
    testimonialsCount: 0,
    gallery: [],
    galleryCount: 0,
    team: [],
    contacts: [],
    contactsCount: 0,
    quotes: [],
    quotesCount: 0,
    settings: {},
  });
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [imageFileName, setImageFileName] = useState("");
  const [galleryFileNames, setGalleryFileNames] = useState([]);
  const imageInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const successTimeoutRef = useRef(null);

  const hasImageField = useMemo(() => ["products", "testimonials", "gallery", "team"].includes(activeModule), [activeModule]);
  const isEnquiryModule = useMemo(() => ["contact-enquiries", "quote-enquiries"].includes(activeModule), [activeModule]);
  const isDashboard = activeModule === "dashboard";
  const isManageView = activeAction === "manage" && !editingId;

  const loadDashboardSummary = async () => {
    try {
      const response = await adminApi.getDashboardSummary();
      const summary = response.data;

      if (summary?.success) {
        setLists((current) => ({
          ...current,
          productsCount: summary.stats.totalProducts,
          galleryCount: summary.stats.totalGallery,
          testimonialsCount: summary.stats.totalTestimonials,
          contactsCount: summary.stats.totalContacts,
          quotesCount: summary.stats.totalQuotes,
          contacts: summary.latestSubmissions.contacts || current.contacts,
          quotes: summary.latestSubmissions.quotes || current.quotes,
        }));
      }
    } catch {
      setError("Unable to load dashboard summary.");
    }
  };

  // Each section loads on its own: if one request fails, the others still show their data.
  const loadAllData = async () => {
    const requests = {
      products: productApi.getProducts({ limit: 100, page: 1, includeInactive: "true", fields: "name,slug,image,gallery,category,size,price,mrp,inStock,shortDescription,description,features,status,topProductRank" }),
      testimonials: testimonialApi.getTestimonials({ all: "true" }),
      gallery: sectionItemApi.getItems("projects", { limit: 9, page: 1 }),
      team: sectionItemApi.getItems("team", { limit: 6, page: 1 }),
      contacts: contactApi.getContacts(),
      quotes: leadApi.getLeads(),
      settings: settingsApi.getSettings(),
    };

    const keys = Object.keys(requests);
    const results = await Promise.allSettled(Object.values(requests));
    const responses = {};
    const failed = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        responses[keys[index]] = result.value;
      } else {
        failed.push(keys[index]);
        console.error(`Failed to load ${keys[index]}:`, result.reason?.response?.data || result.reason);
      }
    });

    const listOf = (key) => (Array.isArray(responses[key]?.data) ? responses[key].data : null);
    const totalOf = (key) => Number(responses[key]?.headers?.["x-total-count"] || listOf(key)?.length || 0);

    setLists((current) => ({
      ...current,
      ...(listOf("products") && { products: listOf("products"), productsCount: totalOf("products") }),
      ...(listOf("testimonials") && { testimonials: listOf("testimonials"), testimonialsCount: listOf("testimonials").length }),
      ...(listOf("gallery") && { gallery: listOf("gallery"), galleryCount: totalOf("gallery") }),
      ...(listOf("team") && { team: listOf("team") }),
      ...(listOf("contacts") && { contacts: listOf("contacts"), contactsCount: listOf("contacts").length }),
      ...(listOf("quotes") && { quotes: listOf("quotes"), quotesCount: listOf("quotes").length }),
      ...(responses.settings?.data && { settings: responses.settings.data }),
    }));

    if (listOf("products")) {
      saveCachedProducts("all", listOf("products"));
    }

    if (responses.settings?.data) {
      setForms((current) => ({
        ...current,
        settings: { ...current.settings, ...responses.settings.data },
      }));
    }

    if (failed.length) {
      setError(`Unable to load: ${failed.join(", ")}. Please check the backend.`);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      loadDashboardSummary();
      loadAllData();
    });
  }, []);

  useEffect(() => {
    if (status !== "success") return;

    successTimeoutRef.current = window.setTimeout(() => {
      setStatus("idle");
      successTimeoutRef.current = null;
    }, 2500);

    return () => {
      if (successTimeoutRef.current) {
        window.clearTimeout(successTimeoutRef.current);
        successTimeoutRef.current = null;
      }
    };
  }, [status]);

  const resetForm = () => {
    setForms((current) => ({ ...current, [activeModule]: initialForms[activeModule] }));
    setEditingId(null);
    setImageFileName("");
    setGalleryFileNames([]);
    setError("");
    setStatus("idle");
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  };

  const handleModuleChange = (key, module = key) => {
    setActiveSidebarKey(key);
    setActiveModule(module);
    setEditingId(null);
    setError("");
    setStatus("idle");
    setImageFileName("");
    setGalleryFileNames([]);
    setIsSidebarOpen(false);

    if (module === "dashboard") {
      setExpandedSections((current) =>
        Object.keys(current).reduce((acc, sectionTitle) => {
          acc[sectionTitle] = false;
          return acc;
        }, {})
      );
    }
  };

  const toggleSection = (title) => {
    setExpandedSections((current) => {
      const isOpen = current[title];
      const next = Object.keys(current).reduce((acc, sectionTitle) => {
        acc[sectionTitle] = false;
        return acc;
      }, {});
      next[title] = !isOpen;
      return next;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    navigate("/admin-login");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForms((current) => ({
      ...current,
      [activeModule]: { ...current[activeModule], [name]: value },
    }));
  };

  const handleImageFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForms((current) => ({
        ...current,
        [activeModule]: { ...current[activeModule], image: reader.result },
      }));
      setImageFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryFilesChange = (event) => {
    const files = Array.from(event.target.files || []);

    if (files.length > 10) {
      setError("You can upload maximum 10 other photos.");
      event.target.value = "";
      setForms((current) => ({
        ...current,
        products: { ...current.products, gallery: [] },
      }));
      setGalleryFileNames([]);
      return;
    }

    const readPromises = files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readPromises).then((imagesBase64) => {
      setForms((current) => ({
        ...current,
        products: { ...current.products, gallery: imagesBase64.filter(Boolean) },
      }));
      setGalleryFileNames(files.map((file) => file.name));
      setError("");
    });
  };

  const removeCurrentMainImage = () => {
    setForms((current) => ({
      ...current,
      products: { ...current.products, image: "" },
    }));
    setImageFileName("");
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const removeGalleryPhotoAt = (indexToRemove) => {
    setForms((current) => {
      const existing = Array.isArray(current.products.gallery) ? current.products.gallery : [];
      const nextGallery = existing.filter((_, idx) => idx !== indexToRemove);
      return {
        ...current,
        products: { ...current.products, gallery: nextGallery },
      };
    });
    setGalleryFileNames((current) => current.filter((_, idx) => idx !== indexToRemove));
  };

  const clearAllGalleryPhotos = () => {
    setForms((current) => ({
      ...current,
      products: { ...current.products, gallery: [] },
    }));
    setGalleryFileNames([]);
    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  };

  const syncProductCatalogCache = (nextProducts) => {
    const list = Array.isArray(nextProducts) ? nextProducts : [];
    saveCachedProducts("all", list);
    categories.forEach((category) => {
      saveCachedProducts(category.value, list.filter((product) => product.category === category.value));
    });
  };

  const upsertProductLocally = (product, mode = "create") => {
    if (!product) return;

    setLists((current) => {
      const currentProducts = Array.isArray(current.products) ? current.products : [];
      const canSyncCache = current.productsCount > 0 && currentProducts.length >= current.productsCount;
      const nextProducts =
        mode === "delete"
          ? currentProducts.filter((item) => item._id !== product._id)
          : mode === "update"
            ? currentProducts.some((item) => item._id === product._id)
              ? currentProducts.map((item) => (item._id === product._id ? product : item))
              : [product, ...currentProducts]
            : [product, ...currentProducts.filter((item) => item._id !== product._id)];

      if (canSyncCache) {
        syncProductCatalogCache(nextProducts);
      }

      return {
        ...current,
        products: nextProducts,
        productsCount: current.productsCount ? Math.max(nextProducts.length, current.productsCount) : nextProducts.length,
      };
    });
  };

  const removeProductLocally = (productId) => {
    if (!productId) return;

    setLists((current) => {
      const currentProducts = Array.isArray(current.products) ? current.products : [];
      const canSyncCache = current.productsCount > 0 && currentProducts.length >= current.productsCount;
      const nextProducts = currentProducts.filter((item) => item._id !== productId);

      if (canSyncCache) {
        syncProductCatalogCache(nextProducts);
      }

      return {
        ...current,
        products: nextProducts,
        productsCount: current.productsCount ? Math.max(nextProducts.length, current.productsCount - 1) : nextProducts.length,
      };
    });
  };

  const replaceProductLocally = (tempId, product) => {
    if (!tempId || !product) return;

    setLists((current) => {
      const currentProducts = Array.isArray(current.products) ? current.products : [];
      const nextProducts = currentProducts.map((item) => (item._id === tempId ? product : item));
      const canSyncCache = current.productsCount > 0 && currentProducts.length >= current.productsCount;

      if (canSyncCache) {
        syncProductCatalogCache(nextProducts);
      }

      return {
        ...current,
        products: nextProducts,
      };
    });
  };

  const runCreate = async (moduleKey, payload) => {
    if (moduleKey === "products") return productApi.createProduct(payload);
    if (moduleKey === "testimonials") return testimonialApi.createTestimonial(payload);
    if (moduleKey === "gallery" || moduleKey === "team") return sectionItemApi.createItem(payload);
    return null;
  };

  const runUpdate = async (moduleKey, id, payload) => {
    if (moduleKey === "products") return productApi.updateProduct(id, payload);
    if (moduleKey === "testimonials") return testimonialApi.updateTestimonial(id, payload);
    if (moduleKey === "gallery" || moduleKey === "team") return sectionItemApi.updateItem(id, payload);
    // if (moduleKey === "settings") return settingsApi.updateSettings(payload);
    return null;
  };

  const runDelete = async (moduleKey, id) => {
    if (moduleKey === "products") return productApi.deleteProduct(id);
    if (moduleKey === "testimonials") return testimonialApi.deleteTestimonial(id);
    if (moduleKey === "gallery" || moduleKey === "team") return sectionItemApi.deleteItem(id);
    if (moduleKey === "contact-enquiries") return contactApi.deleteContact(id);
    if (moduleKey === "quote-enquiries") return leadApi.deleteLead(id);
    return null;
  };

  const runStatusUpdate = async (moduleKey, id, payload) => {
    if (moduleKey === "contact-enquiries") return contactApi.updateContact(id, payload);
    if (moduleKey === "quote-enquiries") return leadApi.updateLead(id, payload);
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setError("");

    let rollbackCreateTempId = null;
    let rollbackPreviousProduct = null;

    try {
      // Database bookkeeping fields come along when editing an existing item; the API doesn't need them.
      const payload = { ...forms[activeModule] };
      ["_id", "__v", "createdAt", "updatedAt"].forEach((key) => delete payload[key]);
      if (activeModule === "products") {
        payload.topProductRank =
          payload.topProductRank === "" || payload.topProductRank === null || payload.topProductRank === undefined
            ? null
            : Number(payload.topProductRank);
      }
      const isProductModule = activeModule === "products";
      const productSnapshot = isProductModule
        ? lists.products.find((item) => item._id === editingId) || null
        : null;
      const tempProductId = isProductModule && !editingId ? `temp-${Date.now()}` : null;

      if (isProductModule && !editingId) {
        const optimisticProduct = {
          _id: tempProductId,
          name: payload.name,
          category: payload.category,
          size: payload.size,
          price: payload.price,
          shortDescription: payload.shortDescription,
          description: payload.description,
          features: payload.features,
          status: payload.status,
          image: payload.image,
          slug: payload.name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-"),
          createdAt: new Date().toISOString(),
        };
        upsertProductLocally(optimisticProduct, "create");
        rollbackCreateTempId = tempProductId;
        setActiveSidebarKey("products-manage");
      }

      if (isProductModule && editingId) {
        const optimisticProduct = {
          ...(productSnapshot || {}),
          ...payload,
          _id: editingId,
          slug: payload.name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-"),
        };
        upsertProductLocally(optimisticProduct, "update");
        rollbackPreviousProduct = productSnapshot;
      }

      let savedItem = null;
      if (activeModule === "settings") {
        await runUpdate(activeModule, null, payload);
      } else if (editingId) {
        const response = await runUpdate(activeModule, editingId, payload);
        savedItem = response?.data || null;
      } else {
        const response = await runCreate(activeModule, payload);
        savedItem = response?.data || null;
      }

      if (isProductModule && savedItem) {
        if (editingId) {
          replaceProductLocally(editingId, savedItem);
        } else if (rollbackCreateTempId) {
          replaceProductLocally(rollbackCreateTempId, savedItem);
        }
      }

      await loadDashboardSummary();
      await loadAllData();
      resetForm();
      setStatus("success");
    } catch (apiError) {
      if (activeModule === "products") {
        if (rollbackCreateTempId) {
          removeProductLocally(rollbackCreateTempId);
        }
        if (rollbackPreviousProduct) {
          upsertProductLocally(rollbackPreviousProduct, "update");
        }
      }
      setStatus("error");
      setError(apiError.response?.data?.message || "Unable to save the item.");
    }
  };

  const prepareFormForEdit = (item) => {
    const nextForm = { ...initialForms[activeModule], ...item };
    if (activeModule === "products") {
      const normalizedDescription =
        item?.description ??
        item?.shortDescription ??
        item?.productDescription ??
        item?.details ??
        "";
      nextForm.features = Array.isArray(item.features) ? item.features.join("\n") : item.features || "";
      nextForm.topProductRank = item.topProductRank ? String(item.topProductRank) : "";
      nextForm.inStock = String(item.inStock !== false);
      nextForm.mrp = item.mrp || "";
      nextForm.description = typeof normalizedDescription === "string" ? normalizedDescription : String(normalizedDescription || "");
    }
    setForms((current) => ({ ...current, [activeModule]: nextForm }));
    setEditingId(item._id);
    setStatus("idle");
    setError("");
    setImageFileName("");
    setGalleryFileNames(Array.isArray(nextForm.gallery) ? nextForm.gallery.map((_, idx) => `Other Photo ${idx + 1}`) : []);
    if (typeof window !== "undefined") {
      window.location.assign("#add-item");
    }
  };

  const handleDelete = async (id) => {
    const deletedProduct = activeModule === "products" ? lists.products.find((item) => item._id === id) || null : null;

    try {
      setStatus("loading");
      setError("");
      if (activeModule === "products") {
        removeProductLocally(id);
      }
      await runDelete(activeModule, id);
      if (editingId === id) resetForm();
      await loadDashboardSummary();
      await loadAllData();
      setStatus("success");
    } catch (apiError) {
      if (activeModule === "products" && deletedProduct) {
        upsertProductLocally(deletedProduct, "create");
      }
      setStatus("error");
      setError(apiError.response?.data?.message || "Unable to delete the item.");
    }
  };

  const handleEnquiryStatus = async (id, nextStatus) => {
    try {
      setStatus("loading");
      setError("");
      await runStatusUpdate(activeModule, id, { status: nextStatus });
      await loadDashboardSummary();
      await loadAllData();
      setStatus("success");
    } catch (apiError) {
      setStatus("error");
      setError(apiError.response?.data?.message || "Unable to update status.");
    }
  };

  const renderFields = () => {
    if (activeModule === "products") {
      return (
        <>
          <label className="text-sm font-semibold text-ink">
            Name
            <input name="name" value={forms.products.name} onChange={handleChange} className="mt-1 w-full rounded-xl border border-ink/20 bg-ivory p-3 text-ink" />
          </label>
          <label className="text-sm font-semibold text-ink">
            Category
            <select name="category" value={forms.products.category} onChange={handleChange} className="mt-1 w-full rounded-xl border border-ink/20 bg-ivory p-3 text-ink" >
              {categories.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-ink">
            Featured on home page (optional)
            <select
              name="topProductRank"
              value={forms.products.topProductRank ?? ""}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-ink/20 bg-ivory p-3 text-ink"
            >
              <option value="">Not featured</option>
              <option value="1">Top 1</option>
              <option value="2">Top 2</option>
              <option value="3">Top 3</option>
              <option value="4">Top 4</option>
              <option value="5">Top 5</option>
              <option value="6">Top 6</option>
            </select>
          </label>
          <label className="text-sm font-semibold text-ink">
            Size
            <input name="size" value={forms.products.size} onChange={handleChange} className="mt-1 w-full rounded-xl border border-ink/20 bg-ivory p-3 text-ink" />
          </label>
          <label className="text-sm font-semibold text-ink">
            Selling price (₹)
            <input name="price" inputMode="numeric" placeholder="e.g. 926" value={forms.products.price} onChange={handleChange} className="mt-1 w-full rounded-xl border border-ink/20 bg-ivory p-3 text-ink" />
          </label>
          <label className="text-sm font-semibold text-ink">
            MRP (₹, optional, shown struck through)
            <input name="mrp" inputMode="numeric" placeholder="e.g. 5999" value={forms.products.mrp} onChange={handleChange} className="mt-1 w-full rounded-xl border border-ink/20 bg-ivory p-3 text-ink" />
          </label>
          <label className="text-sm font-semibold text-ink">
            Stock
            <select name="inStock" value={forms.products.inStock} onChange={handleChange} className="mt-1 w-full rounded-xl border border-ink/20 bg-ivory p-3 text-ink">
              <option value="true">In stock</option>
              <option value="false">Out of stock</option>
            </select>
          </label>
          <label className="text-sm font-semibold text-ink sm:col-span-2">
            Highlights (optional, one per line)
            <textarea name="features" value={forms.products.features} onChange={handleChange} rows={4} className="mt-1 w-full rounded-xl border border-ink/20 bg-ivory p-3 text-ink" />
          </label>
          {/* <label className="text-sm font-semibold text-ink sm:col-span-2">
            Short Description
            <textarea name="shortDescription" value={forms.products.shortDescription} onChange={handleChange} className="mt-1 w-full rounded-xl border border-ink/20 bg-ivory p-3 text-ink" rows={3} />
          </label> */}
          <label className="text-sm font-semibold text-ink sm:col-span-2">
            Description
            <textarea name="description" value={forms.products.description} onChange={handleChange} className="mt-1 w-full rounded-xl border border-ink/20 bg-ivory p-3 text-ink" rows={4} />
          </label>

          <label className="text-sm font-semibold text-ink">
            Status
            <select name="status" value={forms.products.status} onChange={handleChange} className="mt-1 w-full rounded-xl border border-ink/20 bg-ivory p-3 text-ink">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </>
      );
    }

    if (activeModule === "testimonials") {
      return (
        <>
          <label className="text-sm font-semibold text-ink">
            Name
            <input name="name" value={forms.testimonials.name} onChange={handleChange} className="mt-1 w-full rounded-xl border border-ink/20 bg-ivory p-3 text-ink" />
          </label>
          <label className="text-sm font-semibold text-ink">
            Location
            <input name="location" value={forms.testimonials.location} onChange={handleChange} className="mt-1 w-full rounded-xl border border-ink/20 bg-ivory p-3 text-ink" />
          </label>
          <label className="text-sm font-semibold text-ink">
            Rating
            <input type="number" min="1" max="5" name="rating" value={forms.testimonials.rating} onChange={handleChange} className="mt-1 w-full rounded-xl border border-ink/20 bg-ivory p-3 text-ink" />
          </label>
          <label className="text-sm font-semibold text-ink">
            Status
            <select name="status" value={forms.testimonials.status} onChange={handleChange} className="mt-1 w-full rounded-xl border border-ink/20 bg-ivory p-3 text-ink">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <label className="text-sm font-semibold text-ink sm:col-span-2">
            Review
            <textarea name="review" value={forms.testimonials.review} onChange={handleChange} className="mt-1 w-full rounded-xl border border-ink/20 bg-ivory p-3 text-ink" rows={4} required />
          </label>
        </>
      );
    }

    if (activeModule === "gallery") {
      return (
        <>
          <label className="text-sm font-semibold text-ink">
            Title
            <input name="title" value={forms.gallery.title} onChange={handleChange} className="mt-1 w-full rounded-xl border border-ink/20 bg-ivory p-3 text-ink" required />
          </label>
          <label className="text-sm font-semibold text-ink">
            Category
            <select name="category" value={forms.gallery.category} onChange={handleChange} className="mt-1 w-full rounded-xl border border-ink/20 bg-ivory p-3 text-ink" required>
              {categories.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </>
      );
    }

    if (activeModule === "team") {
      return (
        <>
          <label className="text-sm font-semibold text-ink">
            Name
            <input name="name" value={forms.team.name} onChange={handleChange} className="mt-1 w-full rounded-xl border border-ink/20 bg-ivory p-3 text-ink" required />
          </label>
          <label className="text-sm font-semibold text-ink">
            Role
            <input name="role" value={forms.team.role} onChange={handleChange} className="mt-1 w-full rounded-xl border border-ink/20 bg-ivory p-3 text-ink" required />
          </label>
        </>
      );
    }

    // if (activeModule === "settings") {
    //   return (
    //     <>
    //       <div className="sm:col-span-2">
    //         <h3 className="text-lg font-semibold text-ink">Company Details</h3>
    //         <p className="mt-1 text-sm text-ink/70">Update the brand identity and core contact information used across the website.</p>
    //       </div>

    //       <label className="text-sm font-semibold text-ink">
    //         Official Company Name
    //         <input
    //           type="text"
    //           name="companyName"
    //           value={forms.settings.companyName}
    //           onChange={handleChange}
    //           placeholder="Imperial Bath Solutions"
    //           className="mt-1 w-full rounded-xl border border-ink/20 bg-ivory p-3 text-ink"
    //         />
    //       </label>
    //       <label className="text-sm font-semibold text-ink">
    //         Registered Address
    //         <input
    //           type="text"
    //           name="address"
    //           value={forms.settings.address}
    //           onChange={handleChange}
    //           placeholder="123 Luxury Avenue, Bath City, UK"
    //           className="mt-1 w-full rounded-xl border border-ink/20 bg-ivory p-3 text-ink"
    //         />
    //       </label>
    //       <label className="text-sm font-semibold text-ink">
    //         Corporate Email
    //         <input
    //           type="email"
    //           name="email"
    //           value={forms.settings.email}
    //           onChange={handleChange}
    //           placeholder="contact@imperialbath.com"
    //           className="mt-1 w-full rounded-xl border border-ink/20 bg-ivory p-3 text-ink"
    //         />
    //       </label>
    //       <label className="text-sm font-semibold text-ink">
    //         Office Phone Number
    //         <input
    //           type="tel"
    //           name="phone"
    //           value={forms.settings.phone}
    //           onChange={handleChange}
    //           placeholder="+44 1234 567890"
    //           className="mt-1 w-full rounded-xl border border-ink/20 bg-ivory p-3 text-ink"
    //         />
    //       </label>
    //       <div className="sm:col-span-2">
    //         <h3 className="text-lg font-semibold text-ink">Contact & Messaging</h3>
    //         <p className="mt-1 text-sm text-ink/70">Provide the WhatsApp channel used for customer enquiries and instant support.</p>
    //       </div>
    //       <label className="text-sm font-semibold text-ink sm:col-span-2">
    //         WhatsApp Contact Number
    //         <input
    //           type="tel"
    //           name="whatsappNumber"
    //           value={forms.settings.whatsappNumber}
    //           onChange={handleChange}
    //           placeholder="+44 7700 900123"
    //           className="mt-1 w-full rounded-xl border border-ink/20 bg-ivory p-3 text-ink"
    //         />
    //       </label>
    //       <div className="sm:col-span-2">
    //         <h3 className="text-lg font-semibold text-ink">Social Media Links</h3>
    //         <p className="mt-1 text-sm text-ink/70">Add polished social profile links that appear in the website footer and contact pages.</p>
    //       </div>
    //       <label className="text-sm font-semibold text-ink">
    //         Instagram Profile URL
    //         <input
    //           type="url"
    //           name="instagram"
    //           value={forms.settings.instagram}
    //           onChange={handleChange}
    //           placeholder="https://www.instagram.com/imperialbath"
    //           className="mt-1 w-full rounded-xl border border-ink/20 bg-ivory p-3 text-ink"
    //         />
    //       </label>
    //       <label className="text-sm font-semibold text-ink">
    //         Facebook Page URL
    //         <input
    //           type="url"
    //           name="facebook"
    //           value={forms.settings.facebook}
    //           onChange={handleChange}
    //           placeholder="https://www.facebook.com/imperialbath"
    //           className="mt-1 w-full rounded-xl border border-ink/20 bg-ivory p-3 text-ink"
    //         />
    //       </label>
    //       <label className="text-sm font-semibold text-ink sm:col-span-2">
    //         Footer Disclaimer / Tagline
    //         <textarea
    //           name="footerText"
    //           value={forms.settings.footerText}
    //           onChange={handleChange}
    //           placeholder="Delivering premium bathroom solutions with unmatched craftsmanship and service."
    //           className="mt-1 w-full rounded-xl border border-ink/20 bg-ivory p-3 text-ink"
    //           rows={3}
    //         />
    //       </label>
    //       <label className="text-sm font-semibold text-ink sm:col-span-2">
    //         Brand Logo URL
    //         <input
    //           type="url"
    //           name="logo"
    //           value={forms.settings.logo}
    //           onChange={handleChange}
    //           placeholder="https://example.com/logo.svg"
    //           className="mt-1 w-full rounded-xl border border-ink/20 bg-ivory p-3 text-ink"
    //         />
    //       </label>
    //     </>
    //   );
    // }

    return null;
  };

  const renderListCard = (item) => {
    if (activeModule === "products") {
      return <ProductCard product={item} />;
    }

    if (activeModule === "contact-enquiries" || activeModule === "quote-enquiries") {
      return (
        <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-lg font-bold text-ink">{item.name}</h4>
              {item.email && <p className="mt-1 text-sm text-ink/70">{item.email}</p>}
            </div>
            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${item.status === "contacted" || item.status === "confirmed" ? "bg-amber-100 text-amber-700" : item.status === "closed" || item.status === "delivered" ? "bg-green-100 text-green-700" : item.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
              {item.status || "new"}
            </span>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 text-sm text-ink/70">
            {item.phone && (
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-gold" />
                <span>{item.phone}</span>
              </div>
            )}
            {item.interest && !(Array.isArray(item.items) && item.items.length) && (
              <div className="flex items-center gap-2">
                <Tag size={14} className="text-gold" />
                <span>{item.interest}</span>
              </div>
            )}
            {item.source && (
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-gold" />
                <span>{item.source}</span>
              </div>
            )}
            {item.createdAt && (
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-gold" />
                <FormattedDate iso={item.createdAt} />
              </div>
            )}
          </div>
          {Array.isArray(item.items) && item.items.length > 0 && (
            <div className="mt-4 overflow-hidden rounded-2xl border border-ink/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-ivory text-ink/60">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Product</th>
                    <th className="px-4 py-2 text-right font-semibold">Qty</th>
                    <th className="px-4 py-2 text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {item.items.map((line, idx) => (
                    <tr key={`${line.product}-${idx}`}>
                      <td className="px-4 py-2 text-ink">{line.name}</td>
                      <td className="px-4 py-2 text-right">{line.quantity}</td>
                      <td className="px-4 py-2 text-right">{rupees(line.price * line.quantity)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold text-ink">
                    <td className="px-4 py-2" colSpan={2}>Total</td>
                    <td className="px-4 py-2 text-right">{rupees(item.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          {(item.address || item.city || item.pincode) && (
            <p className="mt-3 text-sm text-ink/80">
              <span className="font-semibold text-ink">Deliver to:</span> {[item.address, item.city, item.pincode].filter(Boolean).join(", ")}
            </p>
          )}
          {item.message && (
            <div className="mt-4 rounded-2xl bg-ivory p-4 text-sm text-ink/80">{item.message}</div>
          )}
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
        {item.image && <img src={item.image} alt={item.title || item.name} className="mb-4 h-40 w-full rounded-2xl object-cover" />}
        {item.title && <h4 className="text-lg font-bold text-ink">{item.title}</h4>}
        {item.name && <h4 className="text-lg font-bold text-ink">{item.name}</h4>}
        {item.role && <p className="text-sm font-semibold text-gold">{item.role}</p>}
        {item.location && <p className="text-sm text-ink/70">{item.location}</p>}
        {item.category && <p className="text-sm text-ink/70">Category: {item.category}</p>}
        {item.size && <p className="text-sm text-ink/70">Size: {item.size}</p>}
        {item.price && <p className="text-sm text-ink/70">Price: {item.price}</p>}
        {/* {item.shortDescription && <p className="mt-2 text-sm text-ink/70">{item.shortDescription}</p>} */}
        {item.description && <p className="mt-2 text-sm text-ink/70">{item.description}</p>}
        {item.review && <p className="mt-2 text-sm text-ink/70">{item.review}</p>}
      </div>
    );
  };

  const renderEnquiryList = () => {
    const items = activeModule === "contact-enquiries" ? lists.contacts : lists.quotes;

    return (
      <div className="grid gap-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-ink/10 bg-white p-6 text-center text-sm text-ink/60">Nothing here yet.</div>
        ) : (
          items.map((item) => (
            <div key={item._id} className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
              {renderListCard(item)}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-ink">
                  Status
                  <select
                    value={item.status || "new"}
                    onChange={(event) => handleEnquiryStatus(item._id, event.target.value)}
                    className="rounded-xl border border-ink/20 bg-white px-3 py-2 text-sm capitalize"
                  >
                    {(activeModule === "quote-enquiries" ? orderStatuses : messageStatuses).map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <button type="button" onClick={() => handleDelete(item._id)} className="rounded-xl border border-red-600 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderManageListPanel = () => {
    const items = lists[activeModule] || [];

    return (
      <div>
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-ink/10 bg-white px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Manage</p>
            <h2 className="mt-2 text-2xl font-bold text-ink">{activeSidebarLabel}</h2>
          </div>
          <div className="rounded-3xl bg-ivory px-4 py-3 text-sm text-ink/70">Total: {items.length}</div>
        </header>

        <div className="rounded-3xl border border-ink/10 bg-white p-6">
          {items.length === 0 ? (
            <p className="text-sm text-ink/60">No items yet.</p>
          ) : activeModule === "products" ? (
            <div className="space-y-4">
              {items.map((product) => (
                <div key={product._id} className="rounded-3xl border border-ink/10 bg-ivory p-4 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="text-lg font-bold text-ink">{product.name}</h4>
                        {product.category && <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold uppercase text-gold">{product.category}</span>}
                      </div>
                      <div className="mt-2 grid gap-2 sm:grid-cols-3">
                        <p className="text-sm text-ink/70">Size: {product.size || "—"}</p>
                        <p className="text-sm text-ink/70">Price: {product.price || "—"}</p>
                        <p className="text-sm text-ink/70">Status: {product.status || "—"}</p>
                      </div>
                      {product.shortDescription && <p className="mt-3 text-sm text-ink/80">{product.shortDescription}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2 pt-4 sm:pt-0 sm:shrink-0">
                      <button
                        type="button"
                        onClick={() => prepareFormForEdit(product)}
                        className="rounded-lg border border-ink/25 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-white"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product._id)}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              {items.map((item) => (
                <div key={item._id} className="rounded-2xl border border-ink/10 bg-ivory p-4">
                  {renderListCard(item)}
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => prepareFormForEdit(item)}
                      className="rounded-lg border border-ink/25 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-white"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item._id)}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSectionPreview = () => {
    const sectionForm = forms[activeModule];

    if (activeModule === "products") {
      const hasPreview = Boolean(sectionForm.name || sectionForm.category || sectionForm.price || sectionForm.size || sectionForm.shortDescription || sectionForm.image);

      if (!hasPreview) {
        return <p className="text-sm text-ink/60">Complete product fields to see a preview.</p>;
      }

      return (
        <div className="rounded-3xl border border-ink/10 bg-ivory p-4 shadow-sm">
          <div className="grid gap-4">
            {sectionForm.image && (
              <img src={sectionForm.image} alt={sectionForm.name || "Product preview"} className="h-40 w-full rounded-2xl object-cover" />
            )}
            <div>
              <h4 className="text-lg font-bold text-ink">{sectionForm.name || "Untitled Product"}</h4>
              {sectionForm.category && <p className="mt-1 text-sm text-ink/70">Category: {sectionForm.category}</p>}
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                <p className="text-sm text-ink/70">Size: {sectionForm.size || "—"}</p>
                <p className="text-sm text-ink/70">Price: {sectionForm.price || "—"}</p>
                <p className="text-sm text-ink/70">Status: {sectionForm.status || "—"}</p>
              </div>
              {sectionForm.shortDescription && <p className="mt-3 text-sm text-ink/80">{sectionForm.shortDescription}</p>}
            </div>
          </div>
        </div>
      );
    }

    if (activeModule === "testimonials") {
      const hasPreview = Boolean(sectionForm.name || sectionForm.location || sectionForm.review || sectionForm.image);

      if (!hasPreview) {
        return <p className="text-sm text-ink/60">Complete testimonial fields to see a preview.</p>;
      }

      return (
        <div className="rounded-3xl border border-ink/10 bg-ivory p-4 shadow-sm">
          <div className="grid gap-4">
            {sectionForm.image && (
              <img src={sectionForm.image} alt={sectionForm.name || "Testimonial preview"} className="h-40 w-full rounded-2xl object-cover" />
            )}
            <div>
              <h4 className="text-lg font-bold text-ink">{sectionForm.name || "Unnamed Reviewer"}</h4>
              {sectionForm.location && <p className="text-sm text-ink/70">{sectionForm.location}</p>}
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                <p className="text-sm text-ink/70">Rating: {sectionForm.rating || "—"}</p>
                <p className="text-sm text-ink/70">Status: {sectionForm.status || "—"}</p>
                <span className="text-sm text-ink/70">&nbsp;</span>
              </div>
              {sectionForm.review && <p className="mt-3 text-sm text-ink/80">{sectionForm.review}</p>}
            </div>
          </div>
        </div>
      );
    }

    if (activeModule === "gallery") {
      const hasPreview = Boolean(sectionForm.title || sectionForm.category || sectionForm.image);
      const categoryLabel = categories.find((option) => option.value === sectionForm.category)?.label || sectionForm.category;

      if (!hasPreview) {
        return <p className="text-sm text-ink/60">Complete gallery fields to see a preview.</p>;
      }

      return (
        <div className="rounded-3xl border border-ink/10 bg-ivory p-4 shadow-sm">
          <div className="grid gap-4">
            {sectionForm.image && (
              <img src={sectionForm.image} alt={sectionForm.title || "Gallery preview"} className="h-40 w-full rounded-2xl object-cover" />
            )}
            <div>
              <h4 className="text-lg font-bold text-ink">{sectionForm.title || "Untitled Gallery Item"}</h4>
              {categoryLabel && <p className="mt-1 text-sm text-ink/70">Category: {categoryLabel}</p>}
            </div>
          </div>
        </div>
      );
    }

    if (activeModule === "team") {
      const hasPreview = Boolean(sectionForm.name || sectionForm.role || sectionForm.image);

      if (!hasPreview) {
        return <p className="text-sm text-ink/60">Complete team member fields to see a preview.</p>;
      }

      return (
        <div className="rounded-3xl border border-ink/10 bg-ivory p-4 shadow-sm">
          <div className="grid gap-4">
            {sectionForm.image && (
              <img src={sectionForm.image} alt={sectionForm.name || "Team preview"} className="h-40 w-full rounded-2xl object-cover" />
            )}
            <div>
              <h4 className="text-lg font-bold text-ink">{sectionForm.name || "Unnamed Team Member"}</h4>
              {sectionForm.role && <p className="mt-1 text-sm text-ink/70">{sectionForm.role}</p>}
            </div>
          </div>
        </div>
      );
    }

    return <p className="text-sm text-ink/60">Select a section to see a preview.</p>;
  };

  const renderDashboard = () => {
    const summaryCards = [
      { label: "Products", value: lists.productsCount || lists.products.length, icon: Layers },
      { label: "Orders", value: lists.quotesCount || lists.quotes.length, icon: ClipboardList },
      { label: "Messages", value: lists.contactsCount || lists.contacts.length, icon: Mail },
      { label: "Reviews", value: lists.testimonialsCount || lists.testimonials.length, icon: Sparkles },
    ];

    return (
      <div className="px-4 py-5 sm:px-7">
        <header className="mb-6 rounded-3xl border border-ink/10 bg-white p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Overview</p>
              <h1 className="mt-2 text-3xl font-bold text-ink">Admin Dashboard</h1>
            </div>
            <div className="rounded-3xl bg-ivory px-4 py-3 text-sm text-ink/70">{new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}</div>
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-3">
          {summaryCards.map((card) => (
            <div key={card.label} className="rounded-3xl border border-ink/10 bg-white p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold/20 text-gold"><card.icon size={20} /></span>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-ink/40">{card.label}</p>
                  <p className="mt-2 text-3xl font-bold text-ink">{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <div className="rounded-3xl border border-ink/10 bg-white p-6">
            <h2 className="text-xl font-bold text-ink">Latest Orders</h2>
            <p className="mt-2 text-sm text-ink/70">Orders placed from the website cart.</p>
            <div className="mt-4 space-y-4">
              {lists.quotes.slice(0, 3).map((item) => (
                <div key={item._id} className="rounded-2xl border border-ink/10 bg-ivory p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{item.name}</p>
                      <p className="text-sm text-ink/70">{item.email}</p>
                    </div>
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${item.status === "contacted" ? "bg-amber-100 text-amber-700" : item.status === "closed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{item.status || "new"}</span>
                  </div>
                  {item.total > 0 && <p className="mt-2 text-sm font-semibold text-ink">{rupees(item.total)} · {item.interest}</p>}
                  {item.message && <p className="mt-3 text-sm text-ink/80">{item.message}</p>}
                </div>
              ))}
              {!lists.quotes.length && <p className="text-sm text-ink/60">No orders yet.</p>}
            </div>
          </div>

          <div className="rounded-3xl border border-ink/10 bg-white p-6">
            <h2 className="text-xl font-bold text-ink">Latest Messages</h2>
            <p className="mt-2 text-sm text-ink/70">Messages from the contact page.</p>
            <div className="mt-4 space-y-4">
              {lists.contacts.slice(0, 3).map((item) => (
                <div key={item._id} className="rounded-2xl border border-ink/10 bg-ivory p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{item.name}</p>
                      <p className="text-sm text-ink/70">{item.email}</p>
                    </div>
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${item.status === "contacted" ? "bg-amber-100 text-amber-700" : item.status === "closed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{item.status || "new"}</span>
                  </div>
                  {item.message && <p className="mt-3 text-sm text-ink/80">{item.message}</p>}
                </div>
              ))}
              {!lists.contacts.length && <p className="text-sm text-ink/60">No messages yet.</p>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-ivory">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        {isSidebarOpen && (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            aria-label="Close sidebar"
          />
        )}
        <aside className={`border-r border-ink/10 bg-white px-5 py-6 lg:static lg:z-auto ${isSidebarOpen ? "fixed inset-y-0 left-0 z-50 w-[280px] translate-x-0 shadow-2xl" : "fixed inset-y-0 left-0 z-50 -translate-x-full transition-transform duration-200 ease-in-out"} lg:translate-x-0 lg:w-[280px] lg:shadow-none`}>
          <div className="rounded-2xl border border-gold/25 bg-ivory p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Garviks Admin</p>
            <h1 className="mt-2 text-xl font-bold text-ink">Control Panel</h1>
          </div>
          <nav className="mt-6 space-y-4">
            {sidebarSections.map((section) => {
              const sectionOpen = section.title
                ? expandedSections[section.title] || section.items.some((item) => item.key === activeSidebarKey)
                : true;
              const SectionIcon = section.items[0].icon;

              return (
                <div key={section.title || "dashboard-section"} className="rounded-3xl border border-ink/10 bg-ivory p-3">
                  {section.title ? (
                    <button
                      type="button"
                      onClick={() => toggleSection(section.title)}
                      className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold text-ink/90 transition hover:bg-white"
                    >
                      <span className="flex items-center gap-3">
                        <SectionIcon size={16} />
                        {section.title}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`${sectionOpen ? "rotate-180" : "rotate-0"} transition-transform duration-200`}
                      />
                    </button>
                  ) : null}
                  <div className={`${section.title ? "mt-2" : ""} space-y-1 ${section.title && !sectionOpen ? "hidden" : "block"}`}>
                    {section.items.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handleModuleChange(item.key, item.module)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${activeSidebarKey === item.key ? "bg-ink text-champagne" : "text-ink/80 hover:bg-white"}`}
                      >
                        <item.icon size={16} />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            <div className="mt-4 rounded-3xl border border-rose-200 bg-rose-50 p-3">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
              >
                Logout
              </button>
            </div>
          </nav>
        </aside>

        <div className="px-4 py-5 sm:px-7">
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <button
              type="button"
              onClick={() => setIsSidebarOpen((current) => !current)}
              className="inline-flex items-center gap-2 rounded-2xl border border-ink/20 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:bg-ivory"
            >
              <Menu size={16} />
              {isSidebarOpen ? "Hide menu" : "Show menu"}
            </button>
          </div>
          {isDashboard ? (
            renderDashboard()
          ) : isEnquiryModule ? (
            <div>
              <header className="mb-6 rounded-3xl border border-ink/10 bg-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Enquiries</p>
                    <h2 className="mt-2 text-2xl font-bold text-ink">{cardTitles[activeModule]}</h2>
                  </div>
                  <div className="rounded-3xl bg-ivory px-4 py-3 text-sm text-ink/70">Total: {activeModule === "contact-enquiries" ? lists.contacts.length : lists.quotes.length}</div>
                </div>
              </header>
              {error && <p className="mb-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
              {renderEnquiryList()}
            </div>
          ) : isManageView ? renderManageListPanel() : (
            <div>
              <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-ink/10 bg-white px-6 py-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Content Management</p>
                  <h2 className="mt-2 text-2xl font-bold text-ink">{activeSidebarLabel}</h2>
                </div>
              </header>

              <div className={`grid gap-6 ${editingId ? "" : "xl:grid-cols-[1.5fr_1fr]"}`}>
                <section id="add-item" className="rounded-3xl border border-ink/10 bg-white p-6">
                  <div className="mb-6 flex items-start gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-ivory text-gold">
                      <PlusCircle size={20} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-ink">
                        {editingId ? "Edit item" : activeAction === "manage" ? "Manage items" : "Add new item"}
                      </h3>
                      <p className="text-sm text-ink/70">
                        {editingId
                          ? "Update the selected item details."
                          : activeAction === "manage"
                            ? "Review current items and edit or delete entries from this section."
                            : "Use the form to add or update website content for the selected section."}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                    {renderFields()}

                    {hasImageField && (
                      <label className="text-sm font-semibold text-ink sm:col-span-2">
                        Upload Image {activeModule === "testimonials" ? "(optional)" : ""}
                        <input
                          ref={imageInputRef}
                          type="file"
                          accept={imageAcceptTypes}
                          onChange={handleImageFileChange}
                          className="mt-1 w-full rounded-xl border border-ink/20 bg-ivory p-3 text-ink"
                          required={activeModule === "products" && !editingId}
                        />
                      </label>
                    )}

                    {activeModule === "products" && (
                      <label className="text-sm font-semibold text-ink sm:col-span-2">
                        Other Photos (Optional, max 10)
                        <input
                          ref={galleryInputRef}
                          type="file"
                          accept={imageAcceptTypes}
                          multiple
                          onChange={handleGalleryFilesChange}
                          className="mt-1 w-full rounded-xl border border-ink/20 bg-ivory p-3 text-ink"
                        />
                      </label>
                    )}

                    {imageFileName && <p className="text-xs text-ink/70 sm:col-span-2">Selected main image: {imageFileName}</p>}
                    {activeModule === "products" && galleryFileNames.length > 0 && (
                      <p className="text-xs text-ink/70 sm:col-span-2">
                        Selected other photos: {galleryFileNames.join(", ")}
                      </p>
                    )}


                    {activeModule === "products" && editingId && forms.products.image && (
                      <div className="sm:col-span-2">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink/60">Current Main Image</p>
                        <img
                          src={forms.products.image}
                          alt={forms.products.name || "Current product image"}
                          className="h-40 w-full rounded-2xl border border-ink/10 object-cover sm:w-72"
                        />
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                            className="rounded-lg border border-ink/25 px-3 py-1.5 text-xs font-semibold text-ink hover:bg-white"
                          >
                            Change Main Image
                          </button>
                          <button
                            type="button"
                            onClick={removeCurrentMainImage}
                            className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            Remove Main Image
                          </button>
                        </div>
                      </div>
                    )}

                    {activeModule === "products" && editingId && Array.isArray(forms.products.gallery) && forms.products.gallery.length > 0 && (
                      <div className="sm:col-span-2">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink/60">Current Other Photos</p>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {forms.products.gallery.filter(Boolean).map((photo, idx) => (
                            <div key={`${idx}-${photo.slice(0, 20)}`} className="relative">
                              <img
                                src={photo}
                                alt={`Other photo ${idx + 1}`}
                                className="h-24 w-full rounded-xl border border-ink/10 object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeGalleryPhotoAt(idx)}
                                className="absolute right-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => galleryInputRef.current?.click()}
                            className="rounded-lg border border-ink/25 px-3 py-1.5 text-xs font-semibold text-ink hover:bg-white"
                          >
                            Change Other Photos
                          </button>
                          <button
                            type="button"
                            onClick={clearAllGalleryPhotos}
                            className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            Remove All Other Photos
                          </button>
                        </div>
                      </div>
                    )}
                    {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
                    {status === "success" && <p className="text-sm text-green-700 sm:col-span-2">{editingId ? "Updated successfully." : "Added successfully."}</p>}

                    <button type="submit" className="inline-flex w-fit items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-champagne" disabled={status === "loading"}>
                      <Save size={16} />
                      {status === "loading" ? "Saving..." : editingId ? "Update" : "Add"}
                    </button>

                    {editingId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="inline-flex w-fit items-center gap-2 rounded-xl border border-ink/20 px-5 py-2.5 text-sm font-semibold text-ink"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </form>
                </section>

                {!editingId && (
                  <section className="rounded-3xl border border-ink/10 bg-white p-6">
                    <div className="mb-4 flex items-center gap-3 rounded-xl border border-ink/15 bg-ivory px-3 py-2">
                      <Search size={16} className="text-gold" />
                      <span className="text-sm font-medium text-ink/80">Section Preview</span>
                    </div>
                    <h3 className="text-xl font-bold text-ink">Current {cardTitles[activeModule]}</h3>
                    <p className="mt-1 text-sm text-ink/70">This content is shown on the public website.</p>
                    <div className="mt-6">
                      {activeModule === "settings" ? (
                        <div className="rounded-2xl border border-ink/10 bg-ivory p-6">
                          <h4 className="text-lg font-semibold text-ink">Saved Settings</h4>
                          <div className="mt-4 space-y-2 text-sm text-ink/70">
                            <p><span className="font-semibold text-ink">Company:</span> {lists.settings.companyName || "—"}</p>
                            <p><span className="font-semibold text-ink">Phone:</span> {lists.settings.phone || "—"}</p>
                            <p><span className="font-semibold text-ink">Email:</span> {lists.settings.email || "—"}</p>
                            <p><span className="font-semibold text-ink">Address:</span> {lists.settings.address || "—"}</p>
                            <p><span className="font-semibold text-ink">WhatsApp:</span> {lists.settings.whatsappNumber || "—"}</p>
                            <p><span className="font-semibold text-ink">Footer Text:</span> {lists.settings.footerText || "—"}</p>
                          </div>
                        </div>
                      ) : activeAction === "add" && ["products", "testimonials", "gallery", "team"].includes(activeModule) ? (
                        renderSectionPreview()
                      ) : lists[activeModule].length === 0 ? (
                        <p className="text-sm text-ink/60">No items yet.</p>
                      ) : activeModule === "products" && activeAction === "manage" ? (
                        <div className="space-y-4">
                          {lists.products.map((product) => (
                            <div key={product._id} className="rounded-3xl border border-ink/10 bg-ivory p-4 shadow-sm">
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-3">
                                    <h4 className="text-lg font-bold text-ink">{product.name}</h4>
                                    {product.category && <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold uppercase text-gold">{product.category}</span>}
                                  </div>
                                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                                    <p className="text-sm text-ink/70">Size: {product.size || "—"}</p>
                                    <p className="text-sm text-ink/70">Price: {product.price || "—"}</p>
                                    <p className="text-sm text-ink/70">Status: {product.status || "—"}</p>
                                  </div>
                                  {product.shortDescription && <p className="mt-3 text-sm text-ink/80">{product.shortDescription}</p>}
                                </div>
                                <div className="flex flex-wrap gap-2 pt-4 sm:pt-0 sm:shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => prepareFormForEdit(product)}
                                    className="rounded-lg border border-ink/25 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-white"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(product._id)}
                                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {lists[activeModule].map((item) => (
                            <div key={item._id} className="rounded-2xl border border-ink/10 bg-ivory p-4">
                              {renderListCard(item)}
                              <div className="mt-3 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => prepareFormForEdit(item)}
                                  className="rounded-lg border border-ink/25 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-white"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(item._id)}
                                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default AdminPannel;
