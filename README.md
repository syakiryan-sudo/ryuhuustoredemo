# Ryuhuustore: Premium Game Store & SaaS Dashboard

![Ryuhuustore Logo](logo.png)

Welcome to **Ryuhuustore**, a high-end, modern web application designed for game top-ups, cheat tool distribution, and SaaS-like user management. This platform features a stunning **Glassmorphism UI**, a robust authentication system, and a comprehensive administrative suite.

## ✨ Key Features

- **💎 Premium UI/UX**: Ultra-modern design using Glassmorphism, smooth animations, and tailored color palettes.
- **🌍 Dual-Language Support**: Fully localized in **Bahasa Indonesia** and **English** with real-time switching.
- **🛍️ Dynamic Storefront**: Categorized product catalog (Genshin Impact, Wuthering Waves, etc.) with detailed product pages and automated price conversion.
- **📊 Advanced Dashboard**: Centralized hub for users to track orders, manage balance, and view shopping statistics.
- **🛡️ Secure Auth System**: Multi-layered security including rate limiting, session persistence, and role-based access control (RBAC).
- **⚙️ Admin Management Panel**: Exclusive tools for administrators to manually top up user balances and manage platform settings.
- **🛒 Shopping Cart & Order Tracking**: Seamless checkout flow with detailed transaction history and professional 3-segment invoice IDs (`ryuuhu-xxxx-xxxx-xxxx`).

## 🚀 Tech Stack

- **Frontend**: Vanilla HTML5, CSS3 (Custom Glassmorphism), JavaScript (ES6+)
- **Logic**: Centralized `auth.js` for session/state, `ui.js` for dynamic interactions
- **Storage**: Browser `localStorage` for high-performance data persistence (server-less demonstration)
- **Security**: Custom `security.js` implementing rate limits and security headers

## 📂 Project Structure

```text
ryuhuustore/
├── index.html          # Main landing page (Dynamic Catalog)
├── auth.html           # Professional Login/Register portal
├── dashboard.html      # User Hub & Admin Management
├── akun.html           # Premium Account Settings (Glassmorphism)
├── pesanan.html        # Detailed Order History & Tracking
├── keranjang.html      # Integrated Checkout & Payment logic
├── globalpayment.html  # International payment gateway
├── auth.js             # Core authentication & state engine
├── ui.js               # Global UI components & animations
├── security.js         # Rate limiting & security patches
├── home/               # Sub-categories and cheat portals
└── produk/             # Dynamic product detail templates
```

## 🛠️ How to Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/syakiryan-sudo/ryuhuustore-main.git
   ```
2. **Open in Browser**:
   Simply open `index.html` in any modern web browser or use a local server for the best experience:
   ```bash
   npx serve .
   ```

## 📝 License & Credits

&copy; 2024 **Ryuhuustore**. All rights reserved.  
Developed with passion for gamers worldwide. #StayUndetected
