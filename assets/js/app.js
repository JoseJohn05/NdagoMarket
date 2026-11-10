(function (global) {
    "use strict";

    function updateCartBadges() {
        const cart = NdagoStorage.read("cart", []);
        const count = cart.reduce(function (total, item) {
            return total + Number(item.quantity || 0);
        }, 0);

        document.querySelectorAll("[data-cart-count]").forEach(function (badge) {
            badge.textContent = String(count);
        });
    }

    function bindDemoReset() {
        document.querySelectorAll("[data-reset-demo]").forEach(function (button) {
            button.addEventListener("click", function () {
                NdagoData.reset();
                window.location.reload();
            });
        });
    }

    function handleImageFallbacks() {
        document.querySelectorAll("img[data-image-fallback], img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.removeAttribute("data-image-fallback");
                image.src = NdagoUtils.assetUrl("");
            }, { once: true });
        });
    }

    function initialize() {
        NdagoData.initialize();
        updateCartBadges();
        bindDemoReset();
        handleImageFallbacks();
    }

    global.NdagoApp = { initialize, updateCartBadges };

    document.addEventListener("DOMContentLoaded", initialize);
})(window);
