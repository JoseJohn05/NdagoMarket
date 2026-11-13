document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const grid = document.getElementById("productsGrid");
    const count = document.getElementById("productCount");
    const search = document.getElementById("productSearch");
    const category = document.getElementById("categoryFilter");
    const district = document.getElementById("districtFilter");
    const maximum = document.getElementById("maxPrice");
    const available = document.getElementById("availableOnly");
    const sort = document.getElementById("sortProducts");
    const empty = document.getElementById("emptyState");

    if (!grid || !category || !district || !maximum || !available || !sort) return;

    const params = new URLSearchParams(window.location.search);
    const categoryRecords = NdagoData.getCategories();
    category.innerHTML = '<option value="all">All Categories</option>' + categoryRecords.map(function (item) {
        return '<option value="' + NdagoUtils.escapeHtml(item.name) + '">' + NdagoUtils.escapeHtml(item.name) + '</option>';
    }).join("");
    const pills = document.querySelector(".category-pills");
    if (pills) pills.innerHTML = '<button type="button" class="category-pill active" data-category="all">All Products</button>' + categoryRecords.map(function (item) {
        return '<button type="button" class="category-pill" data-category="' + NdagoUtils.escapeHtml(item.name) + '">' + NdagoUtils.escapeHtml(item.name) + '</button>';
    }).join("");
    const requestedCategory = params.get("category");
    if (requestedCategory) {
        const match = Array.from(category.options).find(function (option) {
            return option.text.toLowerCase() === requestedCategory.toLowerCase();
        });
        if (match) category.value = match.value;
    }
    if (search && params.get("q")) search.value = params.get("q");

    function render() {
        let products = NdagoData.getProducts().filter(function (product) {
            if (!NdagoMarketplace.isPublicProduct(product)) return false;
            const query = search ? search.value.trim().toLowerCase() : "";
            const categoryMatch = category.value === "all" || product.category === category.value;
            const districtMatch = district.value === "all" || product.district === district.value;
            const priceLimit = maximum.value === "" ? null : Number(maximum.value);
            const searchMatch = !query ||
                String(product.name || "").toLowerCase().includes(query) ||
                String(product.description || "").toLowerCase().includes(query) ||
                String(product.category || "").toLowerCase().includes(query) ||
                NdagoData.getSellers().some(function (seller) {
                    return seller.id === product.sellerId &&
                        String(seller.shopName || "").toLowerCase().includes(query);
                });
            return searchMatch && categoryMatch && districtMatch &&
                (priceLimit === null || product.price <= priceLimit) &&
                (!available.checked || (product.availability && product.stockQuantity > 0));
        });

        if (sort.value === "low") products.sort(function (a, b) { return a.price - b.price; });
        if (sort.value === "high") products.sort(function (a, b) { return b.price - a.price; });
        if (sort.value === "newest") products.sort(function (a, b) { return new Date(b.dateAdded) - new Date(a.dateAdded); });

        grid.innerHTML = products.map(NdagoMarketplace.card).join("");
        if (count) count.textContent = String(products.length);
        if (empty) empty.classList.toggle("d-none", products.length !== 0);
    }

    const controls = [category, district, maximum, available, sort];
    controls.forEach(function (control) {
        control.addEventListener("change", render);
    });

    const form = document.getElementById("searchForm");
    if (form) form.addEventListener("submit", function (event) { event.preventDefault(); render(); });
    if (search) search.addEventListener("input", render);

    document.querySelectorAll(".category-pill").forEach(function (pill) {
        pill.addEventListener("click", function () {
            category.value = pill.dataset.category;
            render();
        });
    });

    ["applyFilters", "resetFilters", "clearCategory", "emptyReset"].forEach(function (id) {
        const button = document.getElementById(id);
        if (!button) return;
        button.addEventListener("click", function () {
            if (id === "resetFilters" || id === "clearCategory" || id === "emptyReset") {
                if (search) search.value = "";
                category.value = "all";
                district.value = "all";
                maximum.value = "";
                available.checked = false;
                sort.value = "default";
            }
            render();
        });
    });

    render();
});
