<div align="center">

# 🐾 Petify — Premium Pet E-Commerce Platform

**A full-stack e-commerce web application for pet lovers.**  
Buy premium pet food, accessories, toys, and more — all in one place.

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

</div>

---

## 📌 Overview

**Petify** is a feature-rich online pet store built with a **Vanilla HTML/CSS/JavaScript** frontend and a **Node.js + Express + MongoDB** backend. It supports user authentication, product browsing, cart & wishlist management, Razorpay payment integration, order tracking, AI-powered chatbot, invoice generation, and a secure admin dashboard.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **User Authentication** | Signup, login, JWT sessions, password reset via email |
| 🛍️ **Product Catalog** | Browse, filter, and search 105+ products by category |
| 📄 **Product Detail Pages** | Rich product info with image gallery and reviews |
| 🛒 **Cart & Checkout** | Add to cart, update quantity, coupon codes, COD / Razorpay |
| ❤️ **Wishlist** | Save favourite products to your profile |
| 💳 **Razorpay Integration** | Secure online payments with HMAC signature verification |
| 📦 **Order Tracking** | View order history and live status updates |
| 🧾 **Invoice Generation** | PDF invoices generated via PDFKit, emailed via Nodemailer |
| 🤖 **AI Chatbot (Pawsy)** | Groq-powered (LLaMA) multilingual pet care assistant |
| 📍 **Location Autofill** | Auto-fill checkout address using browser geolocation |
| 🗺️ **Google Maps Link** | View delivery address on Google Maps live as you type |
| 📝 **Blog Section** | Pet care tips and articles |
| 👤 **User Profile** | Manage account details, saved addresses, and orders |
| 🔧 **Admin Dashboard** | Manage products, users, and orders |
| 📧 **Email Notifications** | Order confirmations and password reset via Nodemailer |

---

## 🗂️ Project Structure

```
petify/
├── frontend/
│   ├── index.html              # Home page
│   ├── products.html           # Product listing
│   ├── product-detail.html     # Single product page
│   ├── checkout.html           # Checkout page
│   ├── login.html              # Login / Signup
│   ├── profile.html            # User profile & orders
│   ├── admin.html              # Admin dashboard
│   ├── blog.html               # Blog section
│   ├── about.html              # About page
│   ├── order-success.html      # Order confirmation
│   ├── 404.html                # Not found page
│   ├── css/                    # Stylesheets
│   ├── js/                     # Frontend JavaScript
│   │   ├── api.js              # Centralised API calls
│   │   ├── auth.js             # Auth state management
│   │   ├── cart.js             # CartManager class
│   │   ├── main.js             # Navbar, cursor, UI
│   │   └── chatbot.js          # Chat widget
│   └── images/                 # Product image assets
│
└── backend/
    ├── server.js               # Express server entry point
    ├── seed.js                 # Database seeder (105 products)
    ├── .env                    # Environment variables (not committed)
    ├── models/
    │   ├── User.js
    │   ├── Product.js
    │   ├── Order.js
    │   └── Review.js
    ├── routes/
    │   ├── auth.js
    │   ├── products.js
    │   ├── cart.js
    │   ├── orders.js
    │   ├── wishlist.js
    │   ├── payment.js
    │   ├── invoice.js
    │   ├── chatbot.js
    │   ├── reviews.js
    │   └── admin.js
    └── middleware/
        └── auth.js             # JWT authentication middleware
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Auth** | JWT, bcryptjs |
| **Payments** | Razorpay |
| **AI Chatbot** | Groq SDK (LLaMA 3.3 70B) |
| **Email** | Nodemailer (Gmail SMTP) |
| **PDF** | PDFKit |
| **File Upload** | Multer |
| **Security** | Helmet, express-rate-limit |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- A [Razorpay](https://razorpay.com/) account (for payments)
- A [Groq](https://groq.com/) API key (for chatbot)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/mohitshekhawat01/Petify.git
cd Petify
```

**2. Install backend dependencies**
```bash
cd backend
npm install
```

**3. Configure environment variables**

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=http://localhost:5500
GROQ_API_KEY=your_groq_api_key
```

**4. Seed the database**
```bash
npm run seed
```

**5. Start the backend server**
```bash
npm run dev
```

**6. Open the frontend**

Open `frontend/index.html` using [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in VS Code (port 5500).

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `RAZORPAY_KEY_ID` | Razorpay public key |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key |
| `EMAIL_USER` | Gmail address for sending emails |
| `EMAIL_PASS` | Gmail App Password |
| `FRONTEND_URL` | Frontend base URL (for reset links) |
| `GROQ_API_KEY` | Groq API key for AI chatbot |

---

## 👤 Author

**Mohit Singh**  
Full-Stack Developer

---

<div align="center">Made with love for pets everywhere 🐾</div>