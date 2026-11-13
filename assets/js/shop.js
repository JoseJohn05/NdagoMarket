(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        const params = new URLSearchParams(window.location.search);
        const sellerId = params.get("seller") || "seller-greenfarm";
        const seller = NdagoData.getSellers().find(function (item) { return item.id === sellerId; });
        if (!seller || !NdagoMarketplace.isPublicSeller(seller)) {
            const content = document.getElementById("shopProducts");
            const container = content && content.closest(".container");
            const banner = document.querySelector(".shop-banner");
            if (banner) banner.hidden = true;
            if (container) container.innerHTML = '<div class="alert alert-info my-5">This shop is not currently available.</div>';
            return;
        }

        const name = document.getElementById("shopName");
        const description = document.getElementById("shopDescription");
        const products = document.getElementById("shopProducts");
        const district = document.getElementById("shopDistrict");
        const logo = document.querySelector("[data-shop-logo]");
        const initial = document.querySelector("[data-shop-initial]");
        const cover = document.querySelector("[data-shop-cover]");
        const title = document.querySelector("[data-shop-products-title]");
        const count = document.querySelector("[data-shop-product-count]");

        if (name) name.textContent = seller.shopName;
        if (district) district.textContent = seller.district;
        document.title = seller.shopName + " - Ndago Market";
        if (title) title.textContent = "Products from " + seller.shopName;
        if (initial) initial.textContent = String(seller.shopName || "S").charAt(0).toUpperCase();
        if (logo && seller.logoImage) { logo.src = seller.logoImage; logo.style.display = "block"; if (initial) initial.style.display = "none"; }
        if (cover && seller.coverImage) { cover.src = seller.coverImage; cover.style.display = "block"; }
        if (description) {
            description.textContent = seller.description ||
                seller.shopName + " is a seller serving customers in " + seller.district + ", Malawi.";
        }

        if (products) {
            const shopProducts = NdagoData.getProducts()
                .filter(function (product) { return product.sellerId === seller.id && NdagoMarketplace.isPublicProduct(product); })
                .slice();
            const sort = document.querySelector("[data-shop-sort]");
            function drawProducts() {
                if (sort && sort.value === "low") shopProducts.sort(function (a, b) { return a.price - b.price; });
                else if (sort && sort.value === "high") shopProducts.sort(function (a, b) { return b.price - a.price; });
                else shopProducts.sort(function (a, b) { return new Date(b.dateAdded) - new Date(a.dateAdded); });
                products.innerHTML = shopProducts.map(NdagoMarketplace.simpleCard).join("") || '<div class="col-12"><div class="empty-state"><div>🛍️</div><p>This shop has no published products yet.</p></div></div>';
                if (count) count.textContent = String(shopProducts.length);
            }
            drawProducts();
            if (sort) sort.addEventListener("change", drawProducts);
        }

        const phone = document.getElementById("shopPhoneLink");
        const whatsapp = document.getElementById("shopWhatsappLink");
        if (phone) {
            phone.classList.toggle("disabled", !seller.phone);
            phone.removeAttribute("href");
            phone.textContent = seller.phone ? "Call Seller" : "Telephone unavailable";
            if (seller.phone) phone.href = "tel:" + seller.phone.replace(/\D/g, "");
        }
        if (whatsapp) {
            whatsapp.classList.toggle("disabled", !seller.whatsapp);
            whatsapp.removeAttribute("href");
            whatsapp.textContent = seller.whatsapp ? "WhatsApp" : "WhatsApp unavailable";
            if (seller.whatsapp) whatsapp.href = "https://wa.me/" + seller.whatsapp.replace(/\D/g, "");
        }
    });
})();
