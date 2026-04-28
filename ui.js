/**
 * Custom Notification / Toast System
 */

function ryuhuu_notify(message, type = 'info') {
    // Remove existing notifications if any (optional, or allow stacking)
    const existing = document.querySelectorAll('.ryuhuu-toast');
    existing.forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `ryuhuu-toast ryuhuu-toast-${type}`;

    // Style the toast based on "premium" look
    const icon = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';

    toast.innerHTML = `
        <div class="ryuhuu-toast-content">
            <span class="ryuhuu-toast-icon">${icon}</span>
            <span class="ryuhuu-toast-message">${message}</span>
        </div>
        <div class="ryuhuu-toast-progress"></div>
    `;

    // Inject CSS if not exists
    if (!document.getElementById('ryuhuu-toast-css')) {
        const style = document.createElement('style');
        style.id = 'ryuhuu-toast-css';
        style.innerHTML = `
            .ryuhuu-toast {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%) translateY(-20px);
                background: rgba(30, 41, 59, 0.9);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 12px 24px;
                color: white;
                font-family: 'Inter', sans-serif;
                font-size: 14px;
                font-weight: 500;
                z-index: 9999;
                opacity: 0;
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                display: flex;
                flex-direction: column;
                min-width: 300px;
            }
            .ryuhuu-toast.show {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            .ryuhuu-toast-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .ryuhuu-toast-error { border-left: 4px solid #ef4444; }
            .ryuhuu-toast-success { border-left: 4px solid #10b981; }
            .ryuhuu-toast-info { border-left: 4px solid #6366f1; }
            
            .ryuhuu-toast-progress {
                height: 3px;
                background: rgba(255, 255, 255, 0.2);
                margin-top: 10px;
                width: 100%;
                border-radius: 2px;
                overflow: hidden;
                position: relative;
            }
            .ryuhuu-toast-progress::after {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                height: 100%;
                width: 100%;
                background: currentColor;
                animation: toast-progress 3s linear forwards;
            }
            @keyframes toast-progress {
                from { width: 100%; }
                to { width: 0%; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

/**
 * Custom Confirmation Modal
 */
function ryuhuu_confirm(message, callback) {
    const modal = document.createElement('div');
    modal.className = 'ryuhuu-modal';
    modal.innerHTML = `
        <div class="ryuhuu-modal-box">
            <div class="ryuhuu-modal-header">
                <span class="ryuhuu-modal-icon">ℹ️</span>
                <h3>Konfirmasi</h3>
            </div>
            <div class="ryuhuu-modal-body">${message}</div>
            <div class="ryuhuu-modal-footer">
                <button class="ryuhuu-modal-btn ryuhuu-modal-btn-cancel">Batal</button>
                <button class="ryuhuu-modal-btn ryuhuu-modal-btn-ok">Lanjutkan</button>
            </div>
        </div>
    `;

    // Inject CSS if not exists
    if (!document.getElementById('ryuhuu-modal-css')) {
        const style = document.createElement('style');
        style.id = 'ryuhuu-modal-css';
        style.innerHTML = `
            .ryuhuu-modal {
                position: fixed;
                top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
                display: flex; align-items: center; justify-content: center;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            .ryuhuu-modal.show { opacity: 1; }
            .ryuhuu-modal-box {
                background: #1e293b;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                padding: 24px;
                max-width: 400px;
                width: 90%;
                transform: scale(0.9);
                transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                color: #f1f5f9;
            }
            .ryuhuu-modal.show .ryuhuu-modal-box { transform: scale(1); }
            .ryuhuu-modal-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
            .ryuhuu-modal-icon { font-size: 24px; }
            .ryuhuu-modal-header h3 { font-size: 1.25rem; font-weight: 700; margin: 0; }
            .ryuhuu-modal-body { color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
            .ryuhuu-modal-footer { display: flex; justify-content: flex-end; gap: 12px; }
            .ryuhuu-modal-btn {
                padding: 10px 20px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none;
            }
            .ryuhuu-modal-btn-cancel { background: rgba(255, 255, 255, 0.05); color: #94a3b8; }
            .ryuhuu-modal-btn-cancel:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }
            .ryuhuu-modal-btn-ok { background: #6366f1; color: white; }
            .ryuhuu-modal-btn-ok:hover { background: #4f46e5; transform: translateY(-1px); }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);

    const closeModal = (confirmed) => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
            if (confirmed) callback();
        }, 3000); // 300ms transition but wait a bit longer just in case? No, 300ms is enough. Wait, 3s was for toast.
    };

    // Fixed closing timeout
    const closeFast = (confirmed) => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
            if (confirmed && callback) callback();
        }, 300);
    };

    modal.querySelector('.ryuhuu-modal-btn-ok').onclick = () => closeFast(true);
    modal.querySelector('.ryuhuu-modal-btn-cancel').onclick = () => closeFast(false);
}

// Global hook to replace native alert if needed (optional)
// window.alert = ryuhuu_notify; 
