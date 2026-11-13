(function () {
    "use strict";
    const esc = NdagoUtils.escapeHtml;
    const money = NdagoUtils.formatCurrency;
    const query = new URLSearchParams(window.location.search);
    const id = query.get("id");
    const order = NdagoStorage.read("orders", []).find(function (entry) { return String(entry.id || entry.orderNumber) === String(id); });
    const details = document.getElementById("confirmationDetails");
    if (!order) {
        details.innerHTML = '<div class="alert alert-warning">We could not find this order in the current browser storage. It may have been cleared.</div>';
        document.getElementById("orderHistoryLink").classList.add("d-none");
        return;
    }
    const grouped = new Map();
    (order.items || []).forEach(function (item) {
        const key = item.sellerId || "seller";
        if (!grouped.has(key)) grouped.set(key, { name: item.sellerName || key, items: [], fulfilment: (order.sellerFulfilment || {})[key] || {} });
        grouped.get(key).items.push(item);
    });
    const groups = Array.from(grouped.values());
    details.innerHTML = '<div class="border rounded p-3 mb-3"><div class="small text-muted">Order reference</div><strong>' + esc(order.orderNumber || order.id) + '</strong><div class="small text-muted mt-2">' + esc(NdagoUtils.formatDate(order.date || order.createdAt)) + '</div></div><h2 class="h6 fw-bold">Items and seller delivery arrangements</h2>' + groups.map(function (group) {
        return '<section class="border rounded p-3 mb-2"><div class="d-flex justify-content-between gap-2"><strong>' + esc(group.name) + '</strong><span class="small">' + esc(group.fulfilment.deliveryMethod === "ndago_managed" ? "Ndago-managed delivery" : group.fulfilment.deliveryMethod === "seller_managed" ? "Seller-managed delivery" : "Arrangement pending") + '</span></div><ul class="mb-0 mt-2">' + group.items.map(function (item) { return '<li>' + esc(item.name) + ' × ' + Number(item.quantity || 0) + ' — ' + money(item.subtotal || Number(item.price || 0) * Number(item.quantity || 0)) + '</li>'; }).join("") + '</ul></section>';
    }).join("") + '<div class="d-flex justify-content-between border-top pt-3 mt-3"><strong>Order total</strong><strong>' + money(order.total || 0) + '</strong></div><div class="small text-muted mt-3">Delivery costs are not included. Confirm any delivery details and costs with the selected provider.</div>';
    const customer = window.NdagoAuth && NdagoAuth.current();
    if (!customer || order.customerId !== customer.id) document.getElementById("orderHistoryLink").classList.add("d-none");
})();
