(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        const params = new URLSearchParams(window.location.search);
        const sellerId = params.get("seller") || "seller-greenfarm";
        const seller = NdagoData.getSellers().find(function (item) { return item.id === sellerId; });
        if (!seller) return;

        const name = document.getElementById("shopName");
        const description = document.getElementById("shopDescription");
        const products = document.getElementById("shopProducts");
        const district = document.getElementById("shopDistrict");

        if (name) name.textContent = seller.shopName;
        if (district) district.textContent = seller.district;
        if (description) {
            description.textContent = seller.description ||
                seller.shopName + " is a seller serving customers in " + seller.district + ", Malawi.";
        }

        if (products) {
            products.innerHTML = NdagoData.getProducts()
                .filter(function (product) { return product.sellerId === seller.id; })
                .map(NdagoMarketplace.simpleCard)
                .join("");
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
