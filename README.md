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

## Phase 4 Customer Accounts

- `account.html` lets a signed-in demonstration customer edit contact details, save delivery addresses, and log out.
- `my-orders.html` lists orders associated with the current customer; `order-details.html?id=...` shows item and fulfilment details.
- `assets/js/auth.js` provides buyer registration and demo sign-in. It stores only a current customer ID and profile data; passwords are not stored or verified. This is not secure authentication.
- `assets/js/customer.js` renders and saves account data and reads orders from the shared `orders` collection.
- Customer records, saved addresses, and the current demo session live in this browser's localStorage. Clearing site data removes them.
- Order history remains empty until an order exists in localStorage and is associated with the signed-in customer.

## Phase 5 Seller Application and Portal

- `seller-application.html` collects a seller application from the signed-in demonstration customer and displays pending, approved, or rejected status. Rejected applicants can submit an updated application.
- Applications are stored under `sellerApplications` with `applicantId`, shop details, `status`, `submittedAt`, and `reviewNote` fields.
- Existing seller portal pages are connected through `assets/js/seller.js`. The portal requires a seller record whose `ownerId` matches the current customer and whose `approvalStatus` is `approved`.
- Product create, edit, draft, delete, stock, availability, and image data use the shared `products` collection. Images are resized in the browser and stored as data URLs, so they use localStorage space.
- Public product lists and shops exclude draft products and products from sellers that are not approved.
- Seller order actions write status to `order.sellerFulfilment[sellerId]`, keeping fulfilment state separate for multi-seller orders.
- The Phase 6 admin approval workflow should update the application status and create/update the seller record together. It must set `seller.ownerId` to the application's `applicantId` and `seller.approvalStatus` to `approved` before enabling seller tools.
- Demo access and role checks remain browser-only and are not secure authorization. Applications stay pending until an administrator changes their status; there is no seller approval shortcut in this phase.

## Phase 6 Admin Portal

- `admin/dashboard.html` shows local marketplace counts and recorded order value.
- `admin/seller-applications.html` reviews pending applications. Approving creates or updates an owner-linked seller record; rejecting stores a review note and updates an existing seller record if one exists.
- `admin/sellers.html` lists sellers and can suspend or restore approved seller records. Suspended sellers and disabled customer owners are hidden from public shop/product discovery.
- `admin/users.html` lists customer accounts and can disable/enable demo sign-in. Disabled users lose their local demo session on their next account check.
- `admin/products.html` can reject/restore listings. Rejected products are hidden from public discovery while their seller data remains intact.
- `admin/orders.html` displays order totals and updates the overall order status. Seller fulfilment remains in `order.sellerFulfilment[sellerId]`.
- `admin/categories.html` can add, rename, and delete unused categories. Category renames also update existing product display labels; category IDs remain stable.
- All admin pages identify themselves as demonstration tools. localStorage records and frontend status checks do not secure an administrator role.

## Phase 7 Shopping Integration

- `cart.html` and `assets/js/cart-page.js` render persisted cart contents from the shared `cart` and `products` collections. Quantity changes are limited to current catalogue stock; unavailable items must be removed before checkout.
- `checkout.html` and `assets/js/checkout.js` validate contact and delivery details, collect a seller-managed or Ndago-managed delivery choice for each seller, and save a simulated order in the shared `orders` collection.
- Orders preserve `customerId` when a demo customer is signed in, a customer contact snapshot for guest checkouts, item price/quantity/subtotal/seller data, and seller-specific delivery and fulfilment status.
- `order-confirmation.html` and `assets/js/order-confirmation.js` show the created order reference and each seller's delivery choice. Signed-in customers can find linked orders under My Orders; sellers see only their own order items and fulfilment record.
- The order total includes products only. Delivery cost and payment are not collected or estimated. Checkout is a local browser simulation, not a secure transaction.

## Phase 7 QA Notes

- Static integration review covered script loading, localStorage collection names, cart and order field shapes, nested asset paths, and customer/seller order consumers.
- Manual browser interaction checks remain to be completed for cart persistence and stock limits, invalid checkout fields, multi-seller fulfilment, customer order history, seller order status changes, and mobile layouts. Do not treat the cart badge as verified until it is tested in the browser.

## Demonstration Data

The project seeds products, sellers, categories, customers, cart, orders, seller applications, and enquiries only when their values are absent.

Use the element with `data-reset-demo="true"` in development pages to reset demonstration data without overwriting it on normal page loads.

## Known Issues

- Login is a demonstration interface and is not secure authentication.
- All records are stored in browser localStorage and can be edited by the user; order creation and stock updates are not authoritative.
- Cart and checkout behavior has not yet had a complete browser interaction pass. Browser storage limits, especially when seller images are stored as data URLs, can prevent writes.
- The cart badge behavior is intentionally deferred and should not be considered verified until browser interaction testing is completed.

## Future Laravel Integration

- Replace `NdagoStorage` and the demo data layer with API-backed repositories while retaining entity IDs and the customer, seller, product, and order field shapes.
- Enforce account access, seller approval and ownership, stock checks, current prices, order creation, fulfilment updates, and payment verification on the Laravel server. The browser prototype does not provide those security guarantees.
