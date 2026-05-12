# Mobile Shop - Complete API Testing Guide

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-backend-url.com/api
```

---

## 📋 Table of Contents
1. [Authentication Routes](#authentication-routes)
2. [Product Routes](#product-routes)
3. [Cart Routes](#cart-routes)
4. [Order Routes](#order-routes)
5. [Payment Routes](#payment-routes)
6. [Review Routes](#review-routes)
7. [Wishlist Routes](#wishlist-routes)
8. [Coupon Routes](#coupon-routes)
9. [Common Headers](#common-headers)
10. [Environment Variables](#environment-variables)

---

## 🔐 Authentication Routes

### 1. Register New User
**POST** `/auth/register`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "phone": "9876543210"
}
```

**Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "buyer"
  }
}
```

---

### 2. Login
**POST** `/auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer"
  }
}
```

---

### 3. Get Current User Profile
**GET** `/auth/me`

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "buyer",
    "addresses": []
  }
}
```

---

### 4. Update Profile
**PUT** `/auth/me`

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "name": "John Updated",
  "phone": "9999999999"
}
```

---

### 5. Change Password
**PUT** `/auth/me/password`

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword456!"
}
```

---

## 📦 Product Routes

### 1. Get All Products (with filters)
**GET** `/products`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 12)
- `category` (string: cases, chargers, cables, etc.)
- `search` (string)
- `minPrice` (number)
- `maxPrice` (number)
- `sort` (string: price-asc, price-desc, newest, rating)

**Example:**
```
GET /products?category=cases&minPrice=100&maxPrice=1000&sort=price-asc&page=1&limit=12
```

**Response (200):**
```json
{
  "success": true,
  "products": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "iPhone 15 Silicone Case",
      "slug": "iphone-15-silicone-case",
      "description": "Premium silicone case...",
      "category": "cases",
      "brand": "Apple",
      "price": 2999,
      "discountPrice": 2499,
      "images": [
        {
          "url": "https://res.cloudinary.com/...",
          "publicId": "products/..."
        }
      ],
      "stock": 50,
      "ratings": {
        "average": 4.5,
        "count": 120
      },
      "isFeatured": true,
      "isActive": true
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalProducts": 60,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 2. Get Featured Products
**GET** `/products/featured?limit=8`

---

### 3. Get Product by Slug
**GET** `/products/:slug`

**Example:**
```
GET /products/iphone-15-silicone-case
```

**Response (200):**
```json
{
  "success": true,
  "product": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "iPhone 15 Silicone Case",
    "slug": "iphone-15-silicone-case",
    "description": "Premium silicone case with MagSafe...",
    "category": "cases",
    "brand": "Apple",
    "price": 2999,
    "discountPrice": 2499,
    "images": [...],
    "stock": 50,
    "sku": "CASE-IP15-BLK-001",
    "ratings": {
      "average": 4.5,
      "count": 120
    },
    "tags": ["magsafe", "wireless-charging"],
    "compatibility": ["iPhone 15", "iPhone 15 Plus"],
    "isFeatured": true,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 4. Get Related Products
**GET** `/products/:slug/related`

**Example:**
```
GET /products/iphone-15-silicone-case/related
```

---

### 5. Create Product (Admin Only)
**POST** `/products`

**Headers:**
```json
{
  "Authorization": "Bearer ADMIN_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "name": "Samsung Galaxy S24 Case",
  "description": "Durable protective case",
  "category": "cases",
  "brand": "Samsung",
  "price": 1999,
  "discountPrice": 1499,
  "stock": 100,
  "sku": "CASE-S24-BLK-001",
  "tags": ["protective", "slim"],
  "compatibility": ["Samsung Galaxy S24"],
  "isFeatured": false
}
```

---

### 6. Update Product (Admin Only)
**PUT** `/products/:id`

**Headers:**
```json
{
  "Authorization": "Bearer ADMIN_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

**Body:** (same as create, partial updates allowed)

---

### 7. Delete Product (Admin Only)
**DELETE** `/products/:id`

**Headers:**
```json
{
  "Authorization": "Bearer ADMIN_JWT_TOKEN"
}
```

---

### 8. Upload Product Images (Admin Only)
**POST** `/products/:id/images`

**Headers:**
```json
{
  "Authorization": "Bearer ADMIN_JWT_TOKEN",
  "Content-Type": "multipart/form-data"
}
```

**Body (Form Data):**
- `images`: File[] (multiple files)

---

## 🛒 Cart Routes

### 1. Get Cart
**GET** `/cart`

**Note:** Cart is stored in localStorage on frontend. Backend cart routes may be used for logged-in users.

---

## 📦 Order Routes

### 1. Create Order
**POST** `/orders`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "buyer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210"
  },
  "items": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "quantity": 2
    }
  ],
  "deliveryAddress": {
    "fullName": "John Doe",
    "phone": "9876543210",
    "addressLine1": "123 Main Street",
    "addressLine2": "Apt 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "payment": {
    "mode": "gateway",
    "razorpayOrderId": "order_xyz123",
    "razorpayPaymentId": "pay_abc456",
    "razorpaySignature": "signature_hash"
  },
  "couponCode": "SAVE10"
}
```

**Response (201):**
```json
{
  "success": true,
  "order": {
    "_id": "507f1f77bcf86cd799439011",
    "orderId": "ORD-20260511-0042",
    "buyer": {...},
    "items": [...],
    "deliveryAddress": {...},
    "pricing": {
      "subtotal": 5998,
      "shippingCharge": 0,
      "discount": 600,
      "total": 5398
    },
    "payment": {
      "mode": "gateway",
      "status": "verified",
      "amount": 5398
    },
    "status": "confirmed",
    "createdAt": "2026-05-11T10:30:00.000Z"
  }
}
```

---

### 2. Get Order by ID
**GET** `/orders/:orderId`

**Example:**
```
GET /orders/ORD-20260511-0042
```

**Response (200):**
```json
{
  "success": true,
  "order": {
    "orderId": "ORD-20260511-0042",
    "buyer": {...},
    "items": [...],
    "deliveryAddress": {...},
    "pricing": {...},
    "payment": {...},
    "status": "confirmed",
    "createdAt": "2026-05-11T10:30:00.000Z"
  }
}
```

---

### 3. Get My Orders (Logged-in User)
**GET** `/orders/my-orders`

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

**Response (200):**
```json
{
  "success": true,
  "orders": [
    {
      "orderId": "ORD-20260511-0042",
      "items": [...],
      "total": 5398,
      "status": "confirmed",
      "createdAt": "2026-05-11T10:30:00.000Z"
    }
  ]
}
```

---

### 4. Get All Orders (Admin Only)
**GET** `/orders?page=1&limit=20&status=confirmed`

**Headers:**
```json
{
  "Authorization": "Bearer ADMIN_JWT_TOKEN"
}
```

**Query Parameters:**
- `page` (number)
- `limit` (number)
- `status` (string: payment_pending, confirmed, processing, shipped, delivered, cancelled)

---

### 5. Verify Manual UPI Payment (Admin Only)
**PUT** `/orders/:id/verify-payment`

**Headers:**
```json
{
  "Authorization": "Bearer ADMIN_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "verified": true
}
```

---

### 6. Update Order Status (Admin Only)
**PUT** `/orders/:id/status`

**Headers:**
```json
{
  "Authorization": "Bearer ADMIN_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "status": "shipped",
  "trackingNumber": "TRACK123456"
}
```

---

## 💳 Payment Routes

### 1. Create Razorpay Order
**POST** `/payment/gateway/create-order`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "amount": 5398,
  "currency": "INR",
  "items": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "quantity": 2
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "razorpayOrderId": "order_xyz123",
  "amount": 539800,
  "currency": "INR",
  "keyId": "rzp_test_XXXXXXXX"
}
```

---

### 2. Verify Razorpay Payment
**POST** `/payment/gateway/verify`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "razorpayOrderId": "order_xyz123",
  "razorpayPaymentId": "pay_abc456",
  "razorpaySignature": "signature_hash",
  "cartData": [...],
  "deliveryAddress": {...},
  "buyerInfo": {...}
}
```

---

### 3. Razorpay Webhook
**POST** `/payment/gateway/webhook`

**Headers:**
```json
{
  "X-Razorpay-Signature": "webhook_signature",
  "Content-Type": "application/json"
}
```

**Body:** (Sent by Razorpay)

---

### 4. Submit Manual UPI Payment
**POST** `/payment/manual/confirm`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "utrNumber": "123456789012",
  "upiMethod": "phonepe",
  "cartData": [...],
  "deliveryAddress": {...},
  "buyerInfo": {...}
}
```

---

## ⭐ Review Routes

### 1. Submit Review
**POST** `/reviews/:productId`

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "rating": 5,
  "title": "Excellent product!",
  "comment": "Very good quality and fast delivery."
}
```

---

### 2. Get Product Reviews
**GET** `/reviews/:productId`

**Response (200):**
```json
{
  "success": true,
  "reviews": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": {
        "name": "John Doe"
      },
      "rating": 5,
      "title": "Excellent product!",
      "comment": "Very good quality...",
      "isVerifiedPurchase": true,
      "createdAt": "2026-05-11T10:30:00.000Z"
    }
  ]
}
```

---

### 3. Delete Review (Admin/Owner)
**DELETE** `/reviews/:id`

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

---

## ❤️ Wishlist Routes

### 1. Get Wishlist
**GET** `/wishlist`

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

---

### 2. Add to Wishlist
**POST** `/wishlist`

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "productId": "507f1f77bcf86cd799439011"
}
```

---

### 3. Remove from Wishlist
**DELETE** `/wishlist/:productId`

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

---

## 🎟️ Coupon Routes

### 1. Get All Coupons (Admin)
**GET** `/coupons`

**Headers:**
```json
{
  "Authorization": "Bearer ADMIN_JWT_TOKEN"
}
```

---

### 2. Validate Coupon (Public)
**POST** `/coupons/validate`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "code": "SAVE10",
  "cartTotal": 5000
}
```

**Response (200):**
```json
{
  "success": true,
  "coupon": {
    "code": "SAVE10",
    "discountType": "percentage",
    "discountValue": 10,
    "maxDiscount": 500
  },
  "discountAmount": 500
}
```

---

### 3. Create Coupon (Admin)
**POST** `/coupons`

**Headers:**
```json
{
  "Authorization": "Bearer ADMIN_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "code": "SAVE10",
  "description": "10% off on all products",
  "discountType": "percentage",
  "discountValue": 10,
  "maxDiscount": 500,
  "minOrderAmount": 1000,
  "maxUses": 100,
  "validFrom": "2026-05-01T00:00:00.000Z",
  "validUntil": "2026-05-31T23:59:59.000Z",
  "isActive": true
}
```

---

### 4. Update Coupon (Admin)
**PUT** `/coupons/:id`

---

### 5. Delete Coupon (Admin)
**DELETE** `/coupons/:id`

---

## 📋 Common Headers

### For Public Routes:
```json
{
  "Content-Type": "application/json"
}
```

### For Protected Routes (Logged-in User):
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

### For Admin Routes:
```json
{
  "Authorization": "Bearer ADMIN_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

---

## 🔑 Environment Variables for Testing

### Postman/Thunder Client Environment:
```json
{
  "baseUrl": "http://localhost:5000/api",
  "token": "",
  "adminToken": "",
  "productId": "",
  "orderId": ""
}
```

### Usage in Requests:
- URL: `{{baseUrl}}/products`
- Header: `Authorization: Bearer {{token}}`

---

## 🧪 Testing Workflow

### 1. Authentication Flow:
1. Register a new user → Save token
2. Login with credentials → Save token
3. Get user profile with token
4. Update profile
5. Change password

### 2. Product Flow:
1. Get all products (public)
2. Get product by slug (public)
3. Get featured products (public)
4. Admin: Create product
5. Admin: Upload images
6. Admin: Update product

### 3. Shopping Flow:
1. Browse products
2. Add to cart (frontend)
3. Apply coupon
4. Create Razorpay order
5. Verify payment
6. Create order
7. Track order

### 4. Admin Flow:
1. Login as admin
2. View all orders
3. Verify manual UPI payments
4. Update order status
5. Manage products
6. Manage coupons

---

## 📊 Sample Test Data

### Admin Credentials:
```json
{
  "email": "admin@mobileshop.com",
  "password": "Admin@123"
}
```

### Test Buyer:
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Test@123",
  "phone": "9876543210"
}
```

### Test Product:
```json
{
  "name": "Test iPhone Case",
  "category": "cases",
  "price": 999,
  "stock": 50
}
```

### Test Coupon:
```json
{
  "code": "TEST10",
  "discountType": "percentage",
  "discountValue": 10
}
```

---

## 🚨 Error Responses

### 400 Bad Request:
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized:
```json
{
  "success": false,
  "message": "Not authorized, token missing or invalid"
}
```

### 403 Forbidden:
```json
{
  "success": false,
  "message": "Access denied. Admin only."
}
```

### 404 Not Found:
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Server Error:
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details..."
}
```

---

## 📥 Postman Collection Import

You can create a Postman collection with all these endpoints. Here's the structure:

```
Mobile Shop API
├── Auth
│   ├── Register
│   ├── Login
│   ├── Get Profile
│   ├── Update Profile
│   └── Change Password
├── Products
│   ├── Get All Products
│   ├── Get Featured Products
│   ├── Get Product by Slug
│   ├── Get Related Products
│   ├── Create Product (Admin)
│   ├── Update Product (Admin)
│   ├── Delete Product (Admin)
│   └── Upload Images (Admin)
├── Orders
│   ├── Create Order
│   ├── Get Order by ID
│   ├── Get My Orders
│   ├── Get All Orders (Admin)
│   ├── Verify Payment (Admin)
│   └── Update Status (Admin)
├── Payment
│   ├── Create Razorpay Order
│   ├── Verify Payment
│   └── Manual UPI Confirm
├── Reviews
│   ├── Submit Review
│   ├── Get Reviews
│   └── Delete Review
├── Wishlist
│   ├── Get Wishlist
│   ├── Add to Wishlist
│   └── Remove from Wishlist
└── Coupons
    ├── Get All Coupons (Admin)
    ├── Validate Coupon
    ├── Create Coupon (Admin)
    ├── Update Coupon (Admin)
    └── Delete Coupon (Admin)
```

---

**Happy Testing! 🚀**