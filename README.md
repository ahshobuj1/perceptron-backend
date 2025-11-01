# 🛒 Full-Stack E-commerce Platform (Backend)

This is the complete **backend** for a modern full-stack e-commerce platform.  
It’s built with a **clean, modular, and scalable architecture** using **Node.js**, **Express**, and **TypeScript**.  

The platform supports **multiple user roles (Admin, Seller, Buyer)**, a **complete order lifecycle with online payments**, and **advanced analytics dashboards**.

---

## ✨ Core Features

- **Modular Architecture** – Each feature (Auth, Product, Order, etc.) is an independent module.
- **Role-Based Access Control**
  - **Admin:** Manage users and categories.
  - **Seller:** Manage own products and orders.
  - **Buyer:** Browse, purchase, and review products.
- **Full Product Management** – CRUD operations for products and categories.
- **Cloud File Uploads** – Integrated with **Cloudinary** for product images, videos, and user avatars.
- **Persistent Cart System** – Database-backed cart for logged-in users.
- **Complete Order Lifecycle**
  - ✅ Cash on Delivery (COD)
  - 💳 Online Payments via **SSLCommerz** (Bkash, Nagad, cards, etc.)
- **Analytics Dashboard**
  - Advanced aggregation pipeline for Admin and Seller dashboards.
- **Review System** – Buyers can review products they’ve purchased.

---

## 🛠️ Tech Stack

| Category | Technology |
|-----------|-------------|
| **Backend Framework** | Node.js, Express.js |
| **Language** | TypeScript |
| **Database** | MongoDB with Mongoose |
| **Validation** | Zod |
| **Authentication** | JWT (Access + Refresh Tokens) |
| **File Uploads** | Multer, Cloudinary |
| **Payments** | SSLCommerz |
| **Email Service** | Nodemailer |

---

## 🚀 Getting Started

Follow these steps to get the project running locally for development or testing.

### 🧩 Prerequisites

Make sure you have the following installed:

- **Node.js** (v18 or later)  
- **MongoDB** (local or MongoDB Atlas)  
- **Cloudinary Account** (for file uploads)  
- **SSLCommerz Sandbox Account** (for payment gateway)

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/ahshobuj1/perceptron-backend.git

cd your-repo-name

npm install

npm run dev

```

The server will start on the port you defined in .env
Example: http://localhost:5000
