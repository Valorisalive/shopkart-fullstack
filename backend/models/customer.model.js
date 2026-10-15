const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, min: 1, default: 1, required: true }
}, { _id: false });

const customerSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  password: { type: String, required: true, select: false },
  phone: { type: String, required: true, trim: true, maxlength: 25 },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  cart: { type: [cartItemSchema], default: [] }
}, {
  timestamps: { createdAt: true, updatedAt: true },
  toJSON: { transform(_doc, ret) { delete ret.password; delete ret.__v; return ret; } }
});

module.exports = mongoose.models.Customer || mongoose.model("Customer", customerSchema);
