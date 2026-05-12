# 🚀 Deployment Guide - Mobile Shop E-Commerce

Complete step-by-step guide to deploy your Mobile Shop application to production.

## 📋 Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] Environment variables documented
- [ ] Database seeded with initial data
- [ ] Admin account created
- [ ] Payment gateway configured (test mode)
- [ ] Email service configured
- [ ] Images uploaded to Cloudinary
- [ ] Code pushed to GitHub

---

## 🗄️ Step 1: MongoDB Atlas Setup (Database)

### 1.1 Create Free Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up / Log in
3. Click **"Build a Database"**
4. Select **"M0 Free"** tier
5. Choose cloud provider and region (closest to your users)
6. Cluster name: `mobile-shop-cluster`
7. Click **"Create"**

### 1.2 Create Database User

1. Go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Authentication Method: **Password**
4. Username: `mobileshop-admin`
5. Password: Generate strong password (save it!)
6. Database User Privileges: **Read and write to any database**
7. Click **"Add User"**

### 1.3 Configure Network Access

1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
   - Or add specific IPs for production
4. Click **"Confirm"**

### 1.4 Get Connection String

1. Go to **Database** → Click **"Connect"**
2. Choose **"Connect your application"**
3. Driver: **Node.js**, Version: **5.5 or later**
4. Copy connection string:
   ```
   mongodb+srv://mobileshop-admin:<password>@mobile-shop-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name: `/mobileshop` before the `?`
   ```
   mongodb+srv://mobileshop-admin:YOUR_PASSWORD@mobile-shop-cluster.xxxxx.mongodb.net/mobileshop?retryWrites=true&w=majority
   ```

---

## 🖼️ Step 2: Cloudinary Setup (Image CDN)

### 2.1 Create Account

1. Go to [Cloudinary](https://cloudinary.com/users/register_free)
2. Sign up for free account
3. Verify email

### 2.2 Get Credentials

1. Go to **Dashboard**
2. Copy these values:
   - **Cloud Name**: `dxxxxxxxx`
   - **API Key**: `123456789012345`
   - **API Secret**: `abcdefghijklmnopqrstuvwxyz`

### 2.3 Create Upload Preset (Optional)

1. Go to **Settings** → **Upload**
2. Scroll to **Upload presets**
3. Click **"Add upload preset"**
4. Preset name: `mobile-shop-products`
5. Signing Mode: **Signed**
6. Folder: `mobile-shop/products`
7. Save

---

## 💳 Step 3: Razorpay Setup (Payment Gateway)

### 3.1 Create Account

1. Go to [Razorpay](https://dashboard.razorpay.com/signup)
2. Sign up with business details
3. Complete KYC (for live mode) - **Skip for test mode**

### 3.2 Get Test API Keys

1. Go to **Settings** → **API Keys**
2. Switch to **Test Mode** (toggle at top)
3. Click **"Generate Test Key"**
4. Copy:
   - **Key ID**: `rzp_test_XXXXXXXXXXXXXXXX`
   - **Key Secret**: `YYYYYYYYYYYYYYYYYYYYYYYY`

### 3.3 Setup Webhook (Important!)

1. Go to **Settings** → **Webhooks**
2. Click **"Create New Webhook"**
3. Webhook URL: `https://your-backend-url.onrender.com/api/payment/gateway/webhook`
   - (You'll update this after deploying backend)
4. Active Events: Select **"payment.captured"** and **"payment.failed"**
5. Secret: Generate a random string (save it as `RAZORPAY_WEBHOOK_SECRET`)
6. Click **"Create Webhook"**

---

## 📧 Step 4: Gmail SMTP Setup (Email Notifications)

### 4.1 Enable 2-Factor Authentication

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**

### 4.2 Generate App Password

1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select app: **Mail**
3. Select device: **Other (Custom name)**
4. Name: `Mobile Shop Backend`
5. Click **"Generate"**
6. Copy the 16-digit password (format: `xxxx xxxx xxxx xxxx`)
7. Remove spaces: `xxxxxxxxxxxxxxxx`

---

## 🌐 Step 5: Deploy Backend (Render)

### 5.1 Push Code to GitHub

```bash
cd mobile-shop
git init
git add .
git commit -m "Initial commit - Mobile Shop E-Commerce"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mobile-shop.git
git push -u origin main
```

### 5.2 Create Render Account

1. Go to [Render](https://render.com)
2. Sign up with GitHub

### 5.3 Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `mobile-shop-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### 5.4 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add all these variables:

```
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://mobileshop-admin:YOUR_PASSWORD@cluster.mongodb.net/mobileshop
JWT_SECRET=your_32_char_random_string_here
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
SHOP_UPI_ID=yourshop@paytm
SHOP_UPI_NAME=MobileShop
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourshop@gmail.com
SMTP_PASS=your_16_digit_app_password
ADMIN_EMAIL=admin@mobileshop.com
FRONTEND_URL=https://your-app.vercel.app
```

### 5.5 Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Copy your backend URL: `https://mobile-shop-backend.onrender.com`

### 5.6 Update Razorpay Webhook

1. Go back to Razorpay Dashboard → Webhooks
2. Edit your webhook
3. Update URL to: `https://mobile-shop-backend.onrender.com/api/payment/gateway/webhook`
4. Save

### 5.7 Seed Admin User

1. In Render dashboard, go to **"Shell"** tab
2. Run: `npm run seed`
3. Verify admin user created

---

## 🎨 Step 6: Deploy Frontend (Vercel)

### 6.1 Create Vercel Account

1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub

### 6.2 Import Project

1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 6.3 Add Environment Variables

Click **"Environment Variables"**

Add these:

```
VITE_API_URL=https://mobile-shop-backend.onrender.com/api
VITE_SHOP_NAME=MobileShop
VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
```

### 6.4 Deploy

1. Click **"Deploy"**
2. Wait for deployment (2-3 minutes)
3. Copy your frontend URL: `https://mobile-shop-xxxxx.vercel.app`

### 6.5 Update Backend CORS

1. Go back to Render dashboard
2. Update `FRONTEND_URL` environment variable to your Vercel URL
3. Service will auto-redeploy

---

## ✅ Step 7: Post-Deployment Verification

### 7.1 Test Backend

Visit: `https://mobile-shop-backend.onrender.com/api/health`

Should return:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### 7.2 Test Frontend

1. Visit your Vercel URL
2. Homepage should load with products
3. Try browsing products
4. Test search functionality

### 7.3 Test Admin Panel

1. Go to: `https://your-app.vercel.app/admin`
2. Login with:
   - Email: `admin@mobileshop.com`
   - Password: `Admin@123`
3. Verify dashboard loads
4. Try adding a product with image upload

### 7.4 Test Payment Flow

1. Add product to cart
2. Go to checkout
3. Try Razorpay test payment:
   - Card: `4111 1111 1111 1111`
   - CVV: `123`
   - Expiry: Any future date
4. Verify order created

### 7.5 Test Manual UPI

1. Add product to cart
2. Choose Manual UPI payment
3. Submit test UTR: `123456789012`
4. Login as admin
5. Verify payment manually

---

## 🔧 Step 8: Custom Domain (Optional)

### 8.1 Frontend Domain (Vercel)

1. Go to Vercel project → **Settings** → **Domains**
2. Add your domain: `www.mobileshop.com`
3. Follow DNS configuration instructions
4. Wait for SSL certificate (automatic)

### 8.2 Backend Domain (Render)

1. Go to Render service → **Settings** → **Custom Domain**
2. Add your API subdomain: `api.mobileshop.com`
3. Follow DNS configuration instructions
4. Update `VITE_API_URL` in Vercel to new domain

---

## 📊 Step 9: Monitoring & Maintenance

### 9.1 Setup Uptime Monitoring

1. Go to [UptimeRobot](https://uptimerobot.com) (free)
2. Add monitors for:
   - Frontend: `https://your-app.vercel.app`
   - Backend: `https://mobile-shop-backend.onrender.com/api/health`
3. Get email alerts if site goes down

### 9.2 Check Logs

**Render Logs:**
- Go to service → **Logs** tab
- Monitor for errors

**Vercel Logs:**
- Go to project → **Deployments** → Click deployment → **Logs**

### 9.3 Database Backups

1. MongoDB Atlas → **Clusters** → **Backup**
2. Enable **Cloud Backup** (paid feature)
3. Or manually export data periodically

---

## 🚨 Troubleshooting

### Backend Not Starting

1. Check Render logs for errors
2. Verify all environment variables are set
3. Check MongoDB connection string
4. Ensure `npm start` script exists in `package.json`

### Frontend Not Loading

1. Check Vercel deployment logs
2. Verify `VITE_API_URL` is correct
3. Check browser console for errors
4. Ensure CORS is configured correctly

### Payment Not Working

1. Verify Razorpay keys are correct
2. Check webhook URL is correct
3. Test with Razorpay test cards
4. Check backend logs for payment errors

### Images Not Uploading

1. Verify Cloudinary credentials
2. Check file size limits
3. Ensure multer middleware is configured
4. Check browser network tab for upload errors

---

## 📝 Production Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Database connected and seeded
- [ ] Admin login working
- [ ] Product CRUD working
- [ ] Image upload working
- [ ] Razorpay payment working
- [ ] Manual UPI payment working
- [ ] Order creation working
- [ ] Email notifications working
- [ ] Webhook configured
- [ ] CORS configured
- [ ] SSL certificates active
- [ ] Monitoring setup
- [ ] Custom domain configured (optional)

---

## 🎉 Congratulations!

Your Mobile Shop E-Commerce application is now live in production!

**Next Steps:**
1. Add real products with images
2. Test all features thoroughly
3. Share with users
4. Monitor performance
5. Collect feedback
6. Iterate and improve

---

**Need Help?**
- Check logs in Render/Vercel dashboards
- Review MongoDB Atlas metrics
- Test API endpoints with Postman
- Check browser console for frontend errors

**Made with ❤️ by Bob**