/* Seed demonstration entities. Values are replaced only when this collection is missing. */
(function (global) {
    "use strict";

    const categories = [
        { id: "agriculture", name: "Agriculture" },
        { id: "clothing", name: "Clothing" },
        { id: "electronics", name: "Electronics" },
        { id: "furniture", name: "Furniture" },
        { id: "building-materials", name: "Building Materials" },
        { id: "groceries", name: "Groceries" },
        { id: "bakery", name: "Bakery" },
        { id: "beauty-cosmetics", name: "Beauty & Cosmetics" }
    ];

    const sellers = [
        {
            id: "seller-greenfarm",
            shopName: "GreenFarm",
            ownerName: "GreenFarm Owner",
            district: "Lilongwe",
            description: "Fresh local produce supplied by a family-owned farm in Lilongwe.",
            phone: "",
            whatsapp: "",
            approvalStatus: "approved"
        },
        {
            id: "seller-stylehub",
            shopName: "StyleHub",
            ownerName: "StyleHub Owner",
            district: "Blantyre",
            description: "Affordable clothing and fashion products for everyday Malawian customers.",
            phone: "",
            whatsapp: "",
            approvalStatus: "approved"
        },
        {
            id: "seller-techzone",
            shopName: "TechZone",
            ownerName: "TechZone Owner",
            district: "Lilongwe",
            description: "Mobile devices and electronics with local marketplace support.",
            phone: "",
            whatsapp: "",
            approvalStatus: "approved"
        },
        {
            id: "seller-agrosupply",
            shopName: "AgroSupply",
            ownerName: "AgroSupply Owner",
            district: "Kasungu",
            description: "Local agricultural supply serving farmers and households.",
            phone: "",
            whatsapp: "",
            approvalStatus: "approved"
        }
    ];

    const products = [
        {
            id: "fresh-maize",
            name: "Fresh Maize",
            description: "Fresh locally sourced maize.",
            category: "Agriculture",
            categoryId: "agriculture",
            price: 45000,
            image: "assets/imgs/banners/Fresh-Products.jpg",
            sellerId: "seller-agrosupply",
            district: "Kasungu",
            stockQuantity: 20,
            availability: true,
            dateAdded: "2026-01-10"
        },
        {
            id: "casual-fashion-shirt",
            name: "Casual Fashion Shirt",
            description: "A comfortable casual shirt suitable for everyday wear.",
            category: "Clothing",
            categoryId: "clothing",
            price: 12000,
            image: "",
            sellerId: "seller-stylehub",
            district: "Blantyre",
            stockQuantity: 30,
            availability: true,
            dateAdded: "2026-01-12"
        },
        {
            id: "android-smartphone",
            name: "Android Smartphone",
            description: "An Android smartphone for everyday communication and entertainment.",
            category: "Electronics",
            categoryId: "electronics",
            price: 185000,
            image: "",
            sellerId: "seller-techzone",
            district: "Lilongwe",
            stockQuantity: 8,
            availability: true,
            dateAdded: "2026-01-15"
        },
        {
            id: "fresh-organic-tomatoes",
            name: "Fresh Organic Tomatoes (5kg)",
            description: "Freshly harvested organic tomatoes packed locally.",
            category: "Agriculture",
            categoryId: "agriculture",
            price: 4500,
            image: "",
            sellerId: "seller-greenfarm",
            district: "Lilongwe",
            stockQuantity: 50,
            availability: true,
            dateAdded: "2026-01-18"
        }
    ];

    function reset() {
        NdagoStorage.write("categories", categories);
        NdagoStorage.write("sellers", sellers);
        NdagoStorage.write("products", products);
        NdagoStorage.write("customers", []);
        NdagoStorage.write("cart", []);
        NdagoStorage.write("orders", []);
        NdagoStorage.write("sellerApplications", []);
        NdagoStorage.write("enquiries", []);
    }

    function initialize() {
        const required = ["categories", "sellers", "products", "customers", "cart", "orders", "sellerApplications", "enquiries"];
        const missing = required.some(function (key) {
            return NdagoStorage.read(key, null) === null;
        });

        if (missing) {
            reset();
        }
    }

    global.NdagoData = {
        getCategories: function () { return NdagoStorage.read("categories", []); },
        getSellers: function () { return NdagoStorage.read("sellers", []); },
        getProducts: function () { return NdagoStorage.read("products", []); },
        initialize: initialize,
        reset: reset
    };
})(window);
