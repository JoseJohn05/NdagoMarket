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
        { id: "beauty-cosmetics", name: "Beauty & Cosmetics" },
        { id: "home-kitchen", name: "Home & Kitchen" },
        { id: "phones-accessories", name: "Phones & Accessories" },
        { id: "health-personal-care", name: "Health & Personal Care" },
        { id: "shoes-bags-accessories", name: "Shoes, Bags & Accessories" },
        { id: "automotive-parts", name: "Automotive & Motorbike Parts" },
        { id: "books-school-office", name: "Books, Education & Office Supplies" },
        { id: "sports-outdoors", name: "Sports & Outdoors" },
        { id: "arts-crafts-local", name: "Arts, Crafts & Local Products" },
        { id: "baby-kids", name: "Baby & Kids" },
        { id: "services", name: "Services" }
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
            image: "assets/imgs/products/Mgaiwa.jpg",
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
            image: "assets/imgs/products/White Shirt.jpg",
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
            image: "assets/imgs/products/Galaxy A15.jpg",
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
            image: "assets/imgs/products/Tomatoes.jpg",
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
        const seed = {
            categories: categories, sellers: sellers, products: products, customers: [],
            cart: [], orders: [], sellerApplications: [], enquiries: []
        };
        Object.keys(seed).forEach(function (key) {
            if (NdagoStorage.read(key, null) === null) NdagoStorage.write(key, seed[key]);
        });
        const storedCategories = NdagoStorage.read("categories", []);
        const knownCategoryIds = new Set(storedCategories.map(function (category) { return category.id; }));
        const missingCategories = categories.filter(function (category) { return !knownCategoryIds.has(category.id); });
        if (missingCategories.length) NdagoStorage.write("categories", storedCategories.concat(missingCategories));
        // Backfill real bundled photos for original demo listings that were seeded without images.
        const demoImages = {
            "fresh-maize": "assets/imgs/products/Mgaiwa.jpg",
            "casual-fashion-shirt": "assets/imgs/products/White Shirt.jpg",
            "android-smartphone": "assets/imgs/products/Galaxy A15.jpg",
            "fresh-organic-tomatoes": "assets/imgs/products/Tomatoes.jpg"
        };
        const currentProducts = NdagoStorage.read("products", []);
        let productsChanged = false;
        currentProducts.forEach(function (product) {
            const localImage = demoImages[product.id];
            if (localImage && (!product.image || product.image.indexOf("placeholder.svg") !== -1 || product.image === "assets/imgs/banners/Fresh-Products.jpg")) {
                product.image = localImage;
                productsChanged = true;
            }
        });
        if (productsChanged) NdagoStorage.write("products", currentProducts);
    }

    global.NdagoData = {
        getCategories: function () { return NdagoStorage.read("categories", []); },
        getSellers: function () { return NdagoStorage.read("sellers", []); },
        getProducts: function () { return NdagoStorage.read("products", []); },
        initialize: initialize,
        reset: reset
    };
})(window);
