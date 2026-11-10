
/* ==========================================
   NDAGO MARKET - CENTRAL SHOPPING CART
========================================== */

const CART_KEY = "cart";

// Retrieve cart from localStorage
function getCart() {

    try {
        return NdagoStorage.read(CART_KEY, []);
    } catch (error) {
        console.error("Could not read shopping cart:", error);
        return [];
    }

}

// Save cart to localStorage
function saveCart(cart) {

    NdagoStorage.write(CART_KEY, cart);

    updateCartBadge();

}

// Calculate total quantity of products
function getCartCount() {

    const cart = getCart();

    return cart.reduce(function (total, item) {
        return total + Number(item.quantity ?? item.qty ?? 0);
    }, 0);

}

// Update navigation badge
function updateCartBadge() {

    const badges = document.querySelectorAll("[data-cart-count], #ndagoCartCount, #cartCount");

    badges.forEach(function (badge) {
        badge.textContent = getCartCount();
    });

}

// Add product to cart
function addToCart(product) {

    if (!product || !product.id || !product.name ||
        !Number.isFinite(Number(product.price)) ||
        Number(product.price) < 0) {
        console.error("Invalid product information.");
        return false;
    }

    const cart = getCart();

    // Check whether product already exists
    const existingProduct = cart.find(function (item) {
        return item.id === product.id;
    });
    const stockQuantity = Number(product.stockQuantity || 0);
    const currentQuantity = existingProduct
        ? Number(existingProduct.quantity ?? existingProduct.qty ?? 0)
        : 0;
    const nextQuantity = currentQuantity + 1;
    if (stockQuantity > 0 && nextQuantity > stockQuantity) {
        return false;
    }

    if (existingProduct) {

        // Increase quantity
        existingProduct.quantity = nextQuantity;
            delete existingProduct.qty;

    } else {

        // Add new product
        cart.push({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            district: product.district || "",
            quantity: 1,
            sellerId: product.sellerId || ""
        });

    }

    saveCart(cart);

    console.log("Product added:", product.name);

    return true;

}

// Remove product from cart
function removeFromCart(productId) {

    const cart = getCart().filter(function (item) {
        return item.id !== productId;
    });

    saveCart(cart);

}

// Change product quantity
function updateCartQuantity(productId, quantity) {

    const cart = getCart();

    const product = cart.find(function (item) {
        return item.id === productId;
    });

    if (!product) return;

    const newQuantity = Number(quantity);

    if (!Number.isInteger(newQuantity) || newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }

    product.quantity = newQuantity;
    delete product.qty;

    saveCart(cart);

}

// Clear entire cart
function clearCart() {

    NdagoStorage.remove(CART_KEY);

    updateCartBadge();

}


// Handle Add to Cart buttons
document.addEventListener("click", function (event) {

    const button = event.target.closest(".add-to-cart-btn");

    if (!button) return;

    const productCard = button.closest(".product-result");

    if (!productCard) return;

    const product = {
        id: productCard.dataset.id,
        name: productCard.querySelector("h6").textContent.trim(),
        price: Number(productCard.dataset.price),
        district: productCard.dataset.district,
        sellerId: productCard.dataset.sellerId,
        stockQuantity: Number(productCard.dataset.stock || 0)
    };

    const added = addToCart(product);

    if (added) {

        const originalText = button.textContent;

        button.textContent = "Added to Cart ✓";

        button.classList.add("added-to-cart");

        button.disabled = true;

        setTimeout(function () {

            button.textContent = originalText;

            button.classList.remove("added-to-cart");

            button.disabled = false;

        }, 1000);

    }

});


// Update badge when another browser tab changes the cart
window.addEventListener("storage", function (event) {

    if (event.key === "ndagoMarket:" + CART_KEY) {
        updateCartBadge();
    }

});


// Initialise cart badge
document.addEventListener("DOMContentLoaded", function () {

    updateCartBadge();

});
