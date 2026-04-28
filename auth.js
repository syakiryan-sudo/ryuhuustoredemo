/**
 * Ryuhuustore Authentication & Session Management
 * Professional "Single Source of Truth" implementation.
 */

const AUTH_CONFIG = {
    USERS_KEY: 'ryuhuu_users',
    SESSION_KEY: 'ryuhuu_session',
    ADMIN_EMAIL: 'admin@ryuhuustore.com',
    ADMIN_PASS: 'Luminance123*',
    REDIRECT_LIMIT: 5,
    WINDOW_MS: 10000 // 10 seconds
};

// Reset all rate limits and purge Admin history for clean dashboard on load
Object.keys(localStorage).forEach(key => {
    if (key.startsWith('rate_limit_')) localStorage.removeItem(key);
});

// Purge Admin History items consistently
try {
    let history = JSON.parse(localStorage.getItem('ryuhuu_order_history')) || [];
    const initialLen = history.length;
    history = history.filter(o => o.email !== 'admin@ryuhuustore.com');
    if (history.length !== initialLen) {
        localStorage.setItem('ryuhuu_order_history', JSON.stringify(history));
    }
} catch (e) {
    console.error('History purge failed', e);
}

// Initialize Admin and User Storage
const initAuth = () => {
    let users = JSON.parse(localStorage.getItem(AUTH_CONFIG.USERS_KEY)) || [];
    const adminIdx = users.findIndex(u => u.email === AUTH_CONFIG.ADMIN_EMAIL);

    if (adminIdx === -1) {
        users.push({
            fullname: 'Administrator',
            email: AUTH_CONFIG.ADMIN_EMAIL,
            password: AUTH_CONFIG.ADMIN_PASS,
            avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ryuhuuAdmin',
            role: 'admin',
            balance: 1000000 // Admin gets some starting balance
        });
        localStorage.setItem(AUTH_CONFIG.USERS_KEY, JSON.stringify(users));
    } else {
        // Force update admin password if it differs from config
        if (users[adminIdx].password !== AUTH_CONFIG.ADMIN_PASS) {
            users[adminIdx].password = AUTH_CONFIG.ADMIN_PASS;
            localStorage.setItem(AUTH_CONFIG.USERS_KEY, JSON.stringify(users));
        }
    }
};

const registerUser = (fullname, email, password) => {
    let users = JSON.parse(localStorage.getItem(AUTH_CONFIG.USERS_KEY)) || [];
    if (users.find(u => u.email === email)) throw new Error('Email sudah terdaftar!');

    const newUser = {
        fullname, email, password,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(fullname)}`,
        role: 'user',
        balance: 0
    };

    users.push(newUser);
    localStorage.setItem(AUTH_CONFIG.USERS_KEY, JSON.stringify(users));
    return newUser;
};

const loginUser = (email, password) => {
    const users = JSON.parse(localStorage.getItem(AUTH_CONFIG.USERS_KEY)) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) throw new Error('Email atau password salah!');

    localStorage.setItem(AUTH_CONFIG.SESSION_KEY, JSON.stringify(user));
    if (typeof ryuhuu_notify === 'function') {
        ryuhuu_notify('Login berhasil! Selamat datang ' + user.fullname, 'success');
    }
    return user;
};

const logoutUser = () => {
    localStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
    const prefix = getAppPathPrefix();
    window.location.href = prefix + 'index.html';
};

const getCurrentUser = () => {
    try {
        const session = localStorage.getItem(AUTH_CONFIG.SESSION_KEY);
        return session ? JSON.parse(session) : null;
    } catch (e) {
        return null;
    }
};

/**
 * Expert Balance Management
 * Handles state persistence across session and users storage.
 */
const updateUserBalance = (amount) => {
    const user = getCurrentUser();
    if (!user) return;

    user.balance = (user.balance || 0) + amount;

    // Save to session
    localStorage.setItem(AUTH_CONFIG.SESSION_KEY, JSON.stringify(user));

    // Save to users database
    let users = JSON.parse(localStorage.getItem(AUTH_CONFIG.USERS_KEY)) || [];
    const idx = users.findIndex(u => u.email === user.email);
    if (idx !== -1) {
        users[idx].balance = user.balance;
        localStorage.setItem(AUTH_CONFIG.USERS_KEY, JSON.stringify(users));
    }

    if (typeof ryuhuu_notify === 'function') {
        ryuhuu_notify(`Saldo berhasil diperbarui: +Rp${amount.toLocaleString('id-ID')}`, 'success');
    }
    syncExpertUI();
};

const deductUserBalance = (amount) => {
    const user = getCurrentUser();
    if (!user || (user.balance || 0) < amount) throw new Error('Saldo tidak mencukupi!');

    user.balance -= amount;
    localStorage.setItem(AUTH_CONFIG.SESSION_KEY, JSON.stringify(user));

    let users = JSON.parse(localStorage.getItem(AUTH_CONFIG.USERS_KEY)) || [];
    const idx = users.findIndex(u => u.email === user.email);
    if (idx !== -1) {
        users[idx].balance = user.balance;
        localStorage.setItem(AUTH_CONFIG.USERS_KEY, JSON.stringify(users));
    }
    syncExpertUI();
};

const getAppPathPrefix = () => {
    const path = window.location.pathname.toLowerCase();
    const segments = path.split(/[/\\]/);
    const produkIndex = segments.indexOf('produk');
    const homeIndex = segments.indexOf('home');
    return (produkIndex !== -1 || homeIndex !== -1) ? '../' : '';
};

const handleGlobalRedirection = () => {
    const user = getCurrentUser();
    const path = window.location.pathname.toLowerCase();
    const prefix = getAppPathPrefix();

    // Path Identification (Better pattern matching)
    const isAuthPage = path.endsWith('/auth.html') || path.endsWith('\\auth.html') || path.endsWith('auth.html');
    const isProtectedPage = path.includes('dashboard.html') || path.includes('akun.html') || path.includes('keranjang.html');

    const hasSession = user && typeof user === 'object' && user.email;

    // Safety guard to prevent infinite loops
    const redirectCountKey = 'ryuhuu_redirect_count';
    const lastRedirectKey = 'ryuhuu_last_redirect';
    const now = Date.now();
    let count = parseInt(sessionStorage.getItem(redirectCountKey) || '0');
    let lastTime = parseInt(sessionStorage.getItem(lastRedirectKey) || '0');

    if (now - lastTime > AUTH_CONFIG.REDIRECT_TIME) count = 0;

    if (count > AUTH_CONFIG.REDIRECT_LIMIT) {
        console.warn("Auth: Redirection limit reached. Session might be unstable on file:// protocol.");
        return false;
    }

    if (hasSession && isAuthPage) {
        sessionStorage.setItem(redirectCountKey, (count + 1).toString());
        sessionStorage.setItem(lastRedirectKey, now.toString());
        window.location.href = prefix + 'dashboard.html';
        return true;
    }

    if (!hasSession && isProtectedPage) {
        sessionStorage.setItem(redirectCountKey, (count + 1).toString());
        sessionStorage.setItem(lastRedirectKey, now.toString());
        window.location.href = prefix + 'auth.html';
        return true;
    }

    return false;
};

/**
 * Professional UI Synchronization
 * Handles both public nav links and private dashboard data.
 */
const syncExpertUI = () => {
    const user = getCurrentUser();
    const path = window.location.pathname.toLowerCase();
    const prefix = getAppPathPrefix();

    // 1. Sync Public Navigation
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        const existingAuth = navLinks.querySelector('.auth-trigger');
        if (existingAuth) existingAuth.remove();

        const authItem = document.createElement('a');
        authItem.className = 'auth-trigger';
        authItem.href = user ? (prefix + 'dashboard.html') : (prefix + 'auth.html');

        const icon = user ?
            `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px; vertical-align: middle;"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>` :
            `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px; vertical-align: middle;"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>`;

        authItem.innerHTML = `${icon}${user ? 'Dashboard' : 'Login'}`;
        navLinks.prepend(authItem);
    }

    // 2. Sync Dashboard / Account Data (Zero-Inline Logic)
    if (user) {
        // Dashboard Fields
        const nameTitle = document.getElementById('user-name-title');
        const nameMini = document.getElementById('user-name-mini');
        const avatarMini = document.getElementById('user-avatar-mini');

        if (nameTitle) nameTitle.textContent = `Selamat Datang, ${user.fullname}!`;
        if (nameMini) nameMini.textContent = user.fullname;
        if (avatarMini) avatarMini.src = user.avatar;

        const balanceDisplay = document.getElementById('user-balance-display');
        if (balanceDisplay) {
            balanceDisplay.textContent = new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(user.balance || 0);
        }

        // Account / Edit Settings Fields
        const fullnameInput = document.getElementById('fullname');
        const sideFullname = document.getElementById('side-fullname');
        const emailInput = document.getElementById('email');
        const avatarPreview = document.getElementById('avatar-preview');
        const sideRole = document.getElementById('side-role');

        if (fullnameInput) fullnameInput.value = user.fullname;
        if (sideFullname) sideFullname.textContent = user.fullname;
        if (emailInput) emailInput.value = user.email;
        if (avatarPreview) avatarPreview.src = user.avatar;
        if (sideRole && user.role === 'admin') sideRole.textContent = 'Administrator';

        // 2b. Reveal Admin-only Features
        if (user.role === 'admin') {
            const testMode = document.getElementById('test-mode-section');
            if (testMode) testMode.style.display = 'block';
        }
    }

    // 3. Setup Interactive Elements (Avatar Upload, etc.)
    const avatarInput = document.getElementById('avatar-input');
    const uploadBtn = document.getElementById('upload-avatar-btn');
    if (avatarInput && uploadBtn) {
        uploadBtn.onclick = () => avatarInput.click();
        avatarInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (re) => {
                    const preview = document.getElementById('avatar-preview');
                    if (preview) preview.src = re.target.result;

                    // Update session and storage
                    const u = getCurrentUser();
                    u.avatar = re.target.result;
                    localStorage.setItem(AUTH_CONFIG.SESSION_KEY, JSON.stringify(u));

                    let users = JSON.parse(localStorage.getItem(AUTH_CONFIG.USERS_KEY));
                    const idx = users.findIndex(it => it.email === u.email);
                    if (idx !== -1) {
                        users[idx].avatar = re.target.result;
                        localStorage.setItem(AUTH_CONFIG.USERS_KEY, JSON.stringify(users));
                    }
                };
                reader.readAsDataURL(file);
            }
        };
    }

    // 4. Setup Account Form Submission
    const accountForm = document.getElementById('account-form');
    if (accountForm) {
        accountForm.onsubmit = (e) => {
            e.preventDefault();
            try {
                if (typeof enforceRateLimit === 'function') enforceRateLimit('save_account', 3, 1);

                const saveBtn = document.getElementById('btn-save');
                if (saveBtn) {
                    saveBtn.textContent = "Menyimpan...";
                    saveBtn.disabled = true;
                }

                const u = getCurrentUser();
                const newName = document.getElementById('fullname').value;
                const newPass = document.getElementById('password').value;

                u.fullname = newName;
                if (newPass) u.password = newPass;

                localStorage.setItem(AUTH_CONFIG.SESSION_KEY, JSON.stringify(u));

                let users = JSON.parse(localStorage.getItem(AUTH_CONFIG.USERS_KEY));
                const idx = users.findIndex(it => it.email === u.email);
                if (idx !== -1) {
                    users[idx].fullname = newName;
                    if (newPass) users[idx].password = newPass;
                    localStorage.setItem(AUTH_CONFIG.USERS_KEY, JSON.stringify(users));
                }

                setTimeout(() => {
                    if (typeof ryuhuu_notify === 'function') ryuhuu_notify(`Profil berhasil diperbarui!`, "success");
                    if (saveBtn) {
                        saveBtn.textContent = "Simpan Perubahan";
                        saveBtn.disabled = false;
                    }
                    const sideTitle = document.getElementById('side-fullname');
                    if (sideTitle) sideTitle.textContent = newName;
                }, 800);
            } catch (err) { }
        };
    }
};

// Application Bootstrap
initAuth();
document.addEventListener('DOMContentLoaded', () => {
    if (handleGlobalRedirection()) return;
    syncExpertUI();
});
