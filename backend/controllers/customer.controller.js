const bcrypt = require("bcrypt");
const Customer = require("../models/customer.model");
const generateToken = require("../utils/generateToken");
const rounds = 12;
const cookieName = () => process.env.COOKIE_NAME || "shopkart_token";
function cookieOptions() {
  const prod = process.env.NODE_ENV === "production";
  return { httpOnly: true, secure: prod, sameSite: prod ? "none" : "lax", path: "/", maxAge: 86400000 };
}
function safeCustomer(c) {
  return { _id: c._id, fullName: c.fullName, email: c.email, phone: c.phone, createdAt: c.createdAt };
}
async function register(req, res, next) {
  try {
    const { fullName, email, password, phone } = req.body || {};
    if (![fullName, email, password, phone].every(v => typeof v === "string" && v.trim()))
      return res.status(400).json({ success: false, message: "Full name, email, password and phone are required" });
    if (password.length < 6) return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
    const normalized = email.trim().toLowerCase();
    if (await Customer.findOne({ email: normalized }).select("_id"))
      return res.status(409).json({ success: false, message: "An account with this email already exists" });
    const customer = await Customer.create({
      fullName: fullName.trim(), email: normalized, phone: phone.trim(),
      password: await bcrypt.hash(password, rounds)
    });
    res.status(201).json({ success: true, message: "Registration successful", customer: safeCustomer(customer) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: "An account with this email already exists" });
    if (err.name === "ValidationError") return res.status(400).json({ success: false, message: err.message });
    next(err);
  }
}
async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });
    const customer = await Customer.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!customer || !(await bcrypt.compare(password, customer.password)))
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    res.cookie(cookieName(), generateToken(customer._id), cookieOptions());
    res.json({ success: true, message: "Login successful", customer: safeCustomer(customer) });
  } catch (err) { next(err); }
}
function me(req, res) { res.json({ success: true, customer: safeCustomer(req.user) }); }
function logout(_req, res) {
  const prod = process.env.NODE_ENV === "production";
  res.clearCookie(cookieName(), { httpOnly: true, secure: prod, sameSite: prod ? "none" : "lax", path: "/" });
  res.json({ success: true, message: "Logged out successfully" });
}
async function changePassword(req, res, next) {
  try {
    const { oldPassword, newPassword } = req.body || {};
    if (typeof oldPassword !== "string" || !oldPassword || typeof newPassword !== "string" || !newPassword)
      return res.status(400).json({ success: false, message: "Old password and new password are required" });
    if (newPassword.length < 6) return res.status(400).json({ success: false, message: "New password must be at least 6 characters long" });
    const customer = await Customer.findById(req.user._id).select("+password");
    if (!customer || !(await bcrypt.compare(oldPassword, customer.password)))
      return res.status(401).json({ success: false, message: "Old password is incorrect" });
    customer.password = await bcrypt.hash(newPassword, rounds);
    await customer.save();
    res.cookie(cookieName(), generateToken(customer._id), cookieOptions());
    res.json({ success: true, message: "Password changed successfully", customer: safeCustomer(customer) });
  } catch (err) { next(err); }
}
module.exports = { register, login, me, logout, changePassword };
