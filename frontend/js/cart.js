/**
 * Global Cart Manager for Petify
 * Handles localCart sync with backend if logged in, UI rendering, and totals.
 */

class CartManager {
    constructor() {
        this.cart = []; // Array of { product: Object, qty: Number }
        this.initPromise = this.init();
    }

    async init() {
        const raw = JSON.parse(localStorage.getItem('petify_cart')) || [];
        // Filter out any stale items whose product object is null/missing (e.g. after a DB re-seed)
        this.cart = raw.filter(item => item && item.product && item.product._id);
        if (this.cart.length !== raw.length) {
            // Some items were stale — persist the cleaned cart
            localStorage.setItem('petify_cart', JSON.stringify(this.cart));
        }
        
        // If logged in, sync with backend
        const token = localStorage.getItem('petify_token');
        if (token) {
            try {
                // If local cart has items, sync them up first
                if (this.cart.length > 0) {
                    for (let item of this.cart) {
                        try {
                            await API.addToCart(item.product._id, item.qty, true); // Assuming a sync flag
                        } catch(e) {}
                    }
                    localStorage.removeItem('petify_cart'); // clear local after sync
                }

                // Fetch unified cart from server
                const res = await API.getCart();
                this.cart = res.cartItems || [];
            } catch (err) {
                console.error('Failed to sync cart:', err);
            }
        }

        this.updateUI();
        
        // Bind overlay click to close cart
        const overlay = document.getElementById('cart-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                document.getElementById('cart-overlay').classList.remove('active');
                document.getElementById('cart-drawer').classList.remove('active');
            });
        }

        // Bind ✕ close button
        const closeBtn = document.getElementById('close-cart-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('cart-overlay').classList.remove('active');
                document.getElementById('cart-drawer').classList.remove('active');
            });
        }
    }

    async addToCart(productId, qty = 1) {
        const token = localStorage.getItem('petify_token');
        
        if (token) {
            // Server side
            try {
                const res = await API.addToCart(productId, qty);
                this.cart = res.cartItems || [];
            } catch (err) {
                console.error(err);
                alert('Failed to add to cart: ' + err.message);
                return;
            }
        } else {
            // Client side logic (Need product details to store)
            try {
                const product = await API.getProduct(productId);
                const existing = this.cart.find(x => x.product._id === productId);
                if (existing) {
                    existing.qty += qty;
                } else {
                    this.cart.push({ product, qty });
                }
                this.saveLocal();
            } catch(e) { console.error(e); }
        }

        this.updateUI();
    }

    async removeFromCart(productId) {
        const token = localStorage.getItem('petify_token');

        if (token) {
            try {
                const res = await API.removeFromCart(productId);
                this.cart = res.cartItems || [];
            } catch (err) { console.error(err); }
        } else {
            this.cart = this.cart.filter(x => x.product._id !== productId);
            this.saveLocal();
        }

        this.updateUI();
    }

    async updateQty(productId, qty) {
        if (qty < 1) return this.removeFromCart(productId);
        
        const token = localStorage.getItem('petify_token');
        if (token) {
            // Backend lacks a direct "updateQty" in schema routes right now, 
            // The simplest approach is to remove and re-add, or an additive approach.
            // But since api/cart/add takes qty, if we pass exactly the required absolute qty?
            // Actually, backend appends qty. We can remove then add.
            try {
                // Now we just pass absoluteQty instead of removing and adding
                const res = await API.addToCart(productId, null, null, qty);
                this.cart = res.cartItems || [];
            } catch(e) { console.error(e); }
        } else {
            const item = this.cart.find(x => x.product._id === productId);
            if (item) item.qty = qty;
            this.saveLocal();
        }
        this.updateUI();
    }

    saveLocal() {
        localStorage.setItem('petify_cart', JSON.stringify(this.cart));
    }

    updateUI() {
        const countEl = document.getElementById('cart-count');
        const container = document.getElementById('cart-items-container');
        const totalEl = document.getElementById('cart-total-price');

        if (!container || !countEl || !totalEl) return;

        // Filter out any items whose product reference became null
        this.cart = this.cart.filter(item => item && item.product && item.product.price != null);

        // Calculate counts
        const totalItems = this.cart.reduce((acc, item) => acc + item.qty, 0);
        const totalPrice = this.cart.reduce((acc, item) => acc + (item.product.price * item.qty), 0);

        countEl.textContent = totalItems;
        if (totalItems > 0) {
            countEl.classList.add('pop');
            setTimeout(() => countEl.classList.remove('pop'), 300);
        }

        totalEl.textContent = '₹' + totalPrice;

        if (this.cart.length === 0) {
            container.innerHTML = `
                <div class="empty-cart-state">
                    <div class="empty-icon">🛒</div>
                    <h3>Your cart is empty</h3>
                    <p>Looks like you haven't added anything to your cart yet.</p>
                    <button class="btn-primary" onclick="window.location.href='products.html'" style="margin-top:20px;">Shop Now</button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.cart.map(item => {
            const p = item.product;
            const imgHtml = p.images && p.images.length > 0
                ? `<img src="${p.images[0]}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`
                : `<span style="font-size:26px;">${p.emoji || '🐾'}</span>`;
                
            return `
                <div class="cart-item-card">
                    <div class="ci-img">${imgHtml}</div>
                    <div class="ci-body">
                        <div class="ci-name">${p.name}</div>
                        <div class="ci-price">₹${(p.price * item.qty).toLocaleString('en-IN')}</div>
                        <div class="ci-footer">
                            <div class="ci-qty-pill">
                                <button type="button" class="ci-qty-btn ci-minus" onclick="cartQtyChange(this,'${p._id}',${item.qty - 1})">−</button>
                                <span class="ci-qty-num">${item.qty}</span>
                                <button type="button" class="ci-qty-btn ci-plus" onclick="cartQtyChange(this,'${p._id}',${item.qty + 1})">+</button>
                            </div>
                            <button type="button" class="ci-remove-btn" onclick="cartManager.removeFromCart('${p._id}')" title="Remove">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v6M14 11v6"></path><path d="M9 6V4h6v2"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add shipping progress bar at the bottom of the items list
        const shippingGoal = 999;
        const progressPercent = Math.min((totalPrice / shippingGoal) * 100, 100);
        const remaining = Math.max(shippingGoal - totalPrice, 0);
        const shippingMsg = remaining === 0 
            ? `<span>Congratulations!</span> You've unlocked free shipping.` 
            : `You're just <span>₹${remaining}</span> away from free shipping.`;
            
        container.innerHTML += `
            <div class="shipping-progress-container">
                <p class="shipping-text">${shippingMsg}</p>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
                </div>
            </div>
        `;
    }
}

// Instantiate globally
window.cartManager = new CartManager();
