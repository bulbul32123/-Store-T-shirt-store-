# 🕊️ Payra - Premium T-Shirt E-Commerce Platform

Payra is a modern, full-stack e-commerce application designed specifically for selling high-quality T-shirts (currently serving the Dhaka region). Built with a Next.js frontend and a Node.js/Express backend, Payra features real-time notifications, live customer support chat, robust administrative management tools, and secure role-based authentication.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** Next.js (App / Pages Router), React, Tailwind CSS, Shadcn UI / Lucide Icons
- **Backend:** Node.js, Express.js, MongoDB (Mongoose ORM)
- **Real-Time Engine:** Socket.io (for customer support chat & real-time admin notifications)
- **Image Storage:** Cloudinary (multi-category upload & asset management)
- **Deployment:** 
  - **Frontend:** Vercel (Edge Runtime for middleware)
  - **Backend:** Render (Express REST API server)
  - **Automation:** cron-job.org (automated database demo resetting)

---

## 🚀 Key Features & Modules

### 🔑 1. Advanced Authentication & User Profiles
- **JWT & Cookie Security:** Secure HttpOnly cookie handling for auth tokens.
- **Role-Based Access Control (RBAC):** Strict separation between standard `customer` users and `admin` roles guarded by custom Next.js middleware.
- **Full Profile Object:** Includes full name, email, phone number, default address (street, city, state, postal code), gender, date of birth, and avatar/profile image uploading.
- **Demo Admin Quick Login:** Built-in demo functionality for seamless administrative testing.

---

### 📦 2. Product Management
- **Catalog Operations:** Full CRUD capabilities for T-shirt products (title, description, price, stock, variants, colors, sizes).
- **Parent/Child Categories:** Organize products by primary and nested sub-categories.
- **Cloudinary Integration:** Multi-image upload pipeline supporting image hosting and optimization.

---

### 🏷️ 3. Category Management
- Hierarchical category structures with parent-child relationships.
- Ability to attach, edit, and organize product categories dynamically from the Admin Dashboard.

---

### 🛒 4. Cart & Watchlist (Wishlist)
- **Persistent Cart System:** Real-time cart state management synced across sessions and user accounts.
- **Watchlist / Wishlist:** Save items for later viewing with quick add-to-cart transfers.

---

### 📦 5. Order Management
- **Checkout Flow:** Integrated delivery location checks (optimized for Dhaka delivery zones).
- **Order Lifecycle:** Track status from `Pending` $\rightarrow$ `Processing` $\rightarrow$ `Shipped` $\rightarrow$ `Delivered` / `Cancelled`.
- **Order Details & History:** Customer dashboard for viewing past orders and receipt details; Admin dashboard for updating status and fulfillment.

---

### 👥 6. Customer Management
- **Admin Customer Directory:** View active accounts, customer detail views, user roles, purchase history, and account metrics.
- **Account Actions:** Manage user account statuses and customer profiles.

---

### 🎟️ 7. Coupons & Discount Management
- **Dynamic Coupon Codes:** Fixed-amount and percentage-based discount validation.
- **Usage Limits & Expirations:** Restrict coupon applicability by date, minimum cart subtotal, and single-use constraints.

---

### ⭐ 8. Review & Rating Management
- **Product Reviews:** Customers can leave star ratings and written reviews on purchased products.
- **Admin Moderation:** Manage, view, and moderate customer reviews across all product lines.

---

### 🔔 9. Real-Time Notification System
- **Socket.io Event Engine:** Live admin alerts triggered on key business events (e.g., new order placed, new message received).
- **In-App Alerts:** Dynamic header/dashboard notifications to keep administrators updated without requiring full page reloads.

---

### 💬 10. Live Customer Support Chat
- **Real-Time Communication:** Direct Socket.io-powered messaging between online customers and support admins.
- **Chat History:** Message persistence to maintain thread context during support sessions.

---

## 💻 Environment Setup

### Backend Environment Variables (`.env`)
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RESET_SECRET=your_demo_reset_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=[https://your-frontend-domain.vercel.app](https://your-frontend-domain.vercel.app)