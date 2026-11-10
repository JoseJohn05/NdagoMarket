(function (global) {
    "use strict";

    function assetRoot() {
        return document.body.dataset.assetRoot || "";
    }

    function imageUrl(image) {
        if (!image) return assetRoot() + "assets/imgs/placeholder.svg";
        return image.indexOf("assets/") === 0 ? assetRoot() + image : image;
    }

    function sellerFor(product) {
        return NdagoData.getSellers().find(function (seller) {
            return seller.id === product.sellerId;
        });
    }

    function card(product) {
        const seller = sellerFor(product);
        const productUrl = assetRoot() + "product.html?product=" + encodeURIComponent(product.id);
        const availability = product.availability && product.stockQuantity > 0
            ? '<span class="availability available">Available</span>'
            : '<span class="availability unavailable">Out of stock</span>';
        const addDisabled = !product.availability || product.stockQuantity < 1 ? " disabled" : "";

        return '<div class="col-6 col-md-6 col-xl-4 product-result" data-id="' + NdagoUtils.escapeHtml(product.id) + '"' +
            ' data-name="' + NdagoUtils.escapeHtml(String(product.name || "").toLowerCase()) + '"' +
            ' data-category="' + NdagoUtils.escapeHtml(product.category) + '"' +
            ' data-district="' + NdagoUtils.escapeHtml(product.district) + '"' +
            ' data-price="' + Number(product.price) + '"' +
            ' data-seller-id="' + NdagoUtils.escapeHtml(product.sellerId || "") + '"' +
            ' data-stock="' + Number(product.stockQuantity || 0) + '"' +
            ' data-available="' + Boolean(product.availability && product.stockQuantity > 0) + '"' +
            ' data-date="' + NdagoUtils.escapeHtml(product.dateAdded) + '">' +
            '<div class="market-product-card">' +
            '<img class="market-product-image img-fluid w-100" src="' + NdagoUtils.escapeHtml(imageUrl(product.image)) +
            '" alt="' + NdagoUtils.escapeHtml(product.name) + '" style="height:220px;object-fit:cover;">' +
            '<div class="market-product-info"><small>' + NdagoUtils.escapeHtml(product.district) + '</small>' +
            '<h6>' + NdagoUtils.escapeHtml(product.name) + '</h6>' +
            '<p class="market-product-seller">Seller: ' + NdagoUtils.escapeHtml(seller ? seller.shopName : "Marketplace seller") + '</p>' +
            '<div class="market-product-price">' + NdagoUtils.formatCurrency(product.price) + '</div>' +
            availability +
            '<a href="' + productUrl + '" class="btn btn-success w-100 mt-3">View Product</a>' +
            '<button type="button" class="btn btn-outline-success w-100 mt-2 add-to-cart-btn"' +
            addDisabled + '>Add to Cart</button></div></div></div>';
    }

    function simpleCard(product) {
        const seller = sellerFor(product);
        const productUrl = assetRoot() + "product.html?product=" + encodeURIComponent(product.id);
        return '<div class="col-6 col-md-4 col-lg-3">' +
            '<a href="' + productUrl + '" class="card product-card h-100 border-0 shadow-sm text-decoration-none">' +
            '<img src="' + NdagoUtils.escapeHtml(imageUrl(product.image)) + '" class="card-img-top" alt="' +
            NdagoUtils.escapeHtml(product.name) + '">' +
            '<div class="card-body"><small class="text-muted">' + NdagoUtils.escapeHtml(product.category) + '</small>' +
            '<h6 class="card-title text-dark mb-1">' + NdagoUtils.escapeHtml(product.name) + '</h6>' +
            '<p class="text-primary-custom fw-bold mb-1">' + NdagoUtils.formatCurrency(product.price) + '</p>' +
            '<small class="text-muted">' + NdagoUtils.escapeHtml(product.district) + ' • ' +
            NdagoUtils.escapeHtml(seller ? seller.shopName : "Marketplace seller") + '</small>' +
            '</div></a></div>';
    }

    function renderFeatured(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = NdagoData.getProducts()
            .filter(function (product) { return product.availability; })
            .slice(0, 8)
            .map(simpleCard).join("");
    }

    function renderCategory(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = NdagoData.getProducts().map(card).join("");
    }

    function renderRecent(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const products = NdagoData.getProducts().slice().sort(function (a, b) {
            return new Date(b.dateAdded) - new Date(a.dateAdded);
        });
        container.innerHTML = products.slice(0, 4).map(simpleCard).join("");
    }

    function renderSellers(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = NdagoData.getSellers()
            .filter(function (seller) { return seller.approvalStatus === "approved"; })
            .slice(0, 4)
            .map(function (seller) {
                return '<div class="col-6 col-md-3"><a href="' + assetRoot() +
                    'seller/shop.html?seller=' + encodeURIComponent(seller.id) +
                    '" class="card border-0 shadow-sm h-100 text-decoration-none text-dark"><div class="card-body text-center">' +
                    '<div class="rounded-circle bg-success bg-opacity-10 text-success d-inline-flex align-items-center justify-content-center fw-bold mb-3" style="width:64px;height:64px;">' +
                    NdagoUtils.escapeHtml(String(seller.shopName || "?").charAt(0)) + '</div><h6 class="fw-bold mb-1">' +
                    NdagoUtils.escapeHtml(seller.shopName) + '</h6><small class="text-muted">' +
                    NdagoUtils.escapeHtml(seller.district) + '</small></div></a></div>';
            }).join("");
    }

    global.NdagoMarketplace = { card, simpleCard, imageUrl, sellerFor, renderFeatured, renderCategory, renderRecent, renderSellers };
})(window);
