import axios from "axios";

const api = axios.create({
  // Keep the base URL as "/api" so the Vite proxy can handle requests.
  // Environment configuration takes priority when it is provided.
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 20000,
  headers: {
    "Content-Type": "application/json"
  }
});

export const ADMIN_TOKEN_KEY = "garviks-admin-token";

// Send the admin's login token with every request, when there is one.
api.interceptors.request.use((config) => {
  try {
    const token = window.localStorage.getItem(ADMIN_TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // Storage blocked: continue without a token.
  }
  return config;
});

// An expired or invalid admin session sends the admin back to the login page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if ((status === 401 || status === 403) && window.location.pathname.startsWith("/admin-panel")) {
      try {
        window.localStorage.removeItem(ADMIN_TOKEN_KEY);
      } catch {
        // ignore
      }
      window.location.assign("/admin-login");
    }
    return Promise.reject(error);
  }
);

export const productApi = {
  getProducts: (params = {}) => api.get("/products", { params }),
  getProductBySlug: (slug, params = {}) => api.get(`/products/slug/${slug}`, { params }),
  getProductById: (id, params = {}) => api.get(`/products/${id}`, { params }),
  getProduct: (slugOrId, params = {}) => api.get(`/products/${slugOrId}`, { params }),
  createProduct: (payload) => api.post("/products", payload),
  updateProduct: (id, payload) => api.put(`/products/${id}`, payload),
  deleteProduct: (id) => api.delete(`/products/${id}`)
};

export const leadApi = {
  // Orders from the cart and enquiries
  createLead: (payload) => api.post("/leads", payload),
  getLeads: () => api.get("/leads"),
  updateLead: (id, payload) => api.put(`/leads/${id}`, payload),
  deleteLead: (id) => api.delete(`/leads/${id}`),
};

export const contactApi = {
  createContact: (payload) => api.post("/contact", payload),
  getContacts: () => api.get("/contact"),
  updateContact: (id, payload) => api.put(`/contact/${id}`, payload),
  deleteContact: (id) => api.delete(`/contact/${id}`),
};

export const settingsApi = {
  getSettings: () => api.get("/settings"),
  updateSettings: (payload) => api.put("/settings", payload),
};

export const authApi = {
  login: (payload) => api.post("/auth/login", payload),
  me: () => api.get("/auth/me")
};  

export const testimonialApi = {
  getTestimonials: (params = {}) => api.get("/testimonials", { params }),
  createTestimonial: (payload) => api.post("/testimonials", payload),
  updateTestimonial: (id, payload) => api.put(`/testimonials/${id}`, payload),
  deleteTestimonial: (id) => api.delete(`/testimonials/${id}`)
};

export const sectionItemApi = {
  getItems: (section, params = {}) =>
    api.get("/section-items", { params: { ...(section ? { section } : {}), ...params } }),
  createItem: (payload) => api.post("/section-items", payload),
  updateItem: (id, payload) => api.put(`/section-items/${id}`, payload),
  deleteItem: (id) => api.delete(`/section-items/${id}`)
};

export const adminApi = {
  getDashboardSummary: () => api.get("/admin/dashboard"),
};

export default api;
