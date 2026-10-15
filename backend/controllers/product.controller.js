const mongoose = require("mongoose");
const Product = require("../models/product.model");
async function createProduct(req, res, next) {
  try {
    const { name, description, price, category, image, stock } = req.body || {};
    if (![name, description, category, image].every(v => typeof v === "string" && v.trim()) ||
        price === undefined || stock === undefined || !Number.isFinite(Number(price)) ||
        Number(price) <= 0 || !Number.isInteger(Number(stock)) || Number(stock) < 0) {
      return res.status(400).json({ success: false, message: "Provide name, description, positive price, category, image and non-negative integer stock" });
    }
    const product = await Product.create({ name, description, price: Number(price), category, image, stock: Number(stock) });
    res.status(201).json({ success: true, product });
  } catch (err) {
    if (err.name === "ValidationError") return res.status(400).json({ success: false, message: err.message });
    next(err);
  }
}
async function listProducts(req, res, next) {
  try {
    const query = {};
    if (typeof req.query.search === "string" && req.query.search.trim())
      query.name = { $regex: req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    if (typeof req.query.category === "string" && req.query.category.trim() && req.query.category !== "All")
      query.category = req.query.category.trim();
    const sort = req.query.sort === "price_asc" ? { price: 1 } : req.query.sort === "price_desc" ? { price: -1 } : { createdAt: -1 };
    const products = await Product.find(query).select("name description price category image stock createdAt").sort(sort);
    res.json({ success: true, count: products.length, products });
  } catch (err) { next(err); }
}
async function getProduct(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid product ID" });
    const product = await Product.findById(req.params.id).select("name description price category image stock createdAt");
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
  } catch (err) { next(err); }
}
module.exports = { createProduct, listProducts, getProduct };
