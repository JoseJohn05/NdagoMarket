(function () {
    "use strict";
    const districts = ["Balaka", "Blantyre", "Chikwawa", "Chiradzulu", "Chitipa", "Dedza", "Dowa", "Karonga", "Kasungu", "Likoma", "Lilongwe", "Machinga", "Mangochi", "Mchinji", "Mulanje", "Mwanza", "Mzimba", "Nkhata Bay", "Nkhotakota", "Nsanje", "Ntcheu", "Ntchisi", "Phalombe", "Rumphi", "Salima", "Thyolo", "Zomba"];
    const esc = NdagoUtils.escapeHtml;
    function options(selected) { return districts.map(function (district) { return '<option' + (district === selected ? " selected" : "") + '>' + esc(district) + '</option>'; }).join(""); }
    function requireCustomer() {
        const customer = NdagoAuth.current();
        if (!customer) { window.location.href = "login.html?next=account.html"; return null; }
        return customer;
    }
    function renderProfile() {
        const customer = requireCustomer();
        if (!customer) return;
        document.querySelectorAll("[data-customer-name]").forEach(function (node) { node.textContent = customer.name; });
        const form = document.querySelector("[data-profile-form]");
        if (form) {
            form.querySelector('[name="name"]').value = customer.name || "";
            form.querySelector('[name="email"]').value = customer.email || "";
            form.querySelector('[name="phone"]').value = customer.phone || "";
            form.querySelector('[name="district"]').innerHTML = '<option value="">Select district</option>' + options(customer.district);
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                if (!form.reportValidity()) return;
                customer.name = form.querySelector('[name="name"]').value.trim();
                customer.email = form.querySelector('[name="email"]').value.trim().toLowerCase();
                customer.phone = form.querySelector('[name="phone"]').value.trim();
                customer.district = form.querySelector('[name="district"]').value;
                NdagoAuth.save(customer);
                showMessage(form, "Your contact details have been saved.", "success");
                document.querySelectorAll("[data-customer-name]").forEach(function (node) { node.textContent = customer.name; });
            });
        }
        renderAddresses(customer);
        document.querySelectorAll("[data-logout]").forEach(function (button) { button.addEventListener("click", NdagoAuth.logout); });
    }
    function showMessage(container, message, kind) {
        let node = container.querySelector("[data-form-message]");
        if (!node) { node = document.createElement("div"); node.dataset.formMessage = ""; container.prepend(node); }
        node.className = "alert alert-" + kind;
        node.textContent = message;
    }
    function renderAddresses(customer) {
        const list = document.querySelector("[data-address-list]"), form = document.querySelector("[data-address-form]");
        if (!list || !form) return;
        function draw() {
            list.innerHTML = customer.addresses.length ? customer.addresses.map(function (address, index) {
                return '<div class="border rounded p-3 d-flex justify-content-between align-items-start gap-3 mb-2"><div><strong>' + esc(address.label) + '</strong><div>' + esc(address.address) + '</div><small class="text-muted">' + esc(address.district) + (address.isDefault ? " · Default" : "") + '</small></div><button class="btn btn-sm btn-outline-danger" type="button" data-remove-address="' + index + '" aria-label="Remove ' + esc(address.label) + '">Remove</button></div>';
            }).join("") : '<p class="text-muted mb-0">No saved addresses yet.</p>';
            list.querySelectorAll("[data-remove-address]").forEach(function (button) { button.addEventListener("click", function () { customer.addresses.splice(Number(button.dataset.removeAddress), 1); NdagoAuth.save(customer); draw(); }); });
        }
        form.querySelector('[name="district"]').innerHTML = '<option value="">Select district</option>' + options(customer.district);
        draw();
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            if (!form.reportValidity()) return;
            const first = customer.addresses.length === 0;
            customer.addresses.push({ id: "address-" + Date.now().toString(36), label: form.querySelector('[name="label"]').value.trim(), address: form.querySelector('[name="address"]').value.trim(), district: form.querySelector('[name="district"]').value, isDefault: first });
            NdagoAuth.save(customer); form.reset(); draw(); showMessage(form, "Address saved to your demonstration account.", "success");
        });
    }
    function renderOrders() {
        if (!document.querySelector("[data-orders-list]")) return;
        const customer = requireCustomer();
        if (!customer) return;
        const orders = NdagoStorage.read("orders", []).filter(function (order) { return order.customerId === customer.id || (order.customer && (order.customer.id === customer.id || order.customer.email === customer.email)); });
        const list = document.querySelector("[data-orders-list]");
        if (!orders.length) { list.innerHTML = '<div class="empty-state"><div>🧾</div><h2 class="h5">No orders yet</h2><p>Your completed checkouts will appear here.</p><a href="index.html" class="btn btn-primary-custom">Explore the market</a></div>'; return; }
        list.innerHTML = orders.slice().reverse().map(function (order) {
            const number = order.orderNumber || order.id || "Order";
            const total = order.total != null ? order.total : (order.items || []).reduce(function (sum, item) { return sum + Number(item.subtotal || Number(item.price || 0) * Number(item.quantity || 0)); }, 0);
            return '<article class="card border-0 shadow-sm mb-3"><div class="card-body"><div class="d-flex flex-wrap justify-content-between gap-2"><div><span class="text-muted small">Order</span><h2 class="h6 mb-1">' + esc(number) + '</h2></div><span class="badge text-bg-light align-self-start">' + esc(order.status || "Submitted") + '</span></div><div class="d-flex justify-content-between mt-3"><span class="text-muted">' + esc(NdagoUtils.formatDate(order.date || order.createdAt)) + ' · ' + (order.items || []).length + ' item(s)</span><strong>' + NdagoUtils.formatCurrency(total) + '</strong></div><a class="btn btn-sm btn-outline-success mt-3" href="order-details.html?id=' + encodeURIComponent(order.id || order.orderNumber || "") + '">View order</a></div></article>';
        }).join("");
    }
    function renderOrderDetails() {
        const target = document.querySelector("[data-order-detail]");
        if (!target) return;
        const customer = requireCustomer(); if (!customer) return;
        const id = new URLSearchParams(window.location.search).get("id");
        const order = NdagoStorage.read("orders", []).find(function (item) { return String(item.id || item.orderNumber) === id && (item.customerId === customer.id || (item.customer && item.customer.email === customer.email)); });
        if (!order) { target.innerHTML = '<div class="alert alert-info">This order could not be found in your demonstration account.</div><a href="my-orders.html">Back to orders</a>'; return; }
        const items = order.items || [];
        target.innerHTML = '<div class="card border-0 shadow-sm"><div class="card-body"><div class="d-flex justify-content-between flex-wrap gap-2"><div><p class="text-muted mb-1">Order</p><h2 class="h5">' + esc(order.orderNumber || order.id) + '</h2></div><span class="badge text-bg-light align-self-start">' + esc(order.status || "Submitted") + '</span></div><p class="text-muted">Placed ' + esc(NdagoUtils.formatDate(order.date || order.createdAt)) + '</p><div class="table-responsive"><table class="table align-middle"><thead><tr><th>Item</th><th>Seller</th><th>Qty</th><th class="text-end">Subtotal</th></tr></thead><tbody>' + items.map(function (item) { return '<tr><td>' + esc(item.name || item.productName || "Product") + '</td><td>' + esc(item.sellerName || item.sellerId || "—") + '</td><td>' + Number(item.quantity || 0) + '</td><td class="text-end">' + NdagoUtils.formatCurrency(item.subtotal != null ? item.subtotal : Number(item.price || 0) * Number(item.quantity || 0)) + '</td></tr>'; }).join("") + '</tbody></table></div><div class="row g-3 mt-2"><div class="col-md-6"><strong>Delivery arrangement</strong><div>' + esc(order.deliveryPreference || order.deliveryMethod || "Not recorded") + '</div></div><div class="col-md-6"><strong>Delivery address</strong><div>' + esc(order.deliveryAddress || order.address || "Not recorded") + '</div></div></div><hr><div class="d-flex justify-content-between"><strong>Order total</strong><strong>' + NdagoUtils.formatCurrency(order.total != null ? order.total : items.reduce(function (sum, item) { return sum + Number(item.subtotal || Number(item.price || 0) * Number(item.quantity || 0)); }, 0)) + '</strong></div></div></div>';
    }
    document.addEventListener("DOMContentLoaded", function () { renderProfile(); renderOrders(); renderOrderDetails(); });
})();
