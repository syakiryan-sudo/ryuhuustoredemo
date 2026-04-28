/**
 * Anti-XSS Sanitize Input
 * Merubah karakter berbahaya menjadi HTML entities sehingga payload tidak akan tereksekusi.
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input.replace(/[&<>"']/g, function (match) {
        const escapeMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };
        return escapeMap[match];
    });
}

/**
 * XSS Protection pada DOM
 * Secara otomatis membersihkan input-input pada halaman jika ada formulir yang dikirim (submit) 
 * atau value di-blur.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Override form submission and sanitize all inputs before proceeding
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            const inputs = form.querySelectorAll('input[type="text"], input[type="email"], textarea');
            inputs.forEach(input => {
                input.value = sanitizeInput(input.value);
            });
        });
    });

    // Auto sanitize on blur
    const textInputs = document.querySelectorAll('input[type="text"], input[type="email"], textarea');
    textInputs.forEach(input => {
        input.addEventListener('blur', (e) => {
            e.target.value = sanitizeInput(e.target.value);
        });
    });
});

/**
 * Rate Limiting
 * Menggunakan localStorage untuk membatasi frekuensi klik atau submit action.
 * @param {string} actionName - Nama action / endpoint
 * @param {number} maxAttempts - Jumlah percobaan maksimal
 * @param {number} timeframeMinutes - Jangka waktu pembatasan dalam menit
 * @returns {boolean} - true jika action diijinkan (belum limit), false jika limit
 */
function checkRateLimit(actionName, maxAttempts = 5, timeframeMinutes = 1) {
    const key = 'rate_limit_' + actionName;
    const now = Date.now();
    let record = JSON.parse(localStorage.getItem(key)) || { attempts: 0, firstAttempt: now };

    // Reset if timeframe has passed
    if (now - record.firstAttempt > timeframeMinutes * 60000) {
        record = { attempts: 1, firstAttempt: now };
        localStorage.setItem(key, JSON.stringify(record));
        return true;
    }

    if (record.attempts >= maxAttempts) {
        return false; // Rate limited
    }

    record.attempts += 1;
    localStorage.setItem(key, JSON.stringify(record));
    return true; // Allowed
}

/**
 * Helper to show an alert or notification if rate limited
 */
function enforceRateLimit(actionName, maxAttempts, timeframeMinutes, msg = "Terlalu banyak percobaan! Anda terkena Rate Limit.") {
    const allowed = checkRateLimit(actionName, maxAttempts, timeframeMinutes);
    if (!allowed) {
        if (typeof ryuhuu_notify === 'function') {
            ryuhuu_notify(msg, 'error');
        } else {
            alert(msg);
        }
        throw new Error(msg);
    }
    return true;
}
