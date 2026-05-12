# 📦 GitHub Setup Guide - Mobile Shop E-Commerce

Step-by-step guide to push your Mobile Shop project to GitHub.

---

## 🎯 Prerequisites

- Git installed on your computer
- GitHub account created
- Project code ready in `mobile-shop` folder

---

## 📝 Step 1: Verify Git Installation

Open terminal/command prompt and run:

```bash
git --version
```

If not installed, download from: https://git-scm.com/downloads

---

## 🔧 Step 2: Configure Git (First Time Only)

Set your name and email:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Verify configuration:

```bash
git config --list
```

---

## 🌐 Step 3: Create GitHub Repository

### Option A: Via GitHub Website

1. Go to [GitHub](https://github.com)
2. Click **"+"** (top right) → **"New repository"**
3. Repository name: `mobile-shop-ecommerce`
4. Description: `Full-stack e-commerce web app for mobile accessories with dual payment modes`
5. Visibility: **Public** (or Private if you prefer)
6. **DO NOT** check "Initialize with README" (we already have one)
7. Click **"Create repository"**

### Option B: Via GitHub CLI (if installed)

```bash
gh repo create mobile-shop-ecommerce --public --source=. --remote=origin
```

---

## 📂 Step 4: Initialize Git in Your Project

Open terminal in your project folder:

```bash
# Navigate to project folder
cd C:\Users\MdAaquibAlam\Desktop\mobile-shop

# Initialize Git repository
git init

# Check status
git status
```

---

## 🚫 Step 5: Verify .gitignore

Make sure `.gitignore` file exists and contains:

```
# Dependencies
node_modules/
*/node_modules/

# Environment variables
.env
.env.local
*.env

# Build outputs
dist/
build/
*/dist/
*/build/

# Logs
logs/
*.log

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
```

This prevents sensitive files from being uploaded to GitHub.

---

## ➕ Step 6: Stage All Files

Add all files to Git:

```bash
# Add all files
git add .

# Check what will be committed
git status
```

You should see files in green (staged for commit).

**Important:** Verify that `.env` files are NOT listed (they should be ignored).

---

## 💾 Step 7: Create First Commit

```bash
git commit -m "Initial commit: Mobile Shop E-Commerce Application

- Full-stack e-commerce platform for mobile accessories
- React + Vite frontend with Tailwind CSS
- Node.js + Express backend with MongoDB
- Dual payment modes: Razorpay Gateway + Manual UPI
- Admin panel for product and order management
- Features: Cart, Wishlist, Reviews, Coupons, Email notifications
- Security: JWT auth, bcrypt, helmet, rate limiting
- Image CDN: Cloudinary integration
- SEO optimized with React Helmet
- Fully responsive design"
```

---

## 🔗 Step 8: Connect to GitHub Repository

Replace `YOUR_USERNAME` with your actual GitHub username:

```bash
# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/mobile-shop-ecommerce.git

# Verify remote
git remote -v
```

You should see:
```
origin  https://github.com/YOUR_USERNAME/mobile-shop-ecommerce.git (fetch)
origin  https://github.com/YOUR_USERNAME/mobile-shop-ecommerce.git (push)
```

---

## 🚀 Step 9: Push to GitHub

```bash
# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**If prompted for credentials:**
- Username: Your GitHub username
- Password: Use **Personal Access Token** (not your GitHub password)

### How to Create Personal Access Token:

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Note: `Mobile Shop Git Access`
4. Expiration: 90 days (or No expiration)
5. Select scopes: ✅ **repo** (all)
6. Click **"Generate token"**
7. **Copy the token** (you won't see it again!)
8. Use this token as password when pushing

---

## ✅ Step 10: Verify Upload

1. Go to your GitHub repository: `https://github.com/YOUR_USERNAME/mobile-shop-ecommerce`
2. You should see all your files
3. Verify `.env` files are NOT visible (they should be ignored)
4. Check that `README.md` is displayed on the main page

---

## 📋 Step 11: Add Repository Description & Topics

On GitHub repository page:

1. Click **⚙️ Settings** (top right)
2. Add description:
   ```
   Full-stack e-commerce web application for mobile accessories with dual payment modes (Razorpay + Manual UPI), admin panel, and comprehensive features
   ```
3. Add topics (tags):
   ```
   ecommerce, react, nodejs, mongodb, express, tailwind-css, razorpay, 
   payment-gateway, admin-panel, cloudinary, jwt-authentication, 
   mobile-accessories, shopping-cart, wishlist, full-stack
   ```
4. Save changes

---

## 🔄 Future Updates: How to Push Changes

After making changes to your code:

```bash
# Check what changed
git status

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "Add feature: Product image gallery"

# Push to GitHub
git push
```

---

## 🌿 Working with Branches (Optional)

Create feature branches for new features:

```bash
# Create and switch to new branch
git checkout -b feature/payment-integration

# Make changes, commit
git add .
git commit -m "Implement Razorpay payment integration"

# Push branch to GitHub
git push -u origin feature/payment-integration

# Switch back to main
git checkout main

# Merge feature branch
git merge feature/payment-integration

# Push updated main
git push
```

---

## 🔐 Security Best Practices

### ✅ DO:
- ✅ Keep `.env` files in `.gitignore`
- ✅ Use environment variables for secrets
- ✅ Commit `.env.example` with placeholder values
- ✅ Use Personal Access Tokens for authentication
- ✅ Review files before committing (`git status`)

### ❌ DON'T:
- ❌ Never commit `.env` files
- ❌ Never commit API keys or passwords
- ❌ Never commit `node_modules/`
- ❌ Never commit build files (`dist/`, `build/`)
- ❌ Never use your GitHub password for Git operations

---

## 🚨 Emergency: Remove Sensitive File from Git

If you accidentally committed a sensitive file:

```bash
# Remove file from Git (keeps local copy)
git rm --cached server/.env

# Commit the removal
git commit -m "Remove .env file from Git"

# Push changes
git push

# Add to .gitignore if not already there
echo "server/.env" >> .gitignore
git add .gitignore
git commit -m "Update .gitignore"
git push
```

**Important:** If secrets were already pushed, consider them compromised:
1. Rotate all API keys and passwords
2. Update environment variables in deployment platforms
3. Use `git filter-branch` or BFG Repo-Cleaner to remove from history (advanced)

---

## 📊 Repository Statistics

After pushing, your repository will show:

- **Languages**: JavaScript, CSS, HTML
- **Framework**: React, Node.js
- **Lines of Code**: ~15,000+
- **Files**: ~100+
- **Commits**: 1 (initially)

---

## 🎉 Success Checklist

- [ ] Git initialized in project folder
- [ ] `.gitignore` file present and correct
- [ ] All files staged and committed
- [ ] Remote repository connected
- [ ] Code pushed to GitHub successfully
- [ ] `.env` files NOT visible on GitHub
- [ ] README.md displays correctly
- [ ] Repository description and topics added
- [ ] Personal Access Token saved securely

---

## 🔗 Useful Git Commands

```bash
# Check current status
git status

# View commit history
git log --oneline

# View remote repositories
git remote -v

# Pull latest changes from GitHub
git pull

# Clone repository to another location
git clone https://github.com/YOUR_USERNAME/mobile-shop-ecommerce.git

# Discard local changes
git checkout -- filename.js

# Undo last commit (keep changes)
git reset --soft HEAD~1

# View differences
git diff
```

---

## 📚 Next Steps

1. ✅ Code pushed to GitHub
2. 🚀 Deploy to production (see `DEPLOYMENT.md`)
3. 📝 Add GitHub Actions for CI/CD (optional)
4. 🔒 Enable branch protection rules (optional)
5. 📊 Add badges to README (build status, license, etc.)

---

## 🆘 Troubleshooting

### Error: "fatal: not a git repository"
```bash
# Make sure you're in the right folder
cd mobile-shop
git init
```

### Error: "remote origin already exists"
```bash
# Remove existing remote
git remote remove origin
# Add new remote
git remote add origin https://github.com/YOUR_USERNAME/mobile-shop-ecommerce.git
```

### Error: "failed to push some refs"
```bash
# Pull first, then push
git pull origin main --rebase
git push
```

### Error: "Permission denied (publickey)"
```bash
# Use HTTPS instead of SSH
git remote set-url origin https://github.com/YOUR_USERNAME/mobile-shop-ecommerce.git
```

---

## 📞 Need Help?

- Git Documentation: https://git-scm.com/doc
- GitHub Guides: https://guides.github.com
- Git Cheat Sheet: https://education.github.com/git-cheat-sheet-education.pdf

---

**Made with ❤️ by Bob**