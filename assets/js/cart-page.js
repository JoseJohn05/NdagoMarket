(function () {
    "use strict";
    const esc = NdagoUtils.escapeHtml;
    const money = NdagoUtils.formatCurrency;
    const fallback = "assets/imgs/placeholder.svg";

    function cartLines() {
        const products = NdagoData.getProducts();
        const sellers = NdagoData.getSellers();
        return getCart().map(function (line) {
            const product = products.find(function (item) { return String(item.id) === String(line.id); });
            const seller = product && sellers.find(function (item) { return item.id === product.sellerId; });
            return { line: line, product: product, seller: seller, quantity: Number(line.quantity || line.qty || 1) };
        });
    }
    function render() {
        const target = document.getElementById("cartItems");
        if (!target) return;
        const rows = cartLines();
        const available = rows.filter(function (row) { return row.product && row.product.availability !== false && row.product.status !== "draft" && row.product.moderationStatus !== "rejected" && Number(row.product.stockQuantity) >= row.quantity && row.quantity > 0 && row.seller && row.seller.approvalStatus === "approved" && row.seller.accountStatus !== "disabled"; });
        const total = available.reduce(function (sum, row) { return sum + Number(row.product.price) * row.quantity; }, 0);
        const unavailable = rows.filter(function (row) { return !available.includes(row); });
        target.innerHTML = rows.length ? rows.map(function (row) {
            const product = row.product;
            const ok = available.includes(row);
            const name = product ? product.name : (row.line.name || "Unavailable product");
            const image = (product && (product.image || (product.images || [])[0])) || fallback;
            const price = product ? Number(product.price) : Number(row.line.price || 0);
            const sellerName = row.seller ? row.seller.shopName : "Seller unavailable";
            const district = product ? product.district : "";
            const qty = Math.min(Math.max(1, row.quantity), product ? Math.max(1, Number(product.stockQuantity)) : 1);
            return '<article class="card border-0 shadow-sm mb-3"><div class="card-body"><div class="row align-items-center g-3"><div class="col-4 col-sm-3 col-md-2"><img src="' + esc(image) + '" onerror="this.onerror=null;this.src=\'' + fallback + '\'" class="img-fluid rounded" alt="' + esc(name) + '"></div><div class="col"><div class="d-flex justify-content-between gap-2"><div><h2 class="h6 mb-1">' + esc(name) + '</h2><small class="text-muted">' + esc(sellerName) + (district ? ' · ' + esc(district) : '') + '</small>' + (!ok ? '<div class="small text-danger mt-1">This item is no longer available. Remove it to continue.</div>' : '') + '</div><button class="btn btn-sm btn-link text-danger p-0" type="button" data-remove-cart="' + esc(row.line.id) + '">Remove</button></div><div class="d-flex justify-content-between align-items-center gap-2 mt-3"><div class="input-group input-group-sm" style="max-width:130px"><button class="btn btn-outline-secondary" type="button" data-quantity="-1" data-id="' + esc(row.line.id) + '" aria-label="Decrease quantity">−</button><input class="form-control text-center" inputmode="numeric" aria-label="Quantity for ' + esc(name) + '" value="' + qty + '" data-quantity-input="' + esc(row.line.id) + '" min="1" ' + (product ? 'max="' + Math.max(1, Number(product.stockQuantity)) + '"' : 'disabled') + '><button class="btn btn-outline-secondary" type="button" data-quantity="1" data-id="' + esc(row.line.id) + '" aria-label="Increase quantity" ' + (!ok || qty >= Number(product && product.stockQuantity) ? 'disabled' : '') + '>+</button></div><strong class="text-primary-custom">' + money(price * qty) + '</strong></div></div></div></div></article>';
        }).join("") : '<div class="empty-state card border-0 shadow-sm"><div class="card-body text-center py-5"><div class="display-6">🛒</div><h2 class="h5">Your cart is empty</h2><p class="text-muted">Browse the market and add something you like.</p><a href="category.html" class="btn btn-primary-custom">Explore products</a></div></div>';
        document.getElementById("cartSubtotal").textContent = money(total);
        document.getElementById("cartTotal").textContent = money(total);
        const checkout = document.getElementById("checkoutLink");
        checkout.classList.toggle("disabled", !available.length || unavailable.length > 0);
        checkout.setAttribute("aria-disabled", String(!available.length || unavailable.length > 0));
        checkout.title = unavailable.length ? "Remove unavailable items before checkout" : "";
        if (unavailable.length) {
            const message = document.getElementById("cartPageMessage");
            message.innerHTML = '<div class="alert alert-warning">Some items are unavailable or exceed current stock. Update or remove them before checkout.</div>';
        } else document.getElementById("cartPageMessage").innerHTML = "";
    }
    document.addEventListener("click", function (event) {
        const remove = event.target.closest("[data-remove-cart]");
        if (remove) { removeFromCart(remove.dataset.removeCart); render(); return; }
        const adjust = event.target.closest("[data-quantity]");
        if (!adjust) return;
        const row = cartLines().find(function (entry) { return String(entry.line.id) === String(adjust.dataset.id); });
        if (!row || !row.product) return;
        const next = Math.max(1, Math.min(Number(row.product.stockQuantity), row.quantity + Number(adjust.dataset.quantity)));
        updateCartQuantity(row.line.id, next); render();
    });
    document.addEventListener("change", function (event) {
        const input = event.target.closest("[data-quantity-input]");
        if (!input) return;
        const row = cartLines().find(function (entry) { return String(entry.line.id) === String(input.dataset.quantityInput); });
        if (!row || !row.product) return;
        const next = Math.max(1, Math.min(Number(row.product.stockQuantity), Math.floor(Number(input.value) || 1)));
        updateCartQuantity(row.line.id, next); render();
    });
    document.addEventListener("click", function (event) { if (event.target.closest("#clearCart")) { clearCart(); render(); } });
    document.addEventListener("click", function (event) {
        if (event.target.closest("#checkoutLink") && event.target.closest("#checkoutLink").getAttribute("aria-disabled") === "true") event.preventDefault();
    });
    document.addEventListener("DOMContentLoaded", render);
})();
