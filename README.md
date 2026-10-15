# ShopKart — Full MERN E-commerce Project (Labs 1–6)

A single integrated learning project with customer authentication, product catalog/search, wishlist, persistent cart, checkout, Razorpay Test Mode payment verification, and order history.

## Requirements
- Node.js 18+
- MongoDB (local or Atlas)
- Razorpay test account credentials for checkout (optional until payment testing)

## Quick start

### 1. Backend
```bash
cd backend
cp .env.example .env
# Edit .env: set MONGODB_URI, JWT_SECRET, and Razorpay test credentials
npm install
npm run dev
```
Backend defaults to `http://localhost:5000`.

### 2. Frontend
In a second terminal:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Open the Vite URL (normally `http://localhost:5173`).

### 3. Razorpay
Use Razorpay **Test Mode** keys in `backend/.env`. `RAZORPAY_KEY_ID` is safe to return to the browser; `RAZORPAY_KEY_SECRET` must remain server-only. Checkout requires the Razorpay checkout script and test credentials. Never enter real card details or use live keys for this lab.

## Backend API
All routes are relative to `http://localhost:5000`.

### Auth
- `POST /customers/register` `{fullName,email,password,phone}` — 201; duplicate email 409.
- `POST /customers/login` `{email,password}` — sets HttpOnly JWT cookie.
- `GET /customers/me` — protected.
- `POST /customers/logout`
- `PATCH /customers/change-password` `{oldPassword,newPassword}` — protected.

### Products
- `POST /products` `{name,description,price,category,image,stock}` — creates a product (open, as specified in the lab).
- `GET /products?search=&category=&sort=price_asc|price_desc`
- `GET /products/:id`

### Wishlist (protected)
- `POST /wishlist/:productId`
- `GET /wishlist`
- `DELETE /wishlist/:productId`
- Bonus `PATCH /wishlist/:productId` toggles membership.

### Cart (protected)
- `POST /cart/:productId` — adds item or increments existing quantity, subject to stock.
- `GET /cart`
- `PATCH /cart/:productId` `{quantity}`
- `DELETE /cart/:productId`

### Orders (protected)
- `POST /orders/create-payment-order` `{shippingAddress:{fullName,phone,addressLine1,city,state,pincode}}`
- `POST /orders/verify-payment` `{razorpay_order_id,razorpay_payment_id,razorpay_signature,orderId}`
- `GET /orders`
- `GET /orders/:id`

## Important implementation details
- One `Customer` identity model is used throughout; wishlist and cart extend it. No conflicting second `User` model.
- Passwords are bcrypt hashes, omitted from API responses, and excluded from queries by default.
- JWTs are stored in HttpOnly cookies; frontend API calls include credentials.
- Product references are stored for cart/wishlist. Order items preserve purchase-time name, price, quantity, and image snapshots.
- Totals are recalculated server-side using current database prices. Stock is checked server-side.
- A payment is marked PAID only after HMAC-SHA256 signature verification on the server. Cart clearing happens only after verified payment.
- `.env` files are ignored by git. Do not commit credentials.

## Limitations / deployment notes
This is an educational lab project, not a production-certified commerce platform. Before public deployment add rate limiting, email verification, CSRF protections appropriate to your deployment, robust inventory reservation/transaction handling, structured logging, automated tests, and production secrets management. For production, also implement payment webhooks and idempotency.
