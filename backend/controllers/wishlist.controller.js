const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const fields = "name price category image stock";
async function add(req, res, next) {
  try {
    const id = req.params.productId;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid product ID" });
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    if (req.user.wishlist.some(v => v.toString() === id)) return res.status(409).json({ success: false, message: "Product is already in your wishlist" });
    await Customer.updateOne({ _id: req.user._id }, { $addToSet: { wishlist: product._id } });
    res.status(201).json({ success: true, message: "Product added to wishlist" });
  } catch (err) { next(err); }
}
async function list(req, res, next) {
  try {
    const customer = await Customer.findById(req.user._id).populate({ path: "wishlist", select: fields });
    const wishlist = (customer?.wishlist || []).filter(Boolean);
    res.json({ success: true, count: wishlist.length, wishlist });
  } catch (err) { next(err); }
}
async function remove(req, res, next) {
  try {
    const id = req.params.productId;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid product ID" });
    const customer = await Customer.findById(req.user._id);
    if (!customer.wishlist.some(v => v.toString() === id)) return res.status(404).json({ success: false, message: "Product is not in your wishlist" });
    await Customer.updateOne({ _id: req.user._id }, { $pull: { wishlist: id } });
    res.json({ success: true, message: "Product removed from wishlist" });
  } catch (err) { next(err); }
}
async function toggle(req, res, next) {
  try {
    const id = req.params.productId;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid product ID" });
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    const exists = req.user.wishlist.some(v => v.toString() === id);
    if (exists) await Customer.updateOne({ _id: req.user._id }, { $pull: { wishlist: id } });
    else await Customer.updateOne({ _id: req.user._id }, { $addToSet: { wishlist: id } });
    res.json({ success: true, message: exists ? "Product removed from wishlist" : "Product added to wishlist", wishlisted: !exists });
  } catch (err) { next(err); }
}
module.exports = { add, list, remove, toggle };
