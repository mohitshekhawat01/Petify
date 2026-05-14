// Authentication logic
const checkAuthState = () => {
    const token = localStorage.getItem('petify_token');
    const user = JSON.parse(localStorage.getItem('petify_user') || 'null');

    // Update nav auth button (index.html)
    const navAuthBtn = document.getElementById('nav-auth-btn');
    if (navAuthBtn) {
        if (token && user) {
            const firstName = (user.name || 'Profile').split(' ')[0];
            navAuthBtn.textContent = `👤 Hi, ${firstName}`;
            navAuthBtn.href = 'profile.html';
        } else {
            navAuthBtn.innerHTML = '👤 Login / Sign Up';
            navAuthBtn.href = 'login.html';
        }
    }

    // Update UI if user is logged in
    if (token && user) {
        document.body.classList.add('is-logged-in');
        
        // Change auth link to Logout in mobile drawer if exists
        const mobileAuthLink = document.getElementById('mobile-auth-link');
        if (mobileAuthLink) {
            mobileAuthLink.textContent = 'Logout';
            mobileAuthLink.href = '#';
            mobileAuthLink.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        }
    } else {
        document.body.classList.remove('is-logged-in');
    }
    
    return { token, user };
};

const logout = () => {
    localStorage.removeItem('petify_token');
    localStorage.removeItem('petify_user');
    window.location.href = 'index.html';
};

// Verify auth initially
window.addEventListener('DOMContentLoaded', checkAuthState);
