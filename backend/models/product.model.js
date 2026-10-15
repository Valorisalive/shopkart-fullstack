const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 180 },
  description: { type: String, required: true, trim: true, maxlength: 10000 },
  price: { type: Number, required: true, min: 0.01 },
  category: { type: String, required: true, trim: true, maxlength: 100 },
  image: { type: String, required: true, trim: true },
  stock: { type: Number, required: true, min: 0, validate: Number.isInteger }
}, { timestamps: { createdAt: true, updatedAt: true } });
module.exports = mongoose.models.Product || mongoose.model("Product", productSchema);
