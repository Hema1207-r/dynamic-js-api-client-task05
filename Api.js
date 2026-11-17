// api.js — all remote data access lives in this module.
const API_BASE = "https://fakestoreapi.com";
const CACHE_KEY = "shoply_products_cache_v1";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (!cached.timestamp || !Array.isArray(cached.products)) return null;
    if (Date.now() - cached.timestamp > CACHE_TTL) return null;
    return cached.products;
  } catch (error) {
    console.warn("Could not read product cache:", error);
    return null;
  }
}

function writeCache(products) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      products
    }));
  } catch (error) {
    // The app still works if storage is disabled or full.
    console.warn("Could not save product cache:", error);
  }
}

export async function fetchProducts({ forceRefresh = false } = {}) {
  if (!forceRefresh) {
    const cachedProducts = readCache();
    if (cachedProducts) {
      return { products: cachedProducts, source: "cache" };
    }
  }

  const response = await fetch(`${API_BASE}/products`, {
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    throw new Error(`Product service returned HTTP ${response.status}. Please try again.`);
  }

  const products = await response.json();
  if (!Array.isArray(products)) {
    throw new Error("The product service returned an unexpected response.");
  }

  writeCache(products);
  return { products, source: "api" };
}
