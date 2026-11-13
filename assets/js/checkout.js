(function (global) {
    "use strict";
    const districts = ["Balaka", "Blantyre", "Chikwawa", "Chiradzulu", "Chitipa", "Dedza", "Dowa", "Karonga", "Kasungu", "Likoma", "Lilongwe", "Machinga", "Mangochi", "Mchinji", "Mulanje", "Mwanza", "Mzimba", "Nkhata Bay", "Nkhotakota", "Nsanje", "Ntcheu", "Ntchisi", "Phalombe", "Rumphi", "Salima", "Thyolo", "Zomba"];
    const esc = NdagoUtils.escapeHtml;
    const money = NdagoUtils.formatCurrency;
    const placeholder = "assets/imgs/placeholder.svg";
    function lines() {
        const products = NdagoData.getProducts(), sellers = NdagoData.getSellers();
        return NdagoStorage.read("cart", []).map(function (line) {
            const product = products.find(function (item) { return String(item.id) === String(line.id); });
            const seller = product && sellers.find(function (item) { return item.id === product.sellerId; });
            return { line: line, product: product, seller: seller, quantity: Number(line.quantity || line.qty || 1) };
        });
    }
    function validRows() {
        return lines().filter(function (row) { return row.product && row.seller && row.seller.approvalStatus === "approved" && row.seller.accountStatus !== "disabled" && row.product.availability !== false && row.product.status !== "draft" && row.product.moderationStatus !== "rejected" && Number(row.product.stockQuantity) >= row.quantity && row.quantity > 0; });
    }
    function showMessage(message, type) {
        const node = document.getElementById("checkoutMessage");
        node.innerHTML = '<div class="alert alert-' + type + '" role="alert">' + esc(message) + '</div>';
        node.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    function render() {
        const form = document.getElementById("checkoutForm");
        if (!form) return;
        const all = lines(), rows = validRows();
        const allValid = all.length > 0 && rows.length === all.length;
        if (!all.length) { window.location.replace("cart.html"); return; }
        if (!allValid) showMessage("Your cart includes an unavailable item or a quantity above current stock. Return to the cart and update it before placing the order.", "warning");
        const select = document.getElementById("deliveryDistrict");
        select.innerHTML = '<option value="">Select district</option>' + districts.map(function (name) { return '<option value="' + esc(name) + '">' + esc(name) + '</option>'; }).join("");
        const customer = global.NdagoAuth && NdagoAuth.current();
        if (customer) {
            form.elements.name.value = customer.name || "";
            form.elements.phone.value = customer.phone || "";
            form.elements.email.value = customer.email || "";
            const addresses = customer.addresses || [];
            const address = addresses.find(function (item) { return item.isDefault; }) || addresses[0];
            const saved = address || null;
            const district = saved ? saved.district : customer.district;
            if (district && districts.includes(district)) select.value = district;
            if (saved) form.elements.address.value = saved.address || "";
        }
        const groups = new Map();
        rows.forEach(function (row) { const key = row.seller.id; if (!groups.has(key)) groups.set(key, { seller: row.seller, rows: [] }); groups.get(key).rows.push(row); });
        document.getElementById("sellerDeliveryOptions").innerHTML = Array.from(groups.values()).map(function (group) {
            const seller = group.seller;
            return '<fieldset class="border rounded p-3 mb-3"><legend class="float-none w-auto px-2 fs-6 fw-semibold">' + esc(seller.shopName || "Seller") + '</legend><div class="form-check mb-2"><input class="form-check-input" type="radio" name="delivery-' + esc(seller.id) + '" id="sellerDelivery-' + esc(seller.id) + '" value="seller_managed" required><label class="form-check-label" for="sellerDelivery-' + esc(seller.id) + '">Seller-managed delivery</label></div><div class="form-check"><input class="form-check-input" type="radio" name="delivery-' + esc(seller.id) + '" id="ndagoDelivery-' + esc(seller.id) + '" value="ndago_managed" required><label class="form-check-label" for="ndagoDelivery-' + esc(seller.id) + '">Ndago-managed delivery</label></div></fieldset>';
        }).join("");
        const total = rows.reduce(function (sum, row) { return sum + Number(row.product.price) * row.quantity; }, 0);
        document.getElementById("checkoutItems").innerHTML = rows.map(function (row) {
            const p = row.product;
            return '<div class="d-flex gap-3 mb-3"><img src="' + esc(p.image || (p.images || [])[0] || placeholder) + '" onerror="this.onerror=null;this.src=\'' + placeholder + '\'" class="rounded" width="56" height="56" style="object-fit:cover" alt=""><div class="flex-grow-1"><div class="small fw-medium">' + esc(p.name) + '</div><div class="small text-muted">' + esc(row.seller.shopName) + ' · Qty: ' + row.quantity + '</div><div class="small text-primary-custom fw-bold">' + money(Number(p.price) * row.quantity) + '</div></div></div>';
        }).join("");
        document.getElementById("checkoutSubtotal").textContent = money(total);
        document.getElementById("checkoutTotal").textContent = money(total);
        document.getElementById("placeOrderButton").disabled = !allValid;
    }
    function submit(event) {
        event.preventDefault();
        const form = event.currentTarget;
        if (!form.reportValidity()) return;
        const rows = validRows(), cart = lines();
        if (!cart.length || rows.length !== cart.length) { showMessage("Please resolve unavailable products or stock limits in your cart.", "warning"); return; }
        const values = new FormData(form);
        const fulfilment = {};
        const grouped = new Map();
        rows.forEach(function (row) { const id = row.seller.id; if (!grouped.has(id)) grouped.set(id, row.seller); });
        for (const sellerId of grouped.keys()) {
            const method = values.get("delivery-" + sellerId);
            if (!method) { showMessage("Choose a delivery arrangement for every seller.", "warning"); return; }
            fulfilment[sellerId] = method === "ndago_managed" ? "Ndago-managed delivery" : "Seller-managed delivery";
        }
        const customer = global.NdagoAuth && NdagoAuth.current();
        const now = new Date().toISOString();
        const id = "order-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        const items = rows.map(function (row) { return {
            id: String(row.product.id), name: row.product.name, price: Number(row.product.price), quantity: row.quantity,
            subtotal: Number(row.product.price) * row.quantity, sellerId: row.seller.id, sellerName: row.seller.shopName || "Seller", district: row.product.district || ""
        }; });
        const customerRecord = { name: String(values.get("name") || "").trim(), phone: String(values.get("phone") || "").trim(), email: String(values.get("email") || "").trim(), district: String(values.get("district") || ""), address: String(values.get("address") || "").trim() };
        const order = {
            id: id, orderNumber: id.toUpperCase(), customerId: customer ? customer.id : null,
            customer: customer ? { id: customer.id, name: customerRecord.name, phone: customerRecord.phone, email: customerRecord.email } : customerRecord,
            customerName: customerRecord.name, phone: customerRecord.phone, email: customerRecord.email,
            items: items, total: items.reduce(function (sum, item) { return sum + item.subtotal; }, 0),
            deliveryAddress: customerRecord.address, district: customerRecord.district,
            deliveryPreference: "Per-seller arrangement", fulfilmentBySeller: fulfilment,
            sellerFulfilment: Object.keys(fulfilment).reduce(function (result, sellerId) { result[sellerId] = { deliveryMethod: values.get("delivery-" + sellerId), status: "pending" }; return result; }, {}),
            notes: String(values.get("notes") || "").trim(), status: "submitted", date: now, createdAt: now, simulated: true
        };
        const orders = NdagoStorage.read("orders", []);
        if (!NdagoStorage.write("orders", orders.concat(order))) { showMessage("The order could not be saved in browser storage. Please try again.", "danger"); return; }
        const products = NdagoData.getProducts();
        rows.forEach(function (row) {
            const product = products.find(function (item) { return String(item.id) === String(row.product.id); });
            product.stockQuantity = Math.max(0, Number(product.stockQuantity) - row.quantity);
            if (product.stockQuantity === 0) product.availability = false;
        });
        if (!NdagoStorage.write("products", products)) {
            // Preserve the submitted order even if the browser refuses a stock update.
            showMessage("The order was saved, but this browser could not update the demonstration stock. Contact the seller to confirm availability.", "warning");
        }
        NdagoStorage.write("cart", []);
        window.location.href = "order-confirmation.html?id=" + encodeURIComponent(id);
    }
    const form = document.getElementById("checkoutForm");
    if (form) form.addEventListener("submit", submit);
    document.addEventListener("DOMContentLoaded", render);
})(window);
