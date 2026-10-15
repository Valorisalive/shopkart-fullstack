const jwt = require("jsonwebtoken");
const Customer = require("../models/customer.model");
async function protect(req, res, next) {
  try {
    const token = req.cookies?.[process.env.COOKIE_NAME || "shopkart_token"];
    if (!token) return res.status(401).json({ success: false, message: "Authentication required" });
    let decoded;
    try { decoded = jwt.verify(token, process.env.JWT_SECRET); }
    catch { return res.status(401).json({ success: false, message: "Invalid or expired session" }); }
    const customer = await Customer.findById(decoded.sub);
    if (!customer) return res.status(401).json({ success: false, message: "Invalid or expired session" });
    req.user = customer;
    next();
  } catch (err) { next(err); }
}
module.exports = { protect };
