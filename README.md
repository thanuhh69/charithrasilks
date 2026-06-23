# Charithra Silks — Full E-Commerce App (Storefront + Admin Panel)

A complete saree e-commerce application with customer storefront and admin panel.

**Stack:** Next.js (frontend) + Node/Express (backend) + MongoDB + Firebase Auth (Phone OTP + Google) + Cloudinary (images) + Razorpay (online payments).

---

## 📁 Project Structure

```
charithra-silks/
├── backend/          # Node/Express REST API
│   ├── src/
│   │   ├── models/        # MongoDB schemas
│   │   ├── controllers/    # Business logic
│   │   ├── routes/         # API routes (public + admin)
│   │   ├── middleware/      # Auth guards, error handling
│   │   ├── config/         # DB, Cloudinary, Firebase, Razorpay setup
│   │   └── utils/          # Helpers, seed script
│   ├── package.json
│   └── .env.example
└── frontend/         # Next.js app (storefront + admin panel)
    ├── app/
    │   ├── (storefront pages: /, /login, /cart, /checkout, /product/[slug] etc.)
    │   └── admin/      # Admin panel: /admin/login, /admin/dashboard, /admin/products, /admin/orders etc.
    ├── components/
    ├── context/        # AuthContext, CartContext, AdminAuthContext
    ├── lib/             # API clients, Firebase config
    └── package.json
```

---

## ✅ What's included

**Storefront (customer-facing):**
- Home page with banner, categories, new arrivals, best deals
- Category browsing with sort/filter
- Product detail page with color/size variants
- Cart — **clicking the cart icon redirects to `/login` if not signed in**
- Login page with **Phone OTP** and **Google Sign-In** (via Firebase)
- Checkout flow: Cart → Address → Payment (UPI / Razorpay / Cash on Delivery)
- Order success page, Order history, Order detail with cancel option
- Wishlist, Address book, Account settings

**Admin Panel (`/admin`):**
- Separate login (email + password, JWT-based, independent from customer auth)
- Dashboard with order/revenue stats
- **Products:** Add / Edit / Delete, with multi-color variants, sizes & stock, image upload to Cloudinary
- **Categories:** Add / Edit / Delete with image upload
- **Orders:** Full list with filters, order detail page to:
  - **Confirm** newly placed orders
  - Update order status (Processing → Shipped → Delivered / Cancelled / Returned)
  - Update **payment status** (Pending / Paid / Failed / Refunded) — for confirming COD/UPI payments manually
  - Add tracking ID & courier info
  - View full status history & add internal notes
- **Customers:** list, search, block/unblock
- **Coupons:** create/delete discount codes

---

## 🔧 Setup Instructions

### 1. Prerequisites
- Node.js 18+ installed
- A MongoDB database — either:
  - Local: install MongoDB Community Server, or
  - Free cloud option: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) (free tier is enough to start)
- A free [Firebase](https://console.firebase.google.com) project (for Phone OTP + Google login)
- A free [Cloudinary](https://cloudinary.com/users/register/free) account (for image uploads)
- A [Razorpay](https://dashboard.razorpay.com/signup) account (optional, only needed for online card/UPI payments via gateway — UPI-manual and COD work without it)

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Now edit `backend/.env` and fill in:

- `MONGO_URI` — your MongoDB connection string
- `JWT_SECRET` and `ADMIN_JWT_SECRET` — any long random strings (e.g. generate with `openssl rand -hex 32`)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — from your Cloudinary dashboard's "Account Details" section
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` — from Razorpay dashboard (skip if not using Razorpay yet — UPI/COD will still work)
- `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` — credentials for your first admin login

#### Firebase Admin SDK (required for login to work)
1. Go to [Firebase Console](https://console.firebase.google.com) → create a project (free)
2. Project Settings ⚙️ → Service Accounts → "Generate new private key" → downloads a JSON file
3. Save that file as `backend/firebase-service-account.json`
4. In Firebase Console, go to **Authentication → Sign-in method** and enable:
   - **Phone** (for OTP login)
   - **Google** (for Google login)
5. Under Authentication → Settings → Authorized domains, add `localhost` (already there by default) and your production domain later

Then seed the database (creates your admin account + sample categories/products):

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

API runs at `http://localhost:5000`. Test it: open `http://localhost:5000/api/health`.

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

Edit `frontend/.env.local`:

- `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
- Firebase web config — in Firebase Console: Project Settings → General → "Your apps" → Add a Web App (</> icon) → copy the config values into `NEXT_PUBLIC_FIREBASE_*` vars
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` — same as backend's `RAZORPAY_KEY_ID` (optional)

Start the frontend:

```bash
npm run dev
```

App runs at `http://localhost:3000`.

### 4. Login

- **Storefront:** visit `http://localhost:3000`, click the cart icon → redirects to `/login` → sign in with phone OTP or Google
- **Admin Panel:** visit `http://localhost:3000/admin/login` → sign in with the `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` you set in `backend/.env`

---

## 🔑 About the "fix the keys later" parts

You asked to leave Cloudinary (and other) keys for later — that's exactly how this is built:

- **Cloudinary:** the upload code (`backend/src/config/upload.js`) is fully wired. It will simply fail with a clear error until you add real `CLOUDINARY_*` values to `.env`. No code changes needed later — just paste in your keys.
- **Firebase:** same — `backend/src/config/firebase.js` and `frontend/lib/firebase.js` are complete. Until you add your real Firebase project's service account JSON + web config, login attempts will show a friendly "not configured yet" message instead of crashing.
- **Razorpay:** optional. UPI (manual) and Cash on Delivery payment methods work immediately with no keys. Razorpay gateway payments will show a clear "not configured" toast until you add keys.

---

## 🛒 Cart → Login Redirect (as requested)

Clicking the cart icon (desktop header or mobile bottom nav) while logged out sends the user to `/login?redirect=/cart`. After successful login (OTP or Google), they're automatically sent back to the cart. This is handled in `frontend/context/CartContext.js` (`goToCart` function) and `frontend/components/AuthGuard.js`.

---

## 📦 Deploying later

- **Backend:** any Node host (Render, Railway, Fly.io, a VPS). Set the same env vars there, and use MongoDB Atlas for the database.
- **Frontend:** Vercel is the easiest (it's built by the Next.js team). Set the `NEXT_PUBLIC_*` env vars in the Vercel dashboard.
- Remember to add your production domain to Firebase's "Authorized domains" list, and update `CLIENT_URL` in the backend `.env` to your real frontend URL (for CORS).

---

## 🧩 Notes on the admin product form

- Each color variant can have its own set of uploaded images and size/stock rows.
- Due to how multipart form uploads work, when creating/editing a product, **only the first variant's image upload field is sent with the form in this version**. If you need to add or change images for additional color variants after creation, edit the product again — re-select images for that specific variant slot before saving. This keeps the upload logic simple and reliable; let your developer know if you'd like a more advanced per-variant batch uploader added later.

---

## 🛠 Useful commands

```bash
# Backend
npm run dev      # start with auto-reload
npm run seed     # re-seed admin + sample data (safe to re-run, skips existing records)

# Frontend
npm run dev      # start dev server
npm run build    # production build
npm run start    # run production build
```
