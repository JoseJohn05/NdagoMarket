(function (global) {
    "use strict";

    function formatCurrency(value) {
        return "MWK " + Number(value || 0).toLocaleString("en-MW");
    }

    function formatDate(value) {
        const date = new Date(value);
        return Number.isNaN(date.getTime())
            ? ""
            : date.toLocaleDateString("en-MW", { year: "numeric", month: "short", day: "numeric" });
    }

    function escapeHtml(value) {
        const element = document.createElement("div");
        element.textContent = value == null ? "" : String(value);
        return element.innerHTML;
    }

    function assetUrl(path) {
        if (!path) {
            const prefix = document.body && document.body.dataset.assetRoot !== undefined
                ? document.body.dataset.assetRoot
                : (window.location.pathname.includes("/seller/") || window.location.pathname.includes("/admin/") ? "../assets/" : "assets/");
            return prefix + "imgs/placeholder.svg";
        }
        return path;
    }

    global.NdagoUtils = { formatCurrency, formatDate, escapeHtml, assetUrl };
})(window);
