NDAGO MARKET

Master Frontend Development Specification for Codex

1. PROJECT OVERVIEW

Project name: Ndago Market

Tagline: Your Market. Your People. All in One Place.

Ndago Market is a multi-vendor online marketplace designed for Malawi. It connects customers with small businesses, independent sellers and established retailers.

The platform accommodates products from different industries, including:

- Agriculture
- Clothing and fashion
- Electronics
- Furniture
- Building materials
- Groceries
- Bakery
- Beauty and cosmetics
- Other approved business categories already defined in the project.

The objective is to create a professional, responsive and functional online marketplace.

2. TECHNOLOGY CONSTRAINTS

For the current development stage, use ONLY:

- HTML5
- CSS3
- Vanilla JavaScript
- Bootstrap 5
- Browser localStorage for demonstration data.

Do not introduce Laravel, PHP, MySQL, React, Vue, Angular, Node.js frameworks or other backend technologies at this stage.

Laravel and MySQL will be introduced in a later development stage.

Use the existing locally installed Bootstrap files. Do not depend on external CDNs because development sometimes takes place offline.

3. EXISTING PROJECT STRUCTURE

The existing project contains:

Root:

- index.html
- category.html
- product.html
- cart.html
- checkout.html
- login.html
- register.html

Assets:

- assets/css/bootstrap.min.css
- assets/css/style.css
- assets/js/bootstrap.bundle.min.js
- assets/imgs/
- assets/js/
- assets/vds/

Seller:

- seller/add-product.html
- seller/products.html
- seller/seller-dashboard.html
- seller/seller-orders.html
- seller/shop-profile.html
- seller/shop.html
- seller/assets/

An existing Laravel-app directory may also be present. Do not modify or initialise it during this frontend stage.

IMPORTANT:
First inspect the actual filesystem. The above is the previously shared structure, not a guarantee that every file is unchanged.

Preserve existing functionality and content wherever possible. Do not unnecessarily replace existing pages.

Create additional directories and files only when they are required by the approved architecture.

4. BUSINESS REQUIREMENTS

Purchase model:

Support BOTH:

1. Online purchasing through cart and checkout.
2. Direct seller enquiries through telephone and WhatsApp.

Seller registration:

All new sellers must apply and wait for administrator approval.

Seller workflow:

- Pending approval
- Approved
- Rejected

Only approved sellers can publish products.

Delivery:

Support BOTH:

1. Seller-managed delivery.
2. Ndago-managed delivery.

Customers must be able to select an appropriate delivery arrangement during checkout. Preserve seller-specific fulfilment information for multi-seller orders.

Currency:
Malawi Kwacha (MWK).

Geographic market:
Malawi, including district-based seller and product discovery.

5. DESIGN SYSTEM

Maintain the existing Ndago Market visual identity.

Design direction:

- Vibrant
- Modern
- Welcoming
- Professional
- E-commerce focused
- Mobile responsive

Use the established brand palette:

Primary green: #08783C
Accent green: #159447
Warm gold: #F7C879
Cream: #FFF7EF
Background: #F5F7F5
Dark text: #26352B

Use consistent:

- Typography
- Spacing
- Buttons
- Navigation
- Cards
- Forms
- Shadows
- Border radii
- Responsive breakpoints

The homepage's existing hero direction is a combination of strong marketing text, marketplace imagery and supporting information cards.

Preserve the current homepage and category-page visual identity rather than redesigning the entire project from scratch.

Use real local product images where available. If images are unavailable, provide attractive neutral placeholders with proper fallbacks. Do not rely on external image services for essential functionality.

Use local assets or inline SVG for icons. Do not introduce icon dependencies that require an internet connection.

6. REQUIRED MODULES AND PAGES

A. PUBLIC MARKETPLACE

Existing and required pages:

- index.html
- category.html
- product.html
- seller/shop.html

Homepage:

- Navigation
- Search bar
- Hero section
- Category shortcuts
- Featured products
- Popular sellers
- Recently added products
- Become a seller section
- Footer

Category page:

- Category navigation
- Product search
- Category filters
- District filters
- Maximum price filter
- Availability filter
- Sorting
- Product cards
- Empty results state
- Responsive layout

Product details:

- Product gallery
- Product description
- MWK price
- Stock status
- Seller details
- Seller location
- Quantity selector
- Add to Cart
- Buy Now
- Telephone enquiry
- WhatsApp enquiry
- Related products

Public seller shop:

- Shop profile
- Shop description
- Location
- Contact details
- Seller products

B. SHOPPING MODULE

Pages:

- cart.html
- checkout.html
- order-confirmation.html

Features:

- Add products
- Update quantities
- Remove products
- Clear cart
- Persistent cart
- Product subtotals
- Order totals
- Empty cart state
- Checkout validation
- Delivery selection
- Delivery address
- Order summary
- Order confirmation

Support multiple sellers in one customer cart.

Group order items by seller and maintain separate seller fulfilment information.

Do not invent delivery prices or payment gateway integrations.

C. CUSTOMER MODULE

Pages:

- login.html
- register.html
- account.html
- my-orders.html

Features:

- Registration interface
- Login interface
- Profile management
- Contact information
- Saved addresses
- Order history
- Order details
- Logout

Implement demonstration authentication only. Clearly separate it from future secure server-side authentication.

D. SELLER MODULE

Existing pages:

- seller/seller-dashboard.html
- seller/products.html
- seller/add-product.html
- seller/seller-orders.html
- seller/shop-profile.html
- seller/shop.html

Additional page:

- seller-application.html (or another consistent location selected after auditing existing links).

Features:

- Seller application
- Application status
- Dashboard statistics
- Add products
- Edit products
- Delete products
- Product image management
- Inventory
- Availability
- Order management
- Shop profile management

Only approved sellers may publish products.

E. ADMIN MODULE

Create an admin/ directory.

Pages:

- admin/dashboard.html
- admin/seller-applications.html
- admin/users.html
- admin/products.html
- admin/orders.html
- admin/categories.html

Features:

- Marketplace overview
- Seller application review
- Approve applications
- Reject applications
- Manage users
- Manage sellers
- Moderate products
- Manage categories
- View orders
- Basic reports and statistics

F. SHARED SYSTEMS

Create reusable systems for:

- Navigation
- Footer
- Notifications
- Search
- Product cards
- Form validation
- Modal dialogs
- Data management
- Currency formatting
- Date formatting
- Empty states

7. JAVASCRIPT ARCHITECTURE

Separate responsibilities into reusable files.

Recommended files:

assets/js/app.js
assets/js/data.js
assets/js/storage.js
assets/js/navigation.js
assets/js/marketplace.js
assets/js/product.js
assets/js/cart.js
assets/js/checkout.js
assets/js/auth.js
assets/js/customer.js
assets/js/seller.js
assets/js/admin.js
assets/js/utils.js

Avoid placing all application logic in one large JavaScript file.

Use consistent naming conventions and reusable functions.

Use safe DOM manipulation and validate user input.

Handle missing elements gracefully because scripts may be shared between pages.

Load scripts in the correct order and avoid duplicate initialisation.

Use localStorage through a centralised storage layer.

8. DEMONSTRATION DATA

Create a shared dataset for:

- Products
- Categories
- Sellers
- Customers
- Cart
- Orders
- Seller applications
- Enquiries

Products must contain:

- Unique ID
- Name
- Description
- Category
- Price
- Image
- Seller ID
- District
- Stock quantity
- Availability
- Date added

Sellers must contain:

- Unique ID
- Shop name
- Owner
- District
- Contact details
- Approval status

Orders must preserve:

- Customer
- Product items
- Seller IDs
- Quantities
- Prices
- Subtotals
- Delivery selection
- Order status
- Date

Use consistent sample data across all pages.

Preserve existing demonstration products where possible, including Fresh Maize, Casual Fashion Shirt and Android Smartphone.

Initialise sample data only when storage is empty or missing. Do not overwrite user changes on every page load.

Provide a development-only way to reset demonstration data.

9. CART RULES

The cart must:

- Add products.
- Increase quantity when an existing product is added again.
- Decrease quantity.
- Remove products.
- Recalculate totals.
- Persist across page refreshes.
- Prevent quantities exceeding available stock.
- Preserve seller information.
- Support multiple sellers.

Use one central source of truth for cart data.

The existing cart badge update issue is deferred. Do not waste the initial development effort repeatedly attempting to fix it. Keep the badge implementation isolated so it can be debugged later without rewriting the cart system.

Do not claim cart badge functionality is complete unless it has been tested.

10. CHECKOUT AND MULTI-SELLER ORDERS

The customer must be able to review the cart before submitting an order.

Collect:

- Customer name
- Phone number
- Delivery address
- District
- Delivery preference

Support seller-managed and Ndago-managed delivery.

For multi-seller orders, group products by seller and preserve the separate fulfilment information.

Validate all required fields.

Display an order confirmation after a successful demonstration order submission.

Do not integrate real payments or invent payment gateway credentials.

The prototype should clearly identify simulated order submission.

11. SECURITY AND FUTURE LARAVEL COMPATIBILITY

This is a frontend prototype.

Do not represent localStorage authentication or role checks as secure.

Prepare the frontend so it can later integrate with Laravel using:

- Clear data models
- Stable entity IDs
- Consistent field names
- Reusable UI components
- Separated business logic
- Centralised data access
- Clear page responsibilities

Do not place passwords, private credentials or real payment information in localStorage.

Future Laravel will enforce:

- Authentication
- Authorisation
- Seller approval
- Product ownership
- Stock validation
- Pricing
- Order creation
- Payment verification

12. DEVELOPMENT WORKFLOW

Work in phases.

PHASE 1:
Audit existing files, preserve existing design, establish shared components and organise the frontend architecture.

PHASE 2:
Complete public marketplace pages.

PHASE 3:
Complete shopping cart, checkout and order confirmation.

PHASE 4:
Complete customer account pages.

PHASE 5:
Complete seller application and seller portal.

PHASE 6:
Complete admin portal and seller approval workflows.

PHASE 7:
Perform integration testing and documentation.

Do not generate all pages in one uncontrolled operation.

After completing each phase:

1. Check all affected pages.
2. Check browser console errors.
3. Check internal navigation.
4. Test functional interactions.
5. Check responsive layouts.
6. Fix regressions before continuing.
7. Report changed files and outstanding issues.

13. QUALITY ASSURANCE

Test the following:

- All pages load.
- All navigation links work.
- Root and nested asset paths are correct.
- Search works.
- Filters work together.
- Sorting works.
- Product details load the correct product.
- Cart quantities work.
- Cart persists after refresh.
- Checkout validates input.
- Orders preserve seller information.
- Seller applications can be approved or rejected.
- Pending sellers cannot publish products.
- Approved sellers can manage their products.
- Admin pages display consistent data.
- Forms provide useful feedback.
- Images have fallbacks.
- No unwanted horizontal scrolling.
- Mobile and desktop layouts work.
- No uncaught JavaScript errors.

14. DOCUMENTATION

Maintain README.md containing:

- Project description
- Technology stack
- Folder structure
- How to run the project
- Available pages
- JavaScript architecture
- Demonstration data
- Features implemented
- Known issues
- Testing instructions
- Future Laravel migration notes

15. FINAL INSTRUCTION TO CODEX

Act as a senior frontend developer and software architect.

Your responsibility is to complete Ndago Market as a coherent, functional frontend prototype.

Do not blindly rewrite existing code.

Start by auditing the project and identifying:

- Existing completed functionality
- Incomplete functionality
- Broken functionality
- Missing pages
- Duplicated code
- Inconsistent styling
- Architectural problems

Then propose a safe implementation plan.

Work incrementally, preserving working features and testing each phase.

Do not silently invent business requirements, payment arrangements, delivery prices, seller contact information or credentials.

When a requirement is unclear, document the uncertainty and use a configurable placeholder rather than inventing a business rule.

Prioritise maintainability, responsive design, consistency, functionality and future Laravel integration.

The final result should feel like a professional, fully connected marketplace frontend, not a collection of unrelated static HTML pages.