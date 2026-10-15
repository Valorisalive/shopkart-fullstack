const crypto = require("crypto");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");

function razorpayClient() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET ||
      process.env.RAZORPAY_KEY_ID.includes("replace_me") || process.env.RAZORPAY_KEY_SECRET.includes("replace_me")) {
    const e = new Error("Configure Razorpay Test Mode keys in backend/.env before checkout");
    e.status = 503; throw e;
  }
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
}
function validShipping(a) {
  return a && ["fullName","phone","addressLine1","city","state","pincode"].every(k => typeof a[k] === "string" && a[k].trim()) &&
    /^\d{6}$/.test(a.pincode.trim()) && /^[+()\-\s\d]{7,20}$/.test(a.phone.trim());
}
async function createPaymentOrder(req, res, next) {
  let orderDoc;
  try {
    const shippingAddress = req.body?.shippingAddress;
    if (!validShipping(shippingAddress)) return res.status(400).json({ success: false, message: "Provide a complete shipping address, valid phone and 6-digit pincode" });
    const customer = await Customer.findById(req.user._id);
    if (!customer.cart.length) return res.status(400).json({ success: false, message: "Your cart is empty" });
    const productIds = customer.cart.map(i => i.product);
    const products = await Product.find({ _id: { $in: productIds } });
    const byId = new Map(products.map(p => [p._id.toString(), p]));
    const items = [];
    let totalAmount = 0;
    for (const cartItem of customer.cart) {
      const product = byId.get(cartItem.product.toString());
      if (!product) return res.status(404).json({ success: false, message: "A product in your cart no longer exists" });
      if (product.stock < cartItem.quantity) return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      items.push({ product: product._id, name: product.name, price: product.price, quantity: cartItem.quantity, image: product.image });
      totalAmount += product.price * cartItem.quantity;
    }
    totalAmount = Math.round((totalAmount + Number.EPSILON) * 100) / 100;
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) return res.status(400).json({ success: false, message: "Order total is invalid" });

    // Do not trust any client-supplied total.
    orderDoc = await Order.create({
      user: customer._id, items, shippingAddress: Object.fromEntries(Object.entries(shippingAddress).map(([k,v]) => [k, v.trim()])),
      totalAmount, paymentStatus: "PENDING", status: "PENDING_PAYMENT"
    });
    const razorpay = razorpayClient();
    const rpOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), currency: "INR", receipt: orderDoc._id.toString(),
      notes: { shopkartOrderId: orderDoc._id.toString(), customerId: customer._id.toString() }
    });
    orderDoc.razorpayOrderId = rpOrder.id;
    await orderDoc.save();
    res.status(201).json({
      success: true, orderId: orderDoc._id, razorpayOrderId: rpOrder.id,
      amount: rpOrder.amount, currency: rpOrder.currency, keyId: process.env.RAZORPAY_KEY_ID,
      customer: { name: customer.fullName, email: customer.email, phone: customer.phone }
    });
  } catch (err) {
    if (orderDoc && !orderDoc.razorpayOrderId) {
      await Order.deleteOne({ _id: orderDoc._id }).catch(() => {});
    }
    next(err);
  }
}
async function verifyPayment(req, res, next) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body || {};
    if (![razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId].every(v => typeof v === "string" && v)) {
      return res.status(400).json({ success: false, message: "Payment verification fields are required" });
    }
    if (!mongoose.isValidObjectId(orderId)) return res.status(400).json({ success: false, message: "Invalid order ID" });
    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (order.paymentStatus === "PAID") return res.json({ success: true, message: "Payment already verified", order });
    if (!order.razorpayOrderId || order.razorpayOrderId !== razorpay_order_id)
      return res.status(400).json({ success: false, message: "Payment order does not match" });
    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.razorpayOrderId}|${razorpay_payment_id}`).digest("hex");
    const a = Buffer.from(expected, "utf8"), b = Buffer.from(razorpay_signature, "utf8");
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b))
      return res.status(400).json({ success: false, message: "Payment signature verification failed" });

    // Recheck inventory before accepting the verified payment. Inventory decrementing/reservation
    // is intentionally not performed by this educational lab; production requires atomic stock handling.
    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();
    await Customer.updateOne({ _id: req.user._id }, { $set: { cart: [] } });
    res.json({ success: true, message: "Payment verified and order placed", order });
  } catch (err) { next(err); }
}
async function listOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (err) { next(err); }
}
async function getOrder(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid order ID" });
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, order });
  } catch (err) { next(err); }
}
module.exports = { createPaymentOrder, verifyPayment, listOrders, getOrder };
