// ==========================================
// PETIFY MAIN SCRIPTS
// ==========================================

// ── Star Rating Helper ────────────────────────────────────────────────────
window.renderStars = function(rating) {
    const r = Math.round((rating || 0) * 2) / 2; // round to nearest 0.5
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (r >= i) {
            stars += '<span style="color:var(--gold)">★</span>';
        } else if (r >= i - 0.5) {
            stars += '<span style="color:var(--gold)">½</span>';
        } else {
            stars += '<span style="color:var(--ivory3)">★</span>';
        }
    }
    return stars;
};

document.addEventListener('DOMContentLoaded', () => {

    // 1. Intro Sequence
    const introSequence = document.getElementById('intro-sequence');
    const introText = document.querySelector('.intro-text');
    const introVideo = document.querySelector('.intro-video');
    const skipBtn = document.getElementById('skip-intro');

    if (introSequence) {
        const navType = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]?.type) || '';
        const introShown = sessionStorage.getItem('petify_intro_shown');

        // Show intro only on first visit OR on a manual page refresh
        if (!introShown || navType === 'reload') {
            sessionStorage.setItem('petify_intro_shown', '1');

            // Hide chatbot bubble so it doesn't overlap the Skip Intro button
            const pawsyWrap = document.getElementById('pawsy-wrap');
            if (pawsyWrap) pawsyWrap.style.display = 'none';

            const videoEl = introVideo ? introVideo.querySelector('video') : null;

            const finishVideo = () => {
                if (introVideo) introVideo.classList.add('fade-out');
                setTimeout(() => {
                    if (introText) introText.classList.add('show');
                    setTimeout(() => {
                        endIntro();
                    }, 2500);
                }, 500);
            };

            if (videoEl) {
                videoEl.addEventListener('ended', finishVideo);
                setTimeout(finishVideo, 8000); // fallback
            } else {
                setTimeout(finishVideo, 3000);
            }
        } else {
            // Already seen — remove instantly without showing
            introSequence.remove();
        }
    }

    if (skipBtn) {
        skipBtn.addEventListener('click', endIntro);
    }

    function endIntro() {
        if (!introSequence) return;
        introSequence.classList.add('hidden');
        sessionStorage.setItem('petify_intro_shown', '1');
        setTimeout(() => introSequence.remove(), 1000);
        // Reveal chatbot bubble now that intro is gone
        const pawsyWrap = document.getElementById('pawsy-wrap');
        if (pawsyWrap) {
            pawsyWrap.style.display = '';
            pawsyWrap.style.animation = 'pawsyBounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1)';
        }
    }

    // 2. Custom Cursor Tracking (Globally Injected)
    let customCursor = document.getElementById('custom-cursor');
    let cursorRing = document.getElementById('cursor-ring');

    if (!customCursor) {
        customCursor = document.createElement('div');
        customCursor.id = 'custom-cursor';
        document.body.appendChild(customCursor);
    }
    if (!cursorRing) {
        cursorRing = document.createElement('div');
        cursorRing.id = 'cursor-ring';
        document.body.appendChild(cursorRing);
    }

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        customCursor.style.left = mouseX + 'px';
        customCursor.style.top = mouseY + 'px';
    });

    const ringLoop = () => {
        // Ease ring towards mouse
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        cursorRing.style.left = ringX + 'px';
        cursorRing.style.top = ringY + 'px';
        requestAnimationFrame(ringLoop);
    };
    ringLoop();

    // Add hover states for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .product-card');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    // 3. Floating Dust Particles Canvas
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = -Math.random() * 0.8 - 0.2; // Drift upward
                this.color = Math.random() > 0.5 ? 'rgba(201, 151, 58, 0.4)' : 'rgba(74, 40, 16, 0.2)';
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.y < 0) this.y = canvas.height;
                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
            }
            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < 60; i++) {
            particles.push(new Particle());
        }

        const animateParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animateParticles);
        };
        animateParticles();
    }

    // 4. Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
    
    // Auto-remove transparent from inner pages immediately
    if (!isHomePage && navbar) {
        navbar.classList.remove('transparent');
    }

    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
                navbar.classList.remove('transparent');
            } else {
                navbar.classList.remove('scrolled');
                if (isHomePage) navbar.classList.add('transparent');
            }
        });
    }

    // 5. Scroll Reveal Animations (Intersection Observer)
    const fadeElements = document.querySelectorAll('.fade-up');
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once faded in
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    fadeElements.forEach(el => fadeObserver.observe(el));

    // 6. Mobile Menu
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileDrawer = document.getElementById('mobile-drawer');
    if (mobileBtn && mobileDrawer) {
        mobileBtn.addEventListener('click', () => {
            mobileDrawer.classList.toggle('active');
        });
    }

    // Initialize homepage features if we are on index
    if (document.getElementById('best-sellers-grid')) {
        loadBestSellers();

        // 7. Homepage Category Tabs Logic
        const filterTabs = document.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                // Remove active from all
                filterTabs.forEach(t => t.classList.remove('active'));
                // Add active to clicked
                e.currentTarget.classList.add('active');
                
                // Fetch filtered layout
                const category = e.currentTarget.getAttribute('data-filter');
                if (category === 'All') {
                    loadBestSellers();
                } else if (category === 'Food') { // Map the HTML data-filter="Food" to backend category
                    loadBestSellers('Food & Treats');
                } else {
                    loadBestSellers(category);
                }
            });
        });
    }
});

// Load Best Sellers
async function loadBestSellers(categoryFilter = null) {
    const grid = document.getElementById('best-sellers-grid');
    const shimmer = document.getElementById('best-sellers-shimmer');
    if (!grid) return;

    if (shimmer) shimmer.style.display = 'grid';
    grid.style.display = 'none';

    try {
        let qs = '?sort=Top Rated&limit=6';
        if(categoryFilter) qs += `&category=${encodeURIComponent(categoryFilter)}`;
        
        const res = await API.getProducts(qs);
        
        grid.innerHTML = '';
        res.products.forEach(product => {
            const isSale = product.oldPrice ? true : false;
            let badgeHtml = '';
            if (product.badge) {
                let badgeClass = 'badge-new';
                if (product.badge === 'Best Seller') badgeClass = 'badge-best';
                if (product.badge.includes('Off') || product.badge === 'Sale') badgeClass = 'badge-sale';
                badgeHtml = `<div class="prod-badge ${badgeClass}">${product.badge}</div>`;
            }

            const imgHtml = product.images && product.images.length > 0
                ? `<img src="${product.images[0]}" class="prod-image" alt="${product.name}">`
                : `<div class="prod-emoji">${product.emoji || '🐾'}</div>`;

            const safeName = (product.name || '').replace(/'/g, "\\'");
            const html = `
                <div class="product-card" data-id="${product._id}" onclick="window.location.href='product-detail.html?id=${product._id}'">
                    <div class="prod-img-area">
                        ${badgeHtml}
                        <button class="prod-wishlist" data-product-id="${product._id}" onclick="toggleWishlist(event, this)">🤍</button>
                        ${imgHtml}
                        <div class="quick-add-bar">Quick Add to Cart</div>
                    </div>
                    <div class="prod-info">
                        <span class="prod-cat">${product.category}</span>
                        <h3 class="prod-name">${product.name}</h3>
                        <div class="prod-rating">
                            <span class="stars">${renderStars(product.rating)}</span>
                            <span class="reviews-count">${product.numReviews} reviews</span>
                        </div>
                        <div class="prod-bottom">
                            <div class="prod-price-area">
                                ${isSale ? `<span class="prod-old-price">₹${product.oldPrice}</span>` : ''}
                                <span class="prod-price">₹${product.price}</span>
                            </div>
                            <button class="add-to-cart-btn" onclick="addToCartAnimation(event, '${product._id}', '${product.emoji || '🐾'}', '${safeName}')">
                                +
                            </button>
                        </div>
                    </div>
                </div>
            `;
            grid.insertAdjacentHTML('beforeend', html);
        });
    } catch (err) {
        console.error('Failed to load best sellers:', err.message);
        grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:40px 0;">Could not load products — make sure the backend server is running.</p>';
    } finally {
        if (shimmer) shimmer.style.display = 'none';
        grid.style.display = 'grid';
    }
}
    



// Wishlist toggle
let _wishlistIds = new Set(JSON.parse(localStorage.getItem('petify_wishlist') || '[]'));

// Initialise hearts from localStorage / backend on page load
(async function initWishlist() {
    const token = localStorage.getItem('petify_token');
    if (token) {
        try {
            const items = await API.getWishlist();
            _wishlistIds = new Set(items.map(p => p._id));
            localStorage.setItem('petify_wishlist', JSON.stringify([..._wishlistIds]));
        } catch(e) { /* silent — use localStorage fallback */ }
    }
    // Colour any hearts already rendered on the page
    document.querySelectorAll('[data-product-id]').forEach(btn => {
        if (_wishlistIds.has(btn.dataset.productId)) {
            btn.textContent = '❤️';
            btn.classList.add('active');
        }
    });
})();

async function toggleWishlist(e, btn) {
    e.stopPropagation();
    // btn always has data-product-id (set by template); fall back to closest card
    const productId = btn.dataset?.productId
        || btn.closest('[data-id]')?.dataset?.id
        || btn.closest('.product-card')?.dataset?.id;
    if (!productId) { console.warn('toggleWishlist: no productId found', btn); return; }

    const isActive = btn.classList.toggle('active');
    btn.textContent = isActive ? '❤️' : '🤍';

    const token = localStorage.getItem('petify_token');
    if (token) {
        try {
            const result = await API.toggleWishlist(productId);
            // result.wishlist is an array of ObjectId strings
            _wishlistIds = new Set(result.wishlist.map(id => id.toString()));
        } catch(err) {
            // revert UI on failure
            btn.classList.toggle('active');
            btn.textContent = btn.classList.contains('active') ? '❤️' : '🤍';
            showToast('❌ Please log in to save items.');
            return;
        }
        showToast(isActive ? '❤️ Saved!' : '🤍 Removed from saved');
    } else {
        // Guest — store in localStorage only
        if (isActive) _wishlistIds.add(productId);
        else _wishlistIds.delete(productId);
        showToast(isActive ? '❤️ Saved! Log in to sync.' : '🤍 Removed');
    }
    localStorage.setItem('petify_wishlist', JSON.stringify([..._wishlistIds]));
}

// Global Show Toast
function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastOut 0.4s ease forwards';
        setTimeout(() => toast.remove(), 400);
    }, 2700);
}

// Global Add to Cart Animation Flow
window.addToCartAnimation = function(e, productId, emoji, name) {
    e.stopPropagation();
    
    const btn = e.currentTarget;
    const card = btn.closest('.product-card') || btn; // fallback to btn if not in card
    const cartNavBtn = document.getElementById('open-cart-btn');
    
    // Phase 1: Card Pulse
    if (card !== btn) {
        card.style.animation = 'none';
        card.offsetHeight; // trigger reflow
        card.style.animation = 'cardPulse 0.3s ease';
    }

    // Phase 2: Button Ripple
    btn.classList.add('added');
    btn.innerHTML = '✓';
    setTimeout(() => {
        btn.classList.remove('added');
        btn.innerHTML = '+';
    }, 1300);

    // Phase 3: Flying Animal Arc
    const rect = btn.getBoundingClientRect();
    const cartRect = cartNavBtn.getBoundingClientRect();
    
    const flyingAnimal = document.createElement('div');
    const animals = ['🐕', '🐈', '🐩', '🦮', '🐕🦺', '🐾'];
    
    // Check if the 'emoji' passed is actually an image URL or long string, if so, fallback
    const flyIcon = (emoji && emoji.length < 5 && !emoji.startsWith('http')) ? emoji : animals[Math.floor(Math.random() * animals.length)];
    
    flyingAnimal.textContent = flyIcon;
    flyingAnimal.style.position = 'fixed';
    flyingAnimal.style.fontSize = '30px';
    flyingAnimal.style.zIndex = '9999';
    flyingAnimal.style.pointerEvents = 'none';
    document.body.appendChild(flyingAnimal);

    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    const endX = cartRect.left + cartRect.width / 2;
    const endY = cartRect.top + cartRect.height / 2;

    const duration = 700;
    const startTime = performance.now();

    function animateFly(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing (ease-in-out)
        const easeProgress = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

        // Path (parabola)
        const currentX = startX + (endX - startX) * easeProgress;
        const currentY = startY + (endY - startY) * easeProgress - (Math.sin(easeProgress * Math.PI) * 150);
        
        // Spin and shrink
        const rotation = progress * 400;
        const scale = 1 - (progress * 0.6); // Shrinks to 0.4

        flyingAnimal.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotation}deg) scale(${scale})`;

        // Dropping pawprints randomly
        if (Math.random() < 0.1 && progress < 0.9) {
            dropPawprint(currentX, currentY);
        }

        if (progress < 1) {
            requestAnimationFrame(animateFly);
        } else {
            flyingAnimal.remove();
            cartLandedAnimation();
        }
    }
    
    requestAnimationFrame(animateFly);

    function dropPawprint(x, y) {
        const paw = document.createElement('div');
        paw.innerHTML = '🐾';
        paw.style.position = 'fixed';
        paw.style.left = x + 'px';
        paw.style.top = y + 'px';
        paw.style.opacity = '0.5';
        paw.style.fontSize = '12px';
        paw.style.pointerEvents = 'none';
        paw.style.transition = 'opacity 0.6s, transform 0.6s';
        document.body.appendChild(paw);
        
        setTimeout(() => {
            paw.style.opacity = '0';
            paw.style.transform = 'scale(0.5)';
            setTimeout(() => paw.remove(), 600);
        }, 50);
    }

    function cartLandedAnimation() {
        // Phase 4: Cart Landing
        cartNavBtn.style.transform = 'scale(1.22) rotate(-5deg)';
        setTimeout(() => cartNavBtn.style.transform = 'none', 200);

        // Update badge
        window.cartManager?.addToCart(productId, 1);
        
        // Sparkles
        for(let i=0; i<8; i++) {
            const sparkle = document.createElement('div');
            sparkle.style.position = 'absolute';
            sparkle.style.width = '6px';
            sparkle.style.height = '6px';
            sparkle.style.background = 'var(--gold)';
            sparkle.style.borderRadius = '50%';
            //...
            // For simplicity, skip detailed sparkles or add minimal CSS animation
        }

        // Phase 5: Toast
        showToast(`<span>${emoji || '🐾'}</span> <strong>${name}</strong> added to cart!`);
    }
};

// Add standard keyframes dynamically to document
const styleEl = document.createElement('style');
styleEl.innerHTML = `
    @keyframes cardPulse { 50% { transform: scale(1.04); box-shadow: 0 0 30px rgba(201,151,58,0.5); } }
    @keyframes toastOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(20px); } }

    /* ── Premium Cart Item Card ── */
    .cart-item-card {
        display: flex;
        gap: 14px;
        align-items: flex-start;
        padding: 14px 12px;
        border-radius: 18px;
        background: var(--white, #fff);
        border: 1px solid rgba(201,151,58,0.12);
        margin-bottom: 10px;
        box-shadow: 0 2px 12px rgba(74,40,16,0.05);
        transition: box-shadow 0.2s;
    }
    .cart-item-card:hover { box-shadow: 0 6px 24px rgba(201,151,58,0.14); }

    .ci-img {
        width: 72px; height: 72px; flex-shrink: 0;
        border-radius: 12px; overflow: hidden;
        background: rgba(201,151,58,0.07);
        display: flex; align-items: center; justify-content: center;
    }
    .ci-img img { width:100%; height:100%; object-fit:cover; border-radius:12px; }

    .ci-body { flex:1; display:flex; flex-direction:column; gap:4px; }
    .ci-name  { font-size:13.5px; font-weight:600; color:var(--brown,#4a2810); line-height:1.3; }
    .ci-price { font-size:16px; font-weight:700; color:var(--gold,#c9973a); }

    .ci-footer { display:flex; align-items:center; justify-content:space-between; margin-top:6px; }

    /* Pill qty selector */
    .ci-qty-pill {
        display: inline-flex;
        align-items: center;
        gap: 0;
        background: var(--ivory, #faf6f0);
        border: 1.5px solid rgba(201,151,58,0.28);
        border-radius: 999px;
        overflow: hidden;
        height: 34px;
    }
    .ci-qty-btn {
        width: 34px; height: 34px;
        background: transparent;
        border: none; cursor: pointer;
        font-size: 18px; font-weight: 700;
        color: var(--gold,#c9973a);
        display: flex; align-items: center; justify-content: center;
        transition: background 0.15s, transform 0.1s, color 0.15s;
        outline: none;
        user-select: none;
        border-radius: 0;
        flex-shrink: 0;
    }
    .ci-qty-btn:hover { background: rgba(201,151,58,0.12); }
    .ci-qty-btn.ci-btn-active {
        background: var(--gold, #c9973a) !important;
        color: #fff !important;
        transform: scale(0.9);
    }
    .ci-qty-num {
        min-width: 30px; height: 100%;
        display: flex; align-items: center; justify-content: center;
        font-size: 14px; font-weight: 700;
        color: var(--brown,#4a2810);
        border-left: 1.5px solid rgba(201,151,58,0.2);
        border-right: 1.5px solid rgba(201,151,58,0.2);
        padding: 0 2px;
    }

    /* Remove btn */
    .ci-remove-btn {
        width: 30px; height: 30px; border-radius: 50%;
        background: transparent; border: 1.5px solid rgba(220,53,69,0.25);
        color: #dc3545; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: all 0.2s; outline: none; flex-shrink: 0;
    }
    .ci-remove-btn:hover { background: rgba(220,53,69,0.1); border-color: #dc3545; transform: scale(1.1); }
`;
document.head.appendChild(styleEl);

// 8.5 Cart Quantity Change Helper (with click animation)
window.cartQtyChange = function(btn, productId, newQty) {
    // Flash the clicked button with the active state
    btn.classList.add('ci-btn-active');
    setTimeout(() => btn.classList.remove('ci-btn-active'), 220);

    // Delegate actual update to cartManager
    if (window.cartManager) {
        window.cartManager.updateQty(productId, newQty);
    }
};

// 8. Global Scroll to Top Button
(function initScrollToTop() {
    const btn = document.createElement('button');
    btn.className = 'scroll-to-top-btn';
    btn.innerHTML = '↑';
    btn.setAttribute('aria-label', 'Scroll to top');
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
})();

