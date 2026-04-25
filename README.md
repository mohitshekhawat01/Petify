# 🐾 Petify — Pet E-Commerce Platform

> A full-stack e-commerce web application for pet lovers. Buy premium pet food, accessories, toys, and more — all in one place.

---

## 📸 Overview

**Petify** is a feature-rich online pet store built with a vanilla HTML/CSS/JavaScript frontend and a Node.js + Express + MongoDB backend. It supports user authentication, product browsing, cart & wishlist management, Razorpay payment integration, order tracking, AI-powered chatbot, invoice generation, and a secure admin dashboard.

---

## 🚀 Features

- 🔐 **User Authentication** — Signup, login, JWT-based sessions, password reset via email
- 🛍️ **Product Catalog** — Browse, filter, and search products by category
- 📄 **Product Detail Pages** — Rich product info with image gallery
- 🛒 **Cart & Checkout** — Add to cart, update quantity, remove items
- ❤️ **Wishlist** — Save favourite products
- 💳 **Razorpay Payment Integration** — Secure online payments
- 📦 **Order Tracking** — View order history and status updates
- 🧾 **Invoice Generation** — PDF invoices via PDFKit
- 🤖 **AI Chatbot** — Groq-powered pet assistant
- 📝 **Blog Section** — Pet care tips and articles
- 👤 **User Profile** — Manage account details and view orders
- 🛠️ **Admin Dashboard** — Manage products, users, and orders
- 📧 **Email Notifications** — Using Nodemailer

---

## 🗂️ Project Structure

```
petify/
├── frontend/
│   ├── index.html            # Home page
│   ├── products.html         # Product listing
│   ├── product-detail.html   # Single product page
│   ├── checkout.html         # Checkout page
│   ├── login.html            # Login / Signup
│   ├── profile.html          # User profile & orders
│   ├── admin.html            # Admin dashboard
│   ├── blog.html             # Blog section
│   ├── about.html            # About page
│   ├── order-success.html    # Order confirmation
│   ├── css/                  # Stylesheets
│   ├── js/                   # Frontend JavaScript
│   ├── images/               # Image assets
│   └── assets/               # Other static assets
│
└── backend/
    ├── server.js             # Express server entry point
    ├── seed.js               # Database seeder
    ├── .env                  # Environment variables
    ├── models/
    │   ├── User.js
    │   ├── Product.js
    │   └── Order.js
    ├── routes/
    │   ├── auth.js
    │   ├── products.js
    │   ├── cart.js
    │   ├── orders.js
    │   ├── payment.js
    │   ├── wishlist.js
    │   ├── invoice.js
    │   └── chatbot.js
    └── middleware/
        └── auth.js           # JWT authentication middleware
```

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | HTML5, CSS3, JavaScript (Vanilla)   |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB, Mongoose                   |
| Auth       | JWT, bcryptjs                       |
| Payments   | Razorpay                            |
| AI Chatbot | Groq SDK                            |
| Email      | Nodemailer                          |
| PDF        | PDFKit                              |

---

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- A [Razorpay](https://razorpay.com/) account (for payments)
- A [Groq](https://groq.com/) API key (for chatbot)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/petify.git
   cd petify
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   GROQ_API_KEY=your_groq_api_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   ```

4. **Seed the database** *(optional)*
   ```bash
   npm run seed
   ```

5. **Start the backend server**
   ```bash
   npm run dev
   ```

6. **Open the frontend**

   Open `frontend/index.html` in your browser, or serve it with a static file server like [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).

---

## 🔑 Admin Access

To grant admin privileges to a user, run:
```bash
node make-admin.js
```

Then log into the platform and navigate to `/admin.html`.

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 🙌 Acknowledgements

- [Express.js](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)
- [Razorpay](https://razorpay.com/)
- [Groq](https://groq.com/)
- [PDFKit](https://pdfkit.org/)
