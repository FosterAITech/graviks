const CACHE_KEY = "garviks-product-cache-v1";

const filterProducts = (products, filterKey = "all") => {
  if (filterKey === "all") return products;
  return products.filter((product) => product.category === filterKey);
};

const readCache = () => {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return { all: parsed };
    }

    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const writeCache = (nextCache) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(nextCache));
  } catch {
    // Ignore storage failures and keep rendering with in-memory data.
  }
};

export const getImmediateProducts = (filterKey = "all") => {
  const cache = readCache();
  const cachedProducts = Array.isArray(cache[filterKey]) ? cache[filterKey] : null;

  if (cachedProducts && cachedProducts.length > 0) {
    return cachedProducts;
  }

  return [];
};

export const saveCachedProducts = (filterKey, products) => {
  const cache = readCache();
  const list = Array.isArray(products) ? products : [];
  cache[filterKey] = list;

  if (filterKey === "all") {
    list.forEach((product) => {
      if (product && product.slug) {
        cache[`product:${product.slug}`] = product;
      }
    });
  }

  writeCache(cache);
};

export const filterCatalog = filterProducts;

export const getImmediateProductBySlug = (slug) => {
  if (!slug) return null;

  const cache = readCache();
  const cachedSnapshot = cache[`product:${slug}`];
  if (cachedSnapshot) return cachedSnapshot;

  const cachedProducts = Array.isArray(cache.all) ? cache.all : [];
  const cachedMatch = cachedProducts.find((product) => product.slug === slug);
  if (cachedMatch) return cachedMatch;

  return null;
};

export const getImmediateRelatedProducts = (slug, limit = 3) => {
  const cache = readCache();
  const cachedProducts = Array.isArray(cache.all) ? cache.all : [];
  return cachedProducts.filter((product) => product.slug !== slug).slice(0, limit);
};
