# 🛒 Mobile Accessories E-Commerce Store

A full-stack e-commerce web application for selling mobile accessories with dual payment modes (Razorpay Gateway + Manual UPI), role-based access control, and comprehensive admin panel.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.x-blue.svg)

## 🌟 Features

### Customer Features
- 🛍️ **Product Browsing** - Browse products by category, search, filter, and sort
- 🛒 **Shopping Cart** - Add/remove items, update quantities, persistent cart
- ❤️ **Wishlist** - Save favorite products for later
- 💳 **Dual Payment Modes**:
  - **Razorpay Gateway** - Instant payment with UPI, cards, net banking, wallets
  - **Manual UPI** - Pay via PhonePe/Google Pay/Paytm with UTR verification
- 📦 **Order Tracking** - Track order status from payment to delivery
- ⭐ **Product Reviews** - Rate and review purchased products
- 🎟️ **Coupon Codes** - Apply discount coupons at checkout
- 👤 **Guest Checkout** - Shop without creating an account
- 📱 **Responsive Design** - Fully mobile-optimized

### Admin Features
- 📊 **Dashboard** - Real-time stats, revenue, orders overview
- 📦 **Product Management** - Add, edit, delete products with image upload
- 🖼️ **Image Upload** - Multiple product images via Cloudinary CDN
- 📋 **Order Management** - View, update order status, verify payments
- 💰 **Payment Verification** - Manually verify UPI payments with UTR
- 🎟️ **Coupon Management** - Create and manage discount codes
- 📈 **Analytics** - Monthly revenue, order statistics

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS 3** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **React Context API** - State management
- **React Hook Form** - Form handling
- **React Toastify** - Notifications
- **Framer Motion** - Animations
- **React Helmet Async** - SEO meta tags

### Backend
- **Node.js 20+** - Runtime environment
- **Express.js 4** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - Image CDN
- **Razorpay SDK** - Payment gateway integration
- **Nodemailer** - Email notifications
- **Winston** - Logging
- **Helmet** - Security headers
- **express-rate-limit** - API rate limiting

## 📋 Prerequisites

- Node.js 20.x or higher
- MongoDB Atlas account (free tier)
- Cloudinary account (free tier)
- Razorpay account (test mode)
- Gmail account (for SMTP)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/mobile-shop.git
cd mobile-shop
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create `.env` file in `server/` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/mobileshop

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# UPI
SHOP_UPI_ID=yourshop@upi
SHOP_UPI_NAME=MobileShop

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourshop@gmail.com
SMTP_PASS=your_16_digit_app_password

# Admin
ADMIN_EMAIL=admin@mobileshop.com

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

Seed admin user:

```bash
npm run seed
```

Start backend server:

```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../client
npm install
```

Create `.env` file in `client/` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SHOP_NAME=MobileShop
VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
```

Start frontend server:

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🔑 Default Admin Credentials

```
Email: admin@mobileshop.com
Password: Admin@123
```

## 📁 Project Structure

```
mobile-shop/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   ├── product/
│   │   │   ├── cart/
│   │   │   ├── checkout/
│   │   │   └── admin/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── pages/
│   │   │   ├── public/
│   │   │   ├── auth/
│   │   │   ├── buyer/
│   │   │   ├── checkout/
│   │   │   └── admin/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # Node.js backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── seeds/
│   ├── .env
│   ├── app.js
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## 🌐 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your GitHub repository
4. Set root directory to `client`
5. Add environment variables from `client/.env`
6. Deploy

### Backend (Render)

1. Go to [Render](https://render.com)
2. Create new Web Service
3. Connect your GitHub repository
4. Set root directory to `server`
5. Build command: `npm install`
6. Start command: `npm start`
7. Add environment variables from `server/.env`
8. Deploy

### Database (MongoDB Atlas)

1. Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create database user
3. Whitelist IP addresses (or allow from anywhere for development)
4. Get connection string and add to `MONGO_URI`

### Image CDN (Cloudinary)

1. Sign up at [Cloudinary](https://cloudinary.com)
2. Get credentials from dashboard
3. Add to environment variables

### Payment Gateway (Razorpay)

1. Sign up at [Razorpay](https://razorpay.com)
2. Use test mode for development
3. Get API keys from dashboard
4. Add to environment variables

## 📝 API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-backend.onrender.com/api
```

### Authentication Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user
- `PUT /auth/me` - Update profile
- `PUT /auth/me/password` - Change password

### Product Endpoints
- `GET /products` - List all products (with filters)
- `GET /products/featured` - Get featured products
- `GET /products/:slug` - Get single product
- `POST /products` - Create product (Admin)
- `PUT /products/:id` - Update product (Admin)
- `DELETE /products/:id` - Delete product (Admin)

### Order Endpoints
- `POST /orders` - Create new order
- `GET /orders/my-orders` - Get user orders
- `GET /orders/:orderId` - Get order by ID
- `GET /orders` - Get all orders (Admin)
- `PUT /orders/:id/verify-payment` - Verify payment (Admin)
- `PUT /orders/:id/status` - Update order status (Admin)

### Payment Endpoints
- `POST /payment/gateway/create-order` - Create Razorpay order
- `POST /payment/gateway/verify` - Verify Razorpay payment
- `POST /payment/manual/confirm` - Submit UTR for manual UPI

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## 🔒 Security Features

- JWT authentication with HTTP-only cookies
- Password hashing with bcrypt
- CORS protection
- Helmet security headers
- XSS protection
- NoSQL injection prevention
- Rate limiting on API endpoints
- Input validation and sanitization
- HMAC signature verification for payments

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Your Name**
- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)
- Email: your.email@example.com

## 🙏 Acknowledgments

- React team for the amazing library
- Tailwind CSS for the utility-first framework
- MongoDB for the flexible database
- Razorpay for payment gateway integration
- Cloudinary for image CDN

## 📞 Support

For support, email your.email@example.com or create an issue in the repository.

---

**Made with ❤️ by Bob**