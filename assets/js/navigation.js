(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        const root = document.body.dataset.assetRoot || "";
        const searchForms = document.querySelectorAll("[data-marketplace-search]");

        searchForms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                const input = form.querySelector("input[type='search'], input[name='q']");
                const query = input ? input.value.trim() : "";
                const target = root + "category.html" + (query ? "?q=" + encodeURIComponent(query) : "");
                window.location.href = target;
            });
        });
    });
})(window);
