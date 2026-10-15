const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const populateCart = customer => customer.populate({ path: "cart.product", select: "name description price category image stock" });
async function getCart(req, res, next) {
  try {
    const customer = await Customer.findById(req.user._id);
    await populateCart(customer);
    const cart = customer.cart.filter(item => item.product).map(item => ({ product: item.product, quantity: item.quantity }));
    res.json({ success: true, count: cart.reduce((n, i) => n + i.quantity, 0), cart });
  } catch (err) { next(err); }
}
async function add(req, res, next) {
  try {
    const id = req.params.productId;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid product ID" });
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    if (product.stock < 1) return res.status(400).json({ success: false, message: "Product is out of stock" });
    const customer = await Customer.findById(req.user._id);
    const item = customer.cart.find(i => i.product.toString() === id);
    const nextQty = item ? item.quantity + 1 : 1;
    if (nextQty > product.stock) return res.status(400).json({ success: false, message: "Requested quantity exceeds available stock" });
    if (item) item.quantity = nextQty;
    else customer.cart.push({ product: product._id, quantity: 1 });
    await customer.save();
    await populateCart(customer);
    const cart = customer.cart.filter(i => i.product).map(i => ({ product: i.product, quantity: i.quantity }));
    res.status(200).json({ success: true, message: "Cart updated", count: cart.reduce((n, i) => n + i.quantity, 0), cart });
  } catch (err) { next(err); }
}
async function update(req, res, next) {
  try {
    const id = req.params.productId, quantity = req.body?.quantity;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid product ID" });
    if (!Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ success: false, message: "Quantity must be an integer of at least 1" });
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    if (quantity > product.stock) return res.status(400).json({ success: false, message: "Requested quantity exceeds available stock" });
    const customer = await Customer.findById(req.user._id);
    const item = customer.cart.find(i => i.product.toString() === id);
    if (!item) return res.status(404).json({ success: false, message: "Product is not in your cart" });
    item.quantity = quantity;
    await customer.save();
    await populateCart(customer);
    const cart = customer.cart.filter(i => i.product).map(i => ({ product: i.product, quantity: i.quantity }));
    res.json({ success: true, count: cart.reduce((n, i) => n + i.quantity, 0), cart });
  } catch (err) { next(err); }
}
async function remove(req, res, next) {
  try {
    const id = req.params.productId;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid product ID" });
    const customer = await Customer.findById(req.user._id);
    const before = customer.cart.length;
    customer.cart = customer.cart.filter(i => i.product.toString() !== id);
    if (before === customer.cart.length) return res.status(404).json({ success: false, message: "Product is not in your cart" });
    await customer.save();
    await populateCart(customer);
    const cart = customer.cart.filter(i => i.product).map(i => ({ product: i.product, quantity: i.quantity }));
    res.json({ success: true, message: "Product removed", count: cart.reduce((n, i) => n + i.quantity, 0), cart });
  } catch (err) { next(err); }
}
module.exports = { getCart, add, update, remove };
