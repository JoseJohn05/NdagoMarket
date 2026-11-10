(function () {
    "use strict";

    function quantity(productId, delta) {
        const input = document.getElementById("productQuantity");
        if (!input) return;
        const product = NdagoData.getProducts().find(function (item) { return item.id === productId; });
        const maximum = product ? Number(product.stockQuantity) : 1;
        const next = Math.min(maximum, Math.max(1, Number(input.value || 1) + delta));
        input.value = String(next);
    }

    document.addEventListener("DOMContentLoaded", function () {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get("product") || "fresh-organic-tomatoes";
        const product = NdagoData.getProducts().find(function (item) { return item.id === productId; });
        if (!product) return;

        const seller = NdagoData.getSellers().find(function (item) { return item.id === product.sellerId; });
        const root = document.body.dataset.assetRoot || "";
        const available = product.availability && product.stockQuantity > 0;

        const map = {
            productCategory: product.category,
            productName: product.name,
            productPrice: NdagoUtils.formatCurrency(product.price),
            productDescription: product.description,
            productDistrict: product.district,
            productSeller: seller ? seller.shopName : "Marketplace seller",
            productStock: available ? product.stockQuantity + " in stock" : "Out of stock",
            productDate: NdagoUtils.formatDate(product.dateAdded)
        };

        Object.keys(map).forEach(function (id) {
            const element = document.getElementById(id);
            if (element) element.textContent = map[id];
        });

        const status = document.getElementById("productStatus");
        if (status) {
            status.textContent = available ? "In Stock" : "Out of Stock";
            status.className = available ? "badge bg-success mb-2" : "badge bg-secondary mb-2";
        }

        const image = document.getElementById("mainImage");
        if (image) image.src = NdagoMarketplace.imageUrl(product.image);

        const quantityInput = document.getElementById("productQuantity");
        if (quantityInput) quantityInput.max = String(product.stockQuantity);

        const shopLink = document.getElementById("productShopLink");
        if (shopLink) shopLink.href = root + "seller/shop.html?seller=" + encodeURIComponent(product.sellerId);

        const addButton = document.getElementById("addProductToCart");
        if (addButton) {
            addButton.disabled = !available;
            addButton.addEventListener("click", function () {
                const amount = Math.max(1, Math.min(
                    Number(product.stockQuantity),
                    Number(quantityInput ? quantityInput.value || 1 : 1)
                ));
                const cart = NdagoStorage.read("cart", []);
                const existing = cart.find(function (item) { return item.id === product.id; });
                if (existing) {
                    existing.quantity = Math.min(Number(product.stockQuantity), Number(existing.quantity || 0) + amount);
                } else {
                    cart.push({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        district: product.district,
                        sellerId: product.sellerId,
                        quantity: amount
                    });
                }

                NdagoStorage.write("cart", cart);
                if (NdagoApp) NdagoApp.updateCartBadges();
                addButton.textContent = "Added to Cart";
            });
        }

        const buyNow = document.getElementById("buyNowProduct");
        if (buyNow) {
            buyNow.disabled = !available;
            buyNow.addEventListener("click", function () {
                const amount = Math.max(1, Math.min(
                    Number(product.stockQuantity),
                    Number(quantityInput ? quantityInput.value || 1 : 1)
                ));
                const cart = NdagoStorage.read("cart", []);
                const existing = cart.find(function (item) { return item.id === product.id; });
                if (existing) {
                    existing.quantity = Math.min(Number(product.stockQuantity), Number(existing.quantity || 0) + amount);
                } else {
                    cart.push({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        district: product.district,
                        sellerId: product.sellerId,
                        quantity: amount
                    });
                }
                NdagoStorage.write("cart", cart);
                if (NdagoApp) NdagoApp.updateCartBadges();
                window.location.href = "checkout.html";
            });
        }

        document.querySelectorAll("[data-product-quantity]").forEach(function (button) {
            button.addEventListener("click", function () {
                quantity(product.id, Number(button.dataset.productQuantity));
            });
        });

        const phone = document.getElementById("sellerPhoneLink");
        const whatsapp = document.getElementById("sellerWhatsappLink");
        if (phone) {
            phone.removeAttribute("href");
            phone.classList.toggle("disabled", !seller || !seller.phone);
            if (!seller || !seller.phone) phone.textContent = "Telephone unavailable";
            else phone.href = "tel:" + seller.phone.replace(/\D/g, "");
        }
        if (whatsapp) {
            whatsapp.removeAttribute("href");
            whatsapp.classList.toggle("disabled", !seller || !seller.whatsapp);
            if (!seller || !seller.whatsapp) whatsapp.textContent = "WhatsApp unavailable";
            else whatsapp.href = "https://wa.me/" + seller.whatsapp.replace(/\D/g, "");
        }

        document.querySelectorAll(".thumb-img").forEach(function (thumbnail) {
            thumbnail.addEventListener("click", function () {
                const main = document.getElementById("mainImage");
                if (main) main.src = thumbnail.src;
                document.querySelectorAll(".thumb-img").forEach(function (item) {
                    item.classList.remove("active", "border-success");
                });
                thumbnail.classList.add("active", "border-success");
            });
        });

        const description = document.getElementById("productDescriptionLong");
        if (description) description.textContent = product.description;

        const related = document.getElementById("relatedProducts");
        if (related) {
            related.innerHTML = NdagoData.getProducts()
                .filter(function (item) { return item.id !== product.id && item.category === product.category; })
                .slice(0, 4)
                .map(NdagoMarketplace.simpleCard).join("");
        }
    });
})();
