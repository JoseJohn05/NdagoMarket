(function (global) {
    "use strict";

    const key = "sellerApplications";
    const districts = ["Balaka", "Blantyre", "Chikwawa", "Chiradzulu", "Chitipa", "Dedza", "Dowa", "Karonga", "Kasungu", "Likoma", "Lilongwe", "Machinga", "Mangochi", "Mchinji", "Mulanje", "Mwanza", "Mzimba", "Nkhata Bay", "Nkhotakota", "Nsanje", "Ntcheu", "Ntchisi", "Phalombe", "Rumphi", "Salima", "Thyolo", "Zomba"];
    const esc = NdagoUtils.escapeHtml;
    let activeSeller = null;

    function id(prefix) { return prefix + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
    function apps() { return NdagoStorage.read(key, []); }
    function saveApps(value) { return NdagoStorage.write(key, value); }
    function flash(target, message, kind) {
        if (!target) return;
        let alert = target.querySelector("[data-seller-message]");
        if (!alert) { alert = document.createElement("div"); alert.dataset.sellerMessage = ""; target.prepend(alert); }
        alert.className = "alert alert-" + kind;
        alert.setAttribute("role", "status");
        alert.textContent = message;
    }
    function currentCustomer() {
        const customer = global.NdagoAuth.current();
        if (!customer) {
            const route = location.pathname.split("/").pop() + location.search;
            const next = encodeURIComponent((location.pathname.indexOf("/seller/") >= 0 ? "seller/" : "") + route);
            const loginPath = location.pathname.indexOf("/seller/") >= 0 ? "../login.html" : "login.html";
            location.href = loginPath + "?next=" + next;
            return null;
        }
        return customer;
    }
    function latestApplication(customer) {
        return apps().filter(function (application) { return application.applicantId === customer.id; })
            .sort(function (a, b) { return new Date(b.submittedAt) - new Date(a.submittedAt); })[0] || null;
    }
    function sellerFor(customer) {
        return NdagoData.getSellers().find(function (seller) {
            return seller.ownerId === customer.id && seller.approvalStatus === "approved" && seller.accountStatus !== "disabled";
        }) || null;
    }
    function statusPanel(application) {
        const box = document.querySelector("[data-application-status]");
        const form = document.querySelector("[data-seller-application]");
        if (!box) return;
        const status = ["pending", "approved", "rejected"].includes(application.status) ? application.status : "pending";
        const labels = { pending: "Pending review", approved: "Approved", rejected: "Not approved" };
        const badge = status === "approved" ? "success" : status === "rejected" ? "danger" : "warning";
        box.hidden = false;
        box.innerHTML = '<div class="card border-0 shadow-sm"><div class="card-body p-4"><div class="d-flex justify-content-between align-items-start gap-3"><div><p class="text-primary-custom fw-semibold small mb-1">SELLER APPLICATION</p><h2 class="h4 fw-bold">' + esc(application.shopName) + '</h2></div><span class="badge text-bg-' + badge + '">' + esc(labels[status]) + '</span></div><p class="mb-1"><strong>Submitted:</strong> ' + esc(NdagoUtils.formatDate(application.submittedAt)) + '</p>' + (application.reviewNote ? '<p class="mb-1"><strong>Review note:</strong> ' + esc(application.reviewNote) + '</p>' : '') + (status === "pending" ? '<p class="text-muted mt-3 mb-0">Your application is saved in this browser and is waiting for administrator review.</p>' : status === "approved" ? '<p class="text-muted mt-3 mb-3">Your shop is approved. You can manage your products and shop profile.</p><a class="btn btn-primary-custom" href="seller/seller-dashboard.html">Open seller dashboard</a>' : '<p class="text-muted mt-3 mb-0">You can update your application and submit it again.</p>') + '</div></div>';
        if (form) form.hidden = status !== "rejected";
    }
    function bindApplication() {
        const form = document.querySelector("[data-seller-application]");
        if (!form) return;
        const customer = currentCustomer();
        if (!customer) return;
        const prior = latestApplication(customer);
        if (prior && prior.status !== "rejected") { statusPanel(prior); return; }
        if (prior) statusPanel(prior);
        const ownerName = form.querySelector('[name="ownerName"]');
        const email = form.querySelector('[name="email"]');
        const phone = form.querySelector('[name="phone"]');
        if (ownerName) ownerName.value = customer.name || "";
        if (email) email.value = customer.email || "";
        if (phone) phone.value = customer.phone || "";
        const district = form.querySelector('[name="district"]');
        if (district) district.innerHTML = '<option value="">Select district</option>' + districts.map(function (name) { return '<option value="' + esc(name) + '"' + (name === customer.district ? " selected" : "") + '>' + esc(name) + '</option>'; }).join("");
        const businessCategory = form.querySelector('[name="businessCategory"]');
        if (businessCategory) businessCategory.innerHTML = '<option value="">Select category</option>' + NdagoData.getCategories().map(function (category) { return '<option value="' + esc(category.name) + '">' + esc(category.name) + '</option>'; }).join("");
        if (prior) {
            ["shopName", "description", "phone", "whatsapp", "businessCategory", "district"].forEach(function (name) {
                const field = form.querySelector('[name="' + name + '"]');
                if (field && prior[name]) field.value = prior[name];
            });
        }
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            if (!form.reportValidity()) return;
            const values = new FormData(form);
            const application = {
                id: id("application"), applicantId: customer.id,
                ownerName: String(values.get("ownerName") || "").trim(),
                email: String(values.get("email") || "").trim().toLowerCase(),
                phone: String(values.get("phone") || "").trim(),
                shopName: String(values.get("shopName") || "").trim(),
                description: String(values.get("description") || "").trim(),
                businessCategory: String(values.get("businessCategory") || ""),
                district: String(values.get("district") || ""),
                whatsapp: String(values.get("whatsapp") || "").trim(),
                status: "pending", submittedAt: new Date().toISOString(), reviewNote: ""
            };
            const records = apps();
            records.push(application);
            if (!saveApps(records)) { flash(form, "Could not save this application in browser storage. Free up storage and try again.", "danger"); return; }
            form.reset();
            statusPanel(application);
        });
    }
    function portalSeller() {
        const customer = currentCustomer();
        if (!customer) return null;
        const seller = sellerFor(customer);
        if (seller) return seller;
        const content = document.querySelector("[data-seller-content]");
        if (content) content.hidden = true;
        const application = latestApplication(customer);
        const gate = document.createElement("main");
        gate.className = "container py-5";
        gate.innerHTML = '<div class="card border-0 shadow-sm mx-auto" style="max-width:620px"><div class="card-body p-4 p-md-5"><p class="text-primary-custom fw-semibold small">SELLER PORTAL</p><h1 class="h3 fw-bold">' + (application && application.status === "pending" ? "Application under review" : application && application.status === "rejected" ? "Application needs attention" : "Apply to sell on Ndago Market") + '</h1><p class="text-muted">' + (application && application.status === "pending" ? "Seller tools become available after an administrator approves your application." : application && application.status === "rejected" ? "Review your application and submit it again." : "Complete a seller application. Product publishing is available only after approval.") + '</p><a class="btn btn-primary-custom" href="../seller-application.html">' + (application && application.status === "pending" ? "View application status" : "Seller application") + '</a> <a class="btn btn-outline-secondary" href="../index.html">Marketplace</a><p class="small text-muted mt-3 mb-0">Demonstration status stored in this browser; it is not secure authorization.</p></div></div>';
        document.body.appendChild(gate);
        return null;
    }
    function labelSeller(seller) {
        document.querySelectorAll("[data-seller-shop-name]").forEach(function (node) { node.textContent = seller.shopName; });
        document.querySelectorAll("[data-seller-initial]").forEach(function (node) { node.textContent = (seller.shopName || "S").charAt(0).toUpperCase(); });
    }
    function sellerProducts() {
        return NdagoData.getProducts().filter(function (product) { return product.sellerId === activeSeller.id; });
    }
    function productStatus(product) {
        if (product.status === "draft") return { label: "Draft", badge: "secondary" };
        if (product.moderationStatus === "rejected") return { label: "Removed by admin", badge: "danger" };
        if (!product.availability) return { label: "Unavailable", badge: "warning" };
        if (Number(product.stockQuantity) < 1) return { label: "Out of stock", badge: "danger" };
        return { label: "Active", badge: "success" };
    }
    function productRows(products, dashboard) {
        if (!products.length) return '<tr><td colspan="' + (dashboard ? "5" : "6") + '" class="text-center text-muted py-4">No products yet. Add your first listing to get started.</td></tr>';
        return products.map(function (product) {
            const state = productStatus(product);
            const img = product.image || (document.body.dataset.assetRoot || "../") + "assets/imgs/placeholder.svg";
            const actions = '<div class="btn-group btn-group-sm"><a class="btn btn-outline-secondary" href="add-product.html?id=' + encodeURIComponent(product.id) + '" title="Edit product">Edit</a><button class="btn btn-outline-danger" type="button" data-delete-product="' + esc(product.id) + '">Delete</button></div>';
            const details = '<div class="d-flex align-items-center gap-2"><img src="' + esc(img) + '" class="rounded" width="44" height="44" style="object-fit:cover" alt=""><span class="small fw-medium">' + esc(product.name) + '</span></div>';
            return '<tr><td>' + details + '</td>' + (dashboard ? "" : '<td>' + esc(product.category) + '</td>') + '<td>' + NdagoUtils.formatCurrency(product.price) + '</td><td>' + Number(product.stockQuantity || 0) + '</td><td><span class="badge text-bg-' + state.badge + '">' + state.label + '</span></td><td class="text-end">' + actions + '</td></tr>';
        }).join("");
    }
    function bindDeleteProducts(container) {
        container.querySelectorAll("[data-delete-product]").forEach(function (button) {
            button.addEventListener("click", function () {
                const product = NdagoData.getProducts().find(function (item) { return item.id === button.dataset.deleteProduct && item.sellerId === activeSeller.id; });
                if (!product || !window.confirm('Delete "' + product.name + '"?')) return;
                const remaining = NdagoData.getProducts().filter(function (item) { return item.id !== product.id; });
                NdagoStorage.write("products", remaining);
                renderSellerProducts();
            });
        });
    }
    function renderSellerProducts() {
        const listing = document.querySelector("[data-seller-products]");
        const preview = document.querySelector("[data-dashboard-products]");
        const all = sellerProducts();
        if (listing) {
            const query = (document.querySelector("[data-product-search]") || {}).value || "";
            const category = (document.querySelector("[data-product-category-filter]") || {}).value || "";
            const status = (document.querySelector("[data-product-status-filter]") || {}).value || "";
            const visible = all.filter(function (product) {
                const state = productStatus(product).label;
                return (!query || product.name.toLowerCase().includes(query.toLowerCase())) && (!category || product.category === category) && (!status || state === status);
            });
            listing.innerHTML = productRows(visible, false);
            const count = document.querySelector("[data-products-count]");
            if (count) count.textContent = String(visible.length);
            const summary = document.querySelector("[data-products-summary]");
            if (summary) summary.textContent = "Showing " + visible.length + " of " + all.length + " products";
            bindDeleteProducts(listing);
        }
        if (preview) {
            preview.innerHTML = productRows(all.slice(0, 5), true);
            bindDeleteProducts(preview);
        }
    }
    function fulfilment(order) {
        order.sellerFulfilment = order.sellerFulfilment || {};
        return order.sellerFulfilment[activeSeller.id] || { status: String(order.status || "pending").toLowerCase() };
    }
    function sellerOrders() {
        return NdagoStorage.read("orders", []).map(function (order) {
            const items = (order.items || []).filter(function (item) { return item.sellerId === activeSeller.id; });
            return items.length ? { order: order, items: items, fulfilment: fulfilment(order) } : null;
        }).filter(Boolean);
    }
    function orderRows(orders) {
        if (!orders.length) return '<div class="empty-state"><div>🧾</div><h2 class="h5">No orders yet</h2><p>Orders containing your products will appear here.</p></div>';
        return orders.slice().reverse().map(function (entry) {
            const order = entry.order, state = entry.fulfilment.status || "pending";
            const total = entry.items.reduce(function (sum, item) { return sum + Number(item.subtotal != null ? item.subtotal : Number(item.price || 0) * Number(item.quantity || 0)); }, 0);
            const items = entry.items.map(function (item) { return '<li>' + esc(item.name || item.productName || "Product") + ' × ' + Number(item.quantity || 0) + ' <span class="text-muted">' + NdagoUtils.formatCurrency(item.subtotal != null ? item.subtotal : Number(item.price || 0) * Number(item.quantity || 0)) + '</span></li>'; }).join("");
            const customer = order.customer || {};
            const orderId = String(order.id || order.orderNumber || "");
            const controls = state === "pending" || state === "submitted" ? '<button type="button" class="btn btn-primary-custom btn-sm" data-order-status="processing" data-order-id="' + esc(orderId) + '">Accept</button><button type="button" class="btn btn-outline-danger btn-sm" data-order-status="cancelled" data-order-id="' + esc(orderId) + '">Decline</button>' : state === "processing" ? '<button type="button" class="btn btn-success btn-sm" data-order-status="completed" data-order-id="' + esc(orderId) + '">Mark completed</button>' : "";
            return '<article class="card border-0 shadow-sm mb-3"><div class="card-header bg-white d-flex flex-wrap justify-content-between gap-2"><div><strong>' + esc(order.orderNumber || order.id || "Order") + '</strong> <span class="badge text-bg-light ms-1">' + esc(state) + '</span><div class="small text-muted">' + esc(NdagoUtils.formatDate(order.date || order.createdAt)) + '</div></div><div class="d-flex gap-2">' + controls + '</div></div><div class="card-body"><ul class="mb-3">' + items + '</ul><div class="d-flex justify-content-between fw-bold mb-3"><span>Your items</span><span>' + NdagoUtils.formatCurrency(total) + '</span></div><div class="row g-2 small"><div class="col-sm-4"><span class="text-muted">Customer:</span> ' + esc(customer.name || order.customerName || "Not provided") + ' ' + esc(customer.phone || order.phone || "") + '</div><div class="col-sm-4"><span class="text-muted">Delivery:</span> ' + esc((order.fulfilmentBySeller && order.fulfilmentBySeller[activeSeller.id]) || order.deliveryPreference || order.deliveryMethod || "Not recorded") + '</div><div class="col-sm-4"><span class="text-muted">Address:</span> ' + esc(order.deliveryAddress || order.address || "Not recorded") + '</div></div></div></article>';
        }).join("");
    }
    function bindOrderActions() {
        document.querySelectorAll("[data-order-status]").forEach(function (button) {
            button.addEventListener("click", function () {
                const records = NdagoStorage.read("orders", []);
                const order = records.find(function (item) { return String(item.id || item.orderNumber || "") === button.dataset.orderId; });
                if (!order) return;
                order.sellerFulfilment = order.sellerFulfilment || {};
                order.sellerFulfilment[activeSeller.id] = Object.assign({}, order.sellerFulfilment[activeSeller.id] || {}, { status: button.dataset.orderStatus, updatedAt: new Date().toISOString() });
                NdagoStorage.write("orders", records);
                renderOrdersPage();
            });
        });
    }
    function renderOrdersPage() {
        const list = document.querySelector("[data-seller-orders]");
        if (!list) return;
        const filter = document.querySelector("[data-order-filter]");
        const orders = sellerOrders().filter(function (entry) { return !filter || !filter.value || entry.fulfilment.status === filter.value; });
        list.innerHTML = orderRows(orders);
        bindOrderActions();
    }
    function imageToDataUrl(file) {
        return new Promise(function (resolve, reject) {
            if (file.size > 5 * 1024 * 1024) { reject(new Error("Each image must be 5 MB or smaller.")); return; }
            if (!file.type.startsWith("image/")) { reject(new Error("Choose image files only.")); return; }
            const reader = new FileReader();
            reader.onerror = function () { reject(new Error("Could not read an image file.")); };
            reader.onload = function () {
                const image = new Image();
                image.onerror = function () { reject(new Error("Could not process an image file.")); };
                image.onload = function () {
                    const max = 900, scale = Math.min(1, max / Math.max(image.width, image.height));
                    const canvas = document.createElement("canvas");
                    canvas.width = Math.max(1, Math.round(image.width * scale)); canvas.height = Math.max(1, Math.round(image.height * scale));
                    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL("image/jpeg", 0.72));
                };
                image.src = reader.result;
            };
            reader.readAsDataURL(file);
        });
    }
    function bindProductForm() {
        const form = document.querySelector("[data-product-form]");
        if (!form) return;
        const params = new URLSearchParams(location.search), productId = params.get("id");
        let existing = productId ? NdagoData.getProducts().find(function (product) { return product.id === productId && product.sellerId === activeSeller.id; }) : null;
        if (productId && !existing) { flash(form, "That product was not found in your shop.", "warning"); }
        const product = existing;
        const category = form.querySelector('[name="category"]');
        category.innerHTML = '<option value="">Select category</option>' + NdagoData.getCategories().map(function (item) { return '<option value="' + esc(item.name) + '">' + esc(item.name) + '</option>'; }).join("");
        const districtField = form.querySelector('[name="district"]');
        if (districtField) districtField.innerHTML = '<option value="">Select district</option>' + districts.map(function (name) { return '<option value="' + esc(name) + '">' + esc(name) + '</option>'; }).join("");
        let images = product ? (product.images || (product.image ? [product.image] : [])) : [];
        const preview = form.querySelector("[data-image-preview]");
        const drawImages = function () {
            if (preview) preview.innerHTML = images.map(function (src, index) { return '<div class="position-relative"><img src="' + esc(src) + '" class="rounded border" alt="Selected product image ' + (index + 1) + '" width="80" height="80" style="object-fit:cover"><button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0" data-remove-image="' + index + '" aria-label="Remove image">×</button></div>'; }).join("");
            if (preview) preview.querySelectorAll("[data-remove-image]").forEach(function (button) { button.addEventListener("click", function () { images.splice(Number(button.dataset.removeImage), 1); drawImages(); }); });
        };
        if (product) {
            ["name", "description", "category", "price", "stockQuantity", "district"].forEach(function (name) { if (form.querySelector('[name="' + name + '"]')) form.querySelector('[name="' + name + '"]').value = product[name] == null ? "" : product[name]; });
            form.querySelector('[name="availability"]').checked = product.availability !== false;
            if (districtField) districtField.value = product.district || "";
            document.querySelector("[data-product-form-title]").textContent = "Edit Product";
        }
        drawImages();
        form.querySelector('[name="images"]').addEventListener("change", async function (event) {
            const files = Array.from(event.target.files || []);
            if (files.length + images.length > 5) { flash(form, "A product can have up to five images.", "warning"); event.target.value = ""; return; }
            try {
                const results = await Promise.all(files.map(imageToDataUrl));
                images = images.concat(results); drawImages();
            } catch (error) { flash(form, error.message, "warning"); }
            event.target.value = "";
        });
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            if (!form.reportValidity()) return;
            const submitter = event.submitter;
            const values = new FormData(form);
            const item = {
                id: product ? product.id : id("product"),
                name: String(values.get("name") || "").trim(),
                description: String(values.get("description") || "").trim(),
                category: String(values.get("category") || ""),
                categoryId: String(values.get("category") || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
                price: Number(values.get("price")), image: images[0] || "", images: images,
                sellerId: activeSeller.id, district: String(values.get("district") || ""), address: String(values.get("address") || "").trim(),
                stockQuantity: Number(values.get("stockQuantity")), availability: form.querySelector('[name="availability"]').checked,
                dateAdded: product ? product.dateAdded : new Date().toISOString(),
                updatedAt: new Date().toISOString(), status: submitter && submitter.dataset.saveProduct === "draft" ? "draft" : "published",
                moderationStatus: product ? (product.moderationStatus || "approved") : "approved",
                availabilityBeforeModeration: product ? product.availabilityBeforeModeration : undefined
            };
            const records = NdagoData.getProducts().filter(function (entry) { return entry.id !== item.id; });
            records.push(item);
            if (!NdagoStorage.write("products", records)) { flash(form, "Could not save this product in browser storage. Remove some images or free storage and try again.", "danger"); return; }
            location.href = "products.html";
        });
    }
    function renderDashboard() {
        const products = sellerProducts(), orders = sellerOrders();
        const set = function (selector, value) { const node = document.querySelector(selector); if (node) node.textContent = value; };
        set("[data-seller-total-products]", products.length);
        set("[data-seller-active-products]", products.filter(function (p) { return p.status !== "draft" && p.availability && Number(p.stockQuantity) > 0; }).length);
        set("[data-seller-total-orders]", orders.length);
        const now = new Date();
        const monthSales = orders.filter(function (entry) { const date = new Date(entry.order.date || entry.order.createdAt); return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth(); }).reduce(function (sum, entry) { return sum + entry.items.reduce(function (part, item) { return part + Number(item.subtotal != null ? item.subtotal : Number(item.price || 0) * Number(item.quantity || 0)); }, 0); }, 0);
        set("[data-seller-sales]", NdagoUtils.formatCurrency(monthSales));
        renderSellerProducts();
        const recent = document.querySelector("[data-dashboard-orders]");
        if (recent) recent.innerHTML = orders.length ? orders.slice(-3).reverse().map(function (entry) { const order = entry.order; return '<div class="list-group-item d-flex justify-content-between gap-3"><div><strong>' + esc(order.orderNumber || order.id || "Order") + '</strong><div class="small text-muted">' + esc(entry.items.map(function (item) { return item.name; }).join(", ")) + '</div></div><div class="text-end"><div>' + NdagoUtils.formatCurrency(entry.items.reduce(function (sum, item) { return sum + Number(item.subtotal != null ? item.subtotal : Number(item.price || 0) * Number(item.quantity || 0)); }, 0)) + '</div><span class="badge text-bg-light">' + esc(entry.fulfilment.status || "pending") + '</span></div></div>'; }).join("") : '<div class="list-group-item text-muted">No orders yet.</div>';
    }
    function renderProfile() {
        const form = document.querySelector("[data-shop-profile]");
        if (!form) return;
        ["shopName", "description", "phone", "whatsapp", "email", "district", "address"].forEach(function (name) {
            const field = form.querySelector('[name="' + name + '"]');
            if (field) field.value = activeSeller[name] || "";
        });
        const logoPreview = form.querySelector("[data-profile-logo]");
        const coverPreview = form.querySelector("[data-profile-cover]");
        if (logoPreview && activeSeller.logoImage) logoPreview.src = activeSeller.logoImage;
        if (coverPreview && activeSeller.coverImage) coverPreview.src = activeSeller.coverImage;
        form.addEventListener("submit", async function (event) {
            event.preventDefault(); if (!form.reportValidity()) return;
            const values = new FormData(form);
            ["shopName", "description", "phone", "whatsapp", "email", "district", "address"].forEach(function (name) { activeSeller[name] = String(values.get(name) || "").trim(); });
            try {
                const logoFile = form.querySelector('[name="logoImage"]').files[0];
                const coverFile = form.querySelector('[name="coverImage"]').files[0];
                if (logoFile) activeSeller.logoImage = await imageToDataUrl(logoFile);
                if (coverFile) activeSeller.coverImage = await imageToDataUrl(coverFile);
            } catch (error) { flash(form, error.message, "warning"); return; }
            const sellers = NdagoData.getSellers().map(function (seller) { return seller.id === activeSeller.id ? activeSeller : seller; });
            if (NdagoStorage.write("sellers", sellers)) { labelSeller(activeSeller); if (logoPreview && activeSeller.logoImage) logoPreview.src = activeSeller.logoImage; if (coverPreview && activeSeller.coverImage) coverPreview.src = activeSeller.coverImage; flash(form, "Shop profile saved.", "success"); }
            else flash(form, "Could not save your shop profile in browser storage.", "danger");
        });
    }
    function initializePortal() {
        if (!document.body.hasAttribute("data-seller-page")) return;
        activeSeller = portalSeller();
        if (!activeSeller) return;
        labelSeller(activeSeller);
        const search = document.querySelector("[data-product-search]");
        const filters = document.querySelectorAll("[data-product-category-filter], [data-product-status-filter]");
        if (search) search.addEventListener("input", renderSellerProducts);
        filters.forEach(function (filter) { filter.addEventListener("change", renderSellerProducts); });
        const filterButton = document.querySelector("[data-product-filter-button]");
        if (filterButton) filterButton.addEventListener("click", renderSellerProducts);
        const categoryFilter = document.querySelector("[data-product-category-filter]");
        if (categoryFilter) categoryFilter.innerHTML = '<option value="">All Categories</option>' + NdagoData.getCategories().map(function (item) { return '<option value="' + esc(item.name) + '">' + esc(item.name) + '</option>'; }).join("");
        const orderFilter = document.querySelector("[data-order-filter]");
        if (orderFilter) orderFilter.addEventListener("change", renderOrdersPage);
        renderDashboard(); renderSellerProducts(); renderOrdersPage(); renderProfile(); bindProductForm();
    }
    global.NdagoSeller = { initialize: initializePortal };
    document.addEventListener("DOMContentLoaded", function () { bindApplication(); initializePortal(); });
})(window);
