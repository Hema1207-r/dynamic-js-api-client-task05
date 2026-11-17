# Shoply — Dynamic JavaScript DOM Logic & RESTful API Client

A responsive product explorer built with semantic HTML, CSS and modular JavaScript ES6+. It demonstrates the Task 05 requirements.

## Features

- **REST API:** Uses `fetch()` and `async/await` to load products from Fake Store API.
- **Dynamic DOM:** Renders product cards without a full-page reload.
- **Live search:** Filters products by title, description and category as the user types.
- **Category tabs:** Filters by the API-provided product categories.
- **Sorting:** Featured, price low-to-high, price high-to-low, top-rated and name A–Z.
- **Client-side caching:** Stores API responses in `localStorage` for 10 minutes; saved items are also stored locally.
- **Loading and error states:** Skeleton cards while loading, readable error messages if the API request fails.
- **Responsive design:** Layout adapts from narrow mobile screens to desktop.
- **Modular JavaScript:** API logic is in `api.js`; DOM and interaction logic is in `app.js`.

## Files

```text
dynamic-js-api-client-task05/
├── index.html
├── style.css
├── app.js
├── api.js
└── README.md
```

## Run locally

Because this project uses JavaScript ES modules, open it through a local web server rather than directly as a `file://` page.

### Option A — VS Code Live Server
1. Open the extracted project folder in VS Code.
2. Install/enable the Live Server extension if needed.
3. Right-click `index.html` and choose **Open with Live Server**.

### Option B — Python
From the project folder run:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

An internet connection is needed to contact `https://fakestoreapi.com`.

## Test checklist

1. Wait for product cards to load from the API.
2. Search for a product name.
3. Select each category tab.
4. Try all sorting options.
5. Click **Save item**, then reload and inspect browser localStorage.
6. Refresh the products using the footer button.
7. Turn off internet access and refresh to verify the friendly error state.
8. Resize the browser to 320px, 768px, 1024px and 1440px.

## GitHub submission

Create a public repository named `dynamic-js-api-client-task05`, upload the five project files, and enable GitHub Pages from **Settings → Pages → Deploy from a branch → main → / (root)**.

Note: GitHub Pages serves static files over HTTPS. The API request is made by the browser to Fake Store API, so availability depends on that public service and the user's internet connection.
