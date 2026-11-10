# Ndago Market

Frontend demonstration prototype for a Malawi multi-vendor marketplace.

## Technology

- HTML5
- CSS3
- Bootstrap 5 from local project assets
- Vanilla JavaScript
- Browser localStorage demonstration data

PHP, Laravel, MySQL, remote frameworks, and external JavaScript dependencies are not part of the frontend prototype.

## Run Locally

Serve the project directory through the local web server and open `index.html`.

## Phase 1 Architecture

- `assets/js/storage.js` centralizes localStorage access.
- `assets/js/data.js` initializes and resets demonstration entities.
- `assets/js/utils.js` provides shared currency, date, escaping, and asset helpers.
- `assets/js/navigation.js` provides shared marketplace search navigation.
- `assets/js/app.js` initializes shared data and cart badges.

## Phase 2 Marketplace

- `assets/js/marketplace.js` renders shared product cards, recent products, and sellers.
- `assets/js/category.js` applies shared search, category, district, price, availability, and sorting filters.
- `assets/js/product.js` renders product details from URL parameters.
- `assets/js/shop.js` renders public seller shops from URL parameters.

Nested pages use `../assets/...` paths for shared assets.

## Demonstration Data

The project seeds products, sellers, categories, customers, cart, orders, seller applications, and enquiries only when their values are absent.

Use the element with `data-reset-demo="true"` in development pages to reset demonstration data without overwriting it on normal page loads.

## Known Issues

- Login is a demonstration interface and is not secure authentication.
- Page-specific product and cart workflows remain under development in later phases.
- Cart badge behavior should only be considered working after browser interaction testing.