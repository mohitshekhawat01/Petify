const CONFIG = {
    API_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:5000/api' 
        : '/api',
};

// Generic Fetch Wrapper
const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('petify_token');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Remove Content-Type for FormData (let browser set multipart boundary)
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    try {
        const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        // Handle non-JSON responses (e.g. PDF)
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            if (!response.ok) throw new Error('Request failed');
            return response;
        }

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('petify_token');
                localStorage.removeItem('petify_user');
                window.location.href = 'login.html';
            }
            throw new Error(data.message || 'API Error');
        }

        return data;
    } catch (err) {
        throw err;
    }
};

const API = {
    // Auth
    login: (credentials) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    signup: (data) => apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
    getProfile: () => apiFetch('/auth/profile'),
    updateProfile: (data) => apiFetch('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
    forgotPassword: (email) => apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
    resetPassword: (token, password) => apiFetch(`/auth/reset-password/${token}`, { method: 'POST', body: JSON.stringify({ password }) }),

    // Address Management
    addAddress: (data) => apiFetch('/auth/address', { method: 'POST', body: JSON.stringify(data) }),
    updateAddress: (index, data) => apiFetch(`/auth/address/${index}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteAddress: (index) => apiFetch(`/auth/address/${index}`, { method: 'DELETE' }),

    // Products
    getProducts: (query = '') => apiFetch(`/products${query}`),
    getProduct: (id) => apiFetch(`/products/${id}`),

    // Cart
    getCart: () => apiFetch('/cart'),
    addToCart: (productId, qty = 1, syncCart = null, absoluteQty = undefined) => apiFetch('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ productId, qty, syncCart, absoluteQty })
    }),
    removeFromCart: (productId) => apiFetch(`/cart/${productId}`, { method: 'DELETE' }),

    // Orders
    createOrder: (orderData) => apiFetch('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
    getMyOrders: () => apiFetch('/orders/my'),
    getOrder: (id) => apiFetch(`/orders/${id}`),
    updatePaymentSuccess: (id, paymentData) => apiFetch(`/orders/${id}/payment_success`, {
        method: 'PUT',
        body: JSON.stringify(paymentData)
    }),
    cancelOrder: (id) => apiFetch(`/orders/${id}/cancel`, { method: 'PUT' }),

    // Wishlist
    toggleWishlist: (productId) => apiFetch('/wishlist/toggle', { method: 'POST', body: JSON.stringify({ productId }) }),
    getWishlist: () => apiFetch('/wishlist'),

    // Payment
    createRazorpayOrder: (amount) => apiFetch('/payment/create-order', {
        method: 'POST',
        body: JSON.stringify({ amount })
    }),
    verifyPayment: (data) => apiFetch('/payment/verify', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // Invoice
    downloadInvoice: async (orderId) => {
        const token = localStorage.getItem('petify_token');
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${CONFIG.API_URL}/invoice/download/${orderId}`, {
            method: 'GET',
            headers
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Failed to download invoice');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `Invoice-${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    },
    emailInvoice: (orderId) => apiFetch(`/invoice/email/${orderId}`, { method: 'POST' }),

    // Reviews
    getReviews: (productId) => apiFetch(`/reviews/${productId}`),
    submitReview: (productId, data) => apiFetch(`/reviews/${productId}`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    deleteReview: (productId) => apiFetch(`/reviews/${productId}`, { method: 'DELETE' }),

    // Admin
    getAdminStats: () => apiFetch('/admin/stats'),
    getAdminUsers: () => apiFetch('/admin/users'),
    getAdminProducts: (page = 1) => apiFetch(`/admin/products?page=${page}&limit=20`),
    createAdminProduct: (formData) => apiFetch('/admin/products', { method: 'POST', body: formData }),
    updateAdminProduct: (id, formData) => apiFetch(`/admin/products/${id}`, { method: 'PUT', body: formData }),
    deleteAdminProduct: (id) => apiFetch(`/admin/products/${id}`, { method: 'DELETE' }),
};
