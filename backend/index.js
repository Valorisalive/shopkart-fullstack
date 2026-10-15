require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
const port = Number(process.env.PORT) || 5000;

if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters");
}

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "30kb" }));
app.use(cookieParser());

app.get("/health", (_req, res) => res.json({ success: true, message: "ShopKart API is running" }));
app.use("/customers", require("./routes/customer.routes"));
app.use("/products", require("./routes/product.routes"));
app.use("/wishlist", require("./routes/wishlist.routes"));
app.use("/cart", require("./routes/cart.routes"));
app.use("/orders", require("./routes/order.routes"));

app.use((_req, res) => res.status(404).json({ success: false, message: "Route not found" }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.status && err.status < 500 ? err.message : "Internal server error"
  });
});

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
    app.listen(port, () => console.log(`ShopKart API listening on http://localhost:${port}`));
  } catch (err) {
    console.error("Could not start API:", err.message);
    process.exit(1);
  }
}
if (require.main === module) start();
module.exports = app;
