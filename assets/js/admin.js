(function () {
    "use strict";

    const esc = NdagoUtils.escapeHtml;
    const read = function (key) { return NdagoStorage.read(key, []); };
    const write = function (key, value) { return NdagoStorage.write(key, value); };
    const date = function (value) { return NdagoUtils.formatDate(value) || "—"; };

    function notify(message, type) {
        const area = document.querySelector("[data-admin-message]");
        if (!area) return;
        area.className = "alert alert-" + type;
        area.textContent = message;
        area.hidden = false;
        window.setTimeout(function () { area.hidden = true; }, 4500);
    }
    function renderNavigation() {
        const target = document.querySelector("[data-admin-navigation]");
        if (!target) return;
        const links = [
            ["dashboard.html", "Overview"], ["seller-applications.html", "Seller applications"],
            ["sellers.html", "Sellers"], ["users.html", "Customers"],
            ["products.html", "Products"], ["orders.html", "Orders"], ["categories.html", "Categories"]
        ];
        const current = document.body.dataset.adminPage;
        target.innerHTML = '<nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm"><div class="container"><a class="navbar-brand fw-bold" href="dashboard.html"><span class="bg-primary-custom text-white rounded px-2 py-1 me-1">N</span>Ndago <span class="text-primary-custom">Admin</span></a><button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#adminNav"><span class="navbar-toggler-icon"></span></button><div class="collapse navbar-collapse" id="adminNav"><ul class="navbar-nav ms-auto align-items-lg-center gap-lg-1">' + links.map(function (link) { return '<li class="nav-item"><a class="nav-link ' + (current === link[0].replace(".html", "") ? "active fw-semibold text-primary-custom" : "") + '" href="' + link[0] + '">' + link[1] + '</a></li>'; }).join("") + '<li class="nav-item ms-lg-2"><a class="btn btn-outline-success btn-sm" href="../index.html">Marketplace</a></li></ul></div></div></nav>';
    }
    function statusBadge(status) {
        const values = { pending: "warning", approved: "success", rejected: "danger", active: "success", disabled: "secondary", processing: "info", completed: "success", cancelled: "secondary", submitted: "primary", draft: "secondary", published: "success" };
        const safe = String(status || "pending").toLowerCase();
        return '<span class="badge text-bg-' + (values[safe] || "light") + '">' + esc(safe) + '</span>';
    }
    function applicationReview(applicationId, nextStatus) {
        const applications = read("sellerApplications");
        const application = applications.find(function (item) { return item.id === applicationId; });
        if (!application) return;
        let note = "";
        if (nextStatus === "rejected") {
            note = window.prompt("Optional note for the applicant:", application.reviewNote || "");
            if (note === null) return;
            note = note.trim();
        } else if (!window.confirm("Approve “" + application.shopName + "” as a seller?")) return;

        const oldSellers = read("sellers");
        const sellers = oldSellers.slice();
        let sellerIndex = sellers.findIndex(function (seller) { return seller.id === application.sellerId || seller.ownerId === application.applicantId; });
        let sellerId = sellerIndex >= 0 ? sellers[sellerIndex].id : application.sellerId;
        if (nextStatus === "approved" || sellerIndex >= 0) {
            sellerId = sellerId || "seller-" + application.id;
            const record = Object.assign({}, sellerIndex >= 0 ? sellers[sellerIndex] : {}, {
                id: sellerId, ownerId: application.applicantId, shopName: application.shopName,
                ownerName: application.ownerName, district: application.district,
                description: application.description, phone: application.phone,
                whatsapp: application.whatsapp, email: application.email,
                businessCategory: application.businessCategory, approvalStatus: nextStatus,
                accountStatus: "active", updatedAt: new Date().toISOString()
            });
            if (sellerIndex < 0) sellers.push(record); else sellers[sellerIndex] = record;
        }
        if (sellerId) application.sellerId = sellerId;
        application.status = nextStatus;
        application.reviewNote = note;
        application.reviewedAt = new Date().toISOString();
        if ((nextStatus === "approved" || sellerIndex >= 0) && !write("sellers", sellers)) { notify("Could not save seller records in browser storage.", "danger"); return; }
        if (!write("sellerApplications", applications)) {
            write("sellers", oldSellers);
            notify("Could not save the application review. The seller record was rolled back.", "danger");
            return;
        }
        renderApplications();
        renderOverview();
        notify(nextStatus === "approved" ? "Application approved and seller portal enabled." : "Application rejected and applicant notified in the status page.", "success");
    }
    function renderApplications() {
        const table = document.querySelector("[data-applications-table]");
        if (!table) return;
        const query = (document.querySelector("[data-application-search]") || {}).value || "";
        const filter = (document.querySelector("[data-application-filter]") || {}).value || "";
        const applications = read("sellerApplications").filter(function (item) {
            const text = [item.shopName, item.ownerName, item.email, item.district, item.businessCategory].join(" ").toLowerCase();
            return (!query || text.includes(query.toLowerCase())) && (!filter || item.status === filter);
        }).slice().reverse();
        table.innerHTML = applications.length ? applications.map(function (item) {
            const actions = item.status === "pending" ? '<button class="btn btn-sm btn-success" type="button" data-review="approved" data-application-id="' + esc(item.id) + '">Approve</button> <button class="btn btn-sm btn-outline-danger" type="button" data-review="rejected" data-application-id="' + esc(item.id) + '">Reject</button>' : '<span class="small text-muted">Reviewed ' + date(item.reviewedAt) + '</span>';
            return '<tr><td><strong>' + esc(item.shopName) + '</strong><div class="small text-muted">' + esc(item.businessCategory) + ' · ' + esc(item.district) + '</div><div class="small mt-1">' + esc(item.description) + '</div></td><td>' + esc(item.ownerName) + '<div class="small text-muted">' + esc(item.email) + '</div><div class="small text-muted">' + esc(item.phone) + (item.whatsapp ? ' · WhatsApp ' + esc(item.whatsapp) : "") + '</div></td><td>' + date(item.submittedAt) + '</td><td>' + statusBadge(item.status) + (item.reviewNote ? '<div class="small text-muted mt-1">' + esc(item.reviewNote) + '</div>' : "") + '</td><td class="text-end text-nowrap">' + actions + '</td></tr>';
        }).join("") : '<tr><td colspan="5" class="text-center text-muted py-4">No matching seller applications.</td></tr>';
        table.querySelectorAll("[data-review]").forEach(function (button) { button.addEventListener("click", function () { applicationReview(button.dataset.applicationId, button.dataset.review); }); });
    }
    function renderSellers() {
        const table = document.querySelector("[data-sellers-table]");
        if (!table) return;
        const sellers = read("sellers").slice().sort(function (a, b) { return String(a.shopName).localeCompare(String(b.shopName)); });
        table.innerHTML = sellers.length ? sellers.map(function (seller) {
            const enabled = seller.accountStatus !== "disabled";
            return '<tr><td><strong>' + esc(seller.shopName) + '</strong><div class="small text-muted">' + esc(seller.businessCategory || "") + '</div></td><td>' + esc(seller.ownerName || "—") + '<div class="small text-muted">' + esc(seller.email || "") + (seller.phone ? ' · ' + esc(seller.phone) : "") + '</div><div class="small text-muted">' + esc(seller.ownerId || "Seed seller") + '</div></td><td>' + esc(seller.district || "—") + '</td><td>' + statusBadge(seller.approvalStatus) + '<div class="mt-1">' + statusBadge(enabled ? "active" : "disabled") + '</div></td><td class="text-end text-nowrap">' + (seller.approvalStatus === "approved" ? '<button class="btn btn-sm ' + (enabled ? "btn-outline-danger" : "btn-outline-success") + '" type="button" data-seller-account="' + (enabled ? "disabled" : "active") + '" data-seller-id="' + esc(seller.id) + '">' + (enabled ? "Suspend" : "Restore") + '</button>' : '<button class="btn btn-sm btn-outline-success" type="button" data-seller-account="active" data-seller-id="' + esc(seller.id) + '">' + (enabled ? "Activate" : "Restore") + '</button>') + '</td></tr>';
        }).join("") : '<tr><td colspan="5" class="text-center text-muted py-4">No sellers found.</td></tr>';
        table.querySelectorAll("[data-seller-account]").forEach(function (button) {
            button.addEventListener("click", function () {
                const sellers = read("sellers");
                const seller = sellers.find(function (item) { return item.id === button.dataset.sellerId; });
                if (!seller) return;
                seller.accountStatus = button.dataset.sellerAccount;
                if (!write("sellers", sellers)) { notify("Could not update seller status.", "danger"); return; }
                renderSellers();
                notify("Seller status updated.", "success");
            });
        });
    }
    function renderUsers() {
        const table = document.querySelector("[data-users-table]");
        if (!table) return;
        const customers = read("customers");
        table.innerHTML = customers.length ? customers.map(function (customer) {
            const disabled = customer.accountStatus === "disabled";
            const orderCount = read("orders").filter(function (order) { return order.customerId === customer.id || (order.customer && order.customer.id === customer.id); }).length;
            return '<tr><td><strong>' + esc(customer.name || "Unnamed") + '</strong><div class="small text-muted">' + esc(customer.id) + '</div></td><td>' + esc(customer.email || "—") + '</td><td>' + esc(customer.phone || "—") + '</td><td>' + esc(customer.district || "—") + '</td><td>' + orderCount + '</td><td>' + statusBadge(disabled ? "disabled" : "active") + '</td><td class="text-end"><button class="btn btn-sm ' + (disabled ? "btn-outline-success" : "btn-outline-danger") + '" type="button" data-user-status="' + (disabled ? "active" : "disabled") + '" data-user-id="' + esc(customer.id) + '">' + (disabled ? "Enable" : "Disable") + '</button></td></tr>';
        }).join("") : '<tr><td colspan="7" class="text-center text-muted py-4">No customer accounts have been created in this browser.</td></tr>';
        table.querySelectorAll("[data-user-status]").forEach(function (button) {
            button.addEventListener("click", function () {
                const customers = read("customers"), customer = customers.find(function (item) { return item.id === button.dataset.userId; });
                if (!customer) return;
                customer.accountStatus = button.dataset.userStatus;
                if (!write("customers", customers)) { notify("Could not update customer status.", "danger"); return; }
                renderUsers(); notify("Customer status updated. This demonstration does not enforce server authorization.", "success");
            });
        });
    }
    function renderProducts() {
        const table = document.querySelector("[data-products-table]");
        if (!table) return;
        const query = (document.querySelector("[data-admin-product-search]") || {}).value || "";
        const products = read("products").filter(function (product) {
            const seller = read("sellers").find(function (item) { return item.id === product.sellerId; });
            return !query || [product.name, product.category, seller && seller.shopName].join(" ").toLowerCase().includes(query.toLowerCase());
        });
        table.innerHTML = products.length ? products.map(function (product) {
            const seller = read("sellers").find(function (item) { return item.id === product.sellerId; });
            const moderation = product.moderationStatus || "approved";
            const action = moderation === "rejected" ? '<button class="btn btn-sm btn-outline-success" type="button" data-moderate="approved" data-product-id="' + esc(product.id) + '">Restore listing</button>' : '<button class="btn btn-sm btn-outline-danger" type="button" data-moderate="rejected" data-product-id="' + esc(product.id) + '">Remove listing</button>';
            return '<tr><td><strong>' + esc(product.name) + '</strong><div class="small text-muted">' + esc(product.id) + '</div></td><td>' + esc(seller ? seller.shopName : "Unknown seller") + '</td><td>' + esc(product.category) + '</td><td>' + NdagoUtils.formatCurrency(product.price) + '</td><td>' + Number(product.stockQuantity || 0) + '</td><td>' + statusBadge(product.status || "published") + '<div class="mt-1">' + statusBadge(moderation) + '</div></td><td class="text-end">' + action + '</td></tr>';
        }).join("") : '<tr><td colspan="7" class="text-center text-muted py-4">No products match your search.</td></tr>';
        table.querySelectorAll("[data-moderate]").forEach(function (button) {
            button.addEventListener("click", function () {
                const products = read("products"), product = products.find(function (item) { return item.id === button.dataset.productId; });
                if (!product) return;
                if (button.dataset.moderate === "rejected") product.availabilityBeforeModeration = product.availability !== false;
                product.moderationStatus = button.dataset.moderate;
                product.moderatedAt = new Date().toISOString();
                product.availability = button.dataset.moderate === "approved"
                    ? (product.availabilityBeforeModeration !== undefined ? product.availabilityBeforeModeration : Number(product.stockQuantity) > 0)
                    : false;
                if (button.dataset.moderate === "approved") delete product.availabilityBeforeModeration;
                if (!write("products", products)) { notify("Could not save product moderation.", "danger"); return; }
                renderProducts(); renderOverview(); notify("Product moderation saved.", "success");
            });
        });
    }
    function renderOrders() {
        const table = document.querySelector("[data-admin-orders]");
        if (!table) return;
        const orders = read("orders").slice().reverse();
        table.innerHTML = orders.length ? orders.map(function (order) {
            const items = order.items || [];
            const amount = order.total != null ? Number(order.total) : items.reduce(function (sum, item) { return sum + Number(item.subtotal != null ? item.subtotal : Number(item.price || 0) * Number(item.quantity || 0)); }, 0);
            const customer = order.customer || {};
            const statuses = ["submitted", "pending", "processing", "completed", "cancelled"];
            const options = statuses.map(function (status) { return '<option value="' + status + '"' + (String(order.status || "submitted").toLowerCase() === status ? " selected" : "") + '>' + status + '</option>'; }).join("");
            const sellerNames = Array.from(new Set(items.map(function (item) { const seller = read("sellers").find(function (record) { return record.id === item.sellerId; }); return seller ? seller.shopName : (item.sellerId || "Unknown seller"); }))).join(", ");
            return '<tr><td><strong>' + esc(order.orderNumber || order.id || "Order") + '</strong><div class="small text-muted">' + date(order.date || order.createdAt) + '</div></td><td>' + esc(customer.name || order.customerName || "—") + '<div class="small text-muted">' + esc(customer.phone || order.phone || "") + '</div></td><td>' + esc(sellerNames || "—") + '<div class="small text-muted">' + items.length + ' line item(s)</div></td><td>' + NdagoUtils.formatCurrency(amount) + '</td><td><select class="form-select form-select-sm" data-order-status data-order-id="' + esc(order.id || order.orderNumber || "") + '">' + options + '</select></td></tr>';
        }).join("") : '<tr><td colspan="5" class="text-center text-muted py-4">No orders have been submitted in this browser.</td></tr>';
        table.querySelectorAll("[data-order-status]").forEach(function (select) {
            select.addEventListener("change", function () {
                const orders = read("orders"), order = orders.find(function (item) { return String(item.id || item.orderNumber || "") === select.dataset.orderId; });
                if (!order) return;
                order.status = select.value; order.updatedAt = new Date().toISOString();
                if (!write("orders", orders)) { notify("Could not update order status.", "danger"); return; }
                renderOverview(); notify("Order status updated. Seller fulfilment statuses remain separate.", "success");
            });
        });
    }
    function renderCategories() {
        const table = document.querySelector("[data-categories-table]");
        if (!table) return;
        const categories = NdagoData.getCategories();
        table.innerHTML = categories.map(function (category) {
            const usage = read("products").filter(function (product) { return product.categoryId === category.id || product.category === category.name; }).length;
            return '<tr><td><strong>' + esc(category.name) + '</strong></td><td>' + esc(category.id) + '</td><td>' + usage + '</td><td class="text-end text-nowrap"><button type="button" class="btn btn-sm btn-outline-secondary me-1" data-rename-category="' + esc(category.id) + '">Rename</button><button type="button" class="btn btn-sm btn-outline-danger" data-delete-category="' + esc(category.id) + '"' + (usage ? ' disabled title="Move products to another category first"' : "") + '>Delete</button></td></tr>';
        }).join("") || '<tr><td colspan="4" class="text-center text-muted py-4">No categories configured.</td></tr>';
        table.querySelectorAll("[data-delete-category]:not(:disabled)").forEach(function (button) {
            button.addEventListener("click", function () {
                if (!window.confirm("Delete this unused category?")) return;
                const remaining = NdagoData.getCategories().filter(function (item) { return item.id !== button.dataset.deleteCategory; });
                if (!write("categories", remaining)) { notify("Could not delete the category.", "danger"); return; }
                renderCategories(); notify("Category deleted.", "success");
            });
        });
        table.querySelectorAll("[data-rename-category]").forEach(function (button) {
            button.addEventListener("click", function () {
                const categories = NdagoData.getCategories();
                const category = categories.find(function (item) { return item.id === button.dataset.renameCategory; });
                if (!category) return;
                const name = window.prompt("Update category name:", category.name);
                if (name === null) return;
                const updatedName = name.trim();
                if (!updatedName || categories.some(function (item) { return item.id !== category.id && item.name.toLowerCase() === updatedName.toLowerCase(); })) { notify("Enter a unique category name.", "warning"); return; }
                const oldName = category.name;
                const oldCategories = categories.map(function (item) { return Object.assign({}, item); });
                category.name = updatedName;
                const oldProducts = read("products");
                const products = oldProducts.map(function (product) {
                    if (product.categoryId === category.id || product.category === oldName) product.category = updatedName;
                    return product;
                });
                if (!write("categories", categories)) { notify("Could not save the category name.", "danger"); return; }
                if (!write("products", products)) { write("categories", oldCategories); notify("Could not update product category labels. The category name was rolled back.", "danger"); return; }
                renderCategories(); notify("Category name updated.", "success");
            });
        });
    }
    function renderOverview() {
        const target = document.querySelector("[data-admin-overview]");
        if (!target) return;
        const customers = read("customers"), sellers = read("sellers"), applications = read("sellerApplications"), products = read("products"), orders = read("orders");
        const pending = applications.filter(function (item) { return item.status === "pending"; }).length;
        const revenue = orders.reduce(function (total, order) { return total + Number(order.total != null ? order.total : (order.items || []).reduce(function (sum, item) { return sum + Number(item.subtotal != null ? item.subtotal : Number(item.price || 0) * Number(item.quantity || 0)); }, 0)); }, 0);
        const approvedSellerIds = sellers.filter(function (seller) { const owner = customers.find(function (customer) { return customer.id === seller.ownerId; }); return seller.approvalStatus === "approved" && seller.accountStatus !== "disabled" && (!owner || owner.accountStatus !== "disabled"); }).map(function (seller) { return seller.id; });
        const cards = [["Customers", customers.length], ["Approved sellers", approvedSellerIds.length], ["Applications awaiting review", pending], ["Public listings", products.filter(function (item) { return item.status !== "draft" && item.moderationStatus !== "rejected" && approvedSellerIds.includes(item.sellerId); }).length], ["Orders", orders.length], ["Recorded order value", NdagoUtils.formatCurrency(revenue)]];
        target.innerHTML = cards.map(function (card) { return '<div class="col-6 col-lg-4"><div class="card border-0 shadow-sm h-100"><div class="card-body"><div class="small text-muted">' + esc(card[0]) + '</div><div class="h3 fw-bold mb-0 mt-2">' + esc(card[1]) + '</div></div></div></div>'; }).join("");
    }
    function bindCategoryForm() {
        const form = document.querySelector("[data-category-form]");
        if (!form) return;
        form.addEventListener("submit", function (event) {
            event.preventDefault(); if (!form.reportValidity()) return;
            const name = form.querySelector('[name="name"]').value.trim();
            const categories = NdagoData.getCategories();
            if (categories.some(function (item) { return item.name.toLowerCase() === name.toLowerCase(); })) { notify("That category already exists.", "warning"); return; }
            const categoryId = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
            if (!categoryId || categories.some(function (item) { return item.id === categoryId; })) { notify("Enter a name that produces a unique category ID.", "warning"); return; }
            categories.push({ id: categoryId, name: name });
            if (!write("categories", categories)) { notify("Could not save category.", "danger"); return; }
            form.reset(); renderCategories(); notify("Category added.", "success");
        });
    }
    function initialize() {
        NdagoData.initialize();
        renderNavigation(); renderOverview(); renderApplications(); renderSellers(); renderUsers(); renderProducts(); renderOrders(); renderCategories(); bindCategoryForm();
        ["[data-application-search]", "[data-application-filter]"].forEach(function (selector) { const field = document.querySelector(selector); if (field) field.addEventListener(selector.includes("search") ? "input" : "change", renderApplications); });
        const productSearch = document.querySelector("[data-admin-product-search]");
        if (productSearch) productSearch.addEventListener("input", renderProducts);
    }
    document.addEventListener("DOMContentLoaded", initialize);
})();
