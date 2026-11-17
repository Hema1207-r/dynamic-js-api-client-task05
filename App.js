// app.js — UI state, filtering, sorting and DOM rendering.
import { fetchProducts } from "./api.js";

const productGrid = document.querySelector("#productGrid");
const categoryTabs = document.querySelector("#categoryTabs");
const searchInput = document.querySelector("#searchInput");
const sortSelect = document.querySelector("#sortSelect");
const resultCount = document.querySelector("#resultCount");
const statusMessage = document.querySelector("#statusMessage");
const refreshButton = document.querySelector("#refreshButton");
const toast = document.querySelector("#toast");

let allProducts = [];
let activeCategory = "all";
let searchTerm = "";

function showStatus(message, type = "info") {
  statusMessage.textContent = message;
  statusMessage.className = `status-message visible ${type === "error" ? "error" : ""}`;
}
function hideStatus() {
  statusMessage.className = "status-message";
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2300);
}
function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "USD", maximumFractionDigits: 2
  }).format(value);
}
function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}

function buildCategoryTabs(products) {
  const categories = ["all", ...new Set(products.map(product => product.category))];
  categoryTabs.innerHTML = categories.map(category => `
    <button class="category-tab ${category === activeCategory ? "active" : ""}"
      type="button" data-category="${safeText(category)}"
      aria-pressed="${category === activeCategory}">
      ${category === "all" ? "All products" : safeText(category)}
    </button>
  `).join("");
}

function getVisibleProducts() {
  let visible = allProducts.filter(product => {
    const matchesCategory = activeCategory === "all" || product.category === activeCategory;
    const matchesSearch = `${product.title} ${product.description} ${product.category}`
      .toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  switch (sortSelect.value) {
    case "price-low": visible.sort((a, b) => a.price - b.price); break;
    case "price-high": visible.sort((a, b) => b.price - a.price); break;
    case "rating": visible.sort((a, b) => (b.rating?.rate ?? 0) - (a.rating?.rate ?? 0)); break;
    case "name": visible.sort((a, b) => a.title.localeCompare(b.title)); break;
    default: visible.sort((a, b) => a.id - b.id);
  }
  return visible;
}

function renderProducts() {
  const products = getVisibleProducts();
  resultCount.textContent = `${products.length} product${products.length === 1 ? "" : "s"}`;

  if (!products.length) {
    productGrid.innerHTML = `<div class="empty-state"><strong>No products found</strong>Try another search term or category.</div>`;
    return;
  }

  productGrid.innerHTML = products.map(product => `
    <article class="product-card">
      <div class="product-image-wrap">
        <span class="product-category">${safeText(product.category)}</span>
        <img class="product-image" src="${safeText(product.image)}"
          alt="${safeText(product.title)}" loading="lazy"
          onerror="this.style.display='none'">
      </div>
      <div class="product-info">
        <span class="product-title">${safeText(product.title)}</span>
        <div class="product-meta">
          <strong class="price">${formatPrice(product.price)}</strong>
          <span class="rating">★ ${(product.rating?.rate ?? 0).toFixed(1)} <span style="color:#999">(${product.rating?.count ?? 0})</span></span>
        </div>
        <div class="product-bottom">
          <small>Product #${product.id}</small>
          <button class="add-button" type="button" data-add="${product.id}">＋ Save item</button>
        </div>
      </div>
    </article>
  `).join("");
}

async function loadProducts(forceRefresh = false) {
  productGrid.innerHTML = `<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>`;
  showStatus(forceRefresh ? "Refreshing products from the API…" : "Loading products…");

  try {
    const result = await fetchProducts({ forceRefresh });
    allProducts = result.products;
    buildCategoryTabs(allProducts);
    renderProducts();
    hideStatus();
    if (result.source === "cache") {
      showToast("Loaded products from your saved browser cache.");
    } else if (forceRefresh) {
      showToast("Products refreshed successfully.");
    }
  } catch (error) {
    console.error(error);
    productGrid.innerHTML = `<div class="empty-state"><strong>We couldn't load the products.</strong>${safeText(error.message)}</div>`;
    showStatus(`${error.message} Check your internet connection and try again.`, "error");
    resultCount.textContent = "Unavailable";
  }
}

categoryTabs.addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  categoryTabs.querySelectorAll(".category-tab").forEach(tab => {
    const selected = tab === button;
    tab.classList.toggle("active", selected);
    tab.setAttribute("aria-pressed", String(selected));
  });
  renderProducts();
});

searchInput.addEventListener("input", event => {
  searchTerm = event.target.value.trim().toLowerCase();
  renderProducts();
});
sortSelect.addEventListener("change", renderProducts);

productGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  const productId = Number(button.dataset.add);
  const saved = JSON.parse(localStorage.getItem("shoply_saved_items") || "[]");
  if (!saved.includes(productId)) saved.push(productId);
  localStorage.setItem("shoply_saved_items", JSON.stringify(saved));
  button.textContent = "✓ Saved";
  showToast("Item saved in this browser.");
});

refreshButton.addEventListener("click", () => loadProducts(true));

// Keyboard shortcut: Ctrl/Cmd + K focuses the product search field.
document.addEventListener("keydown", event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchInput.focus();
  }
});

loadProducts();
