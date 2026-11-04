const CACHE_PREFIX = "garviks-content-v1";

const getKey = (key) => `${CACHE_PREFIX}:${key}`;

const readList = (key) => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(getKey(key));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const writeList = (key, items) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(getKey(key), JSON.stringify(items));
  } catch {
    // Ignore storage failures and continue with the live response.
  }
};

export const getImmediateList = (key, fallbackItems = []) => {
  const cachedItems = readList(key);
  return cachedItems && cachedItems.length > 0 ? cachedItems : fallbackItems;
};

export const saveListCache = (key, items) => {
  writeList(key, Array.isArray(items) ? items : []);
};
