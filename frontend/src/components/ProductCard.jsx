import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
export default function ProductCard({ product, initialWishlisted = false }) {
  const { customer } = useAuth(); const { addToCart } = useCart(); const navigate = useNavigate();
  const [adding, setAdding] = useState(false); const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [wishBusy, setWishBusy] = useState(false); const [message, setMessage] = useState("");
  async function addCart() {
    if (!customer) return navigate("/login");
    setAdding(true); setMessage("");
    try { await addToCart(product._id); setMessage("Added to cart"); }
    catch (e) { setMessage(e.response?.data?.message || "Could not add to cart"); }
    finally { setAdding(false); }
  }
  async function toggleWish() {
    if (!customer) return navigate("/login");
    setWishBusy(true); setMessage("");
    try { const { data } = await api.patch(`/wishlist/${product._id}`); setWishlisted(data.wishlisted); }
    catch (e) { setMessage(e.response?.data?.message || "Could not update wishlist"); }
    finally { setWishBusy(false); }
  }
  return <article className="product-card"><div className="product-image-wrap"><img className="product-image" src={product.image} alt={product.name} loading="lazy" onError={e => { e.currentTarget.src = "https://placehold.co/600x450/f0eee8/333?text=ShopKart"; }} /><button className={`heart-button ${wishlisted ? "hearted" : ""}`} onClick={toggleWish} disabled={wishBusy} aria-label="Toggle wishlist">{wishlisted ? "♥" : "♡"}</button><span className="category-pill">{product.category}</span></div><div className="product-info"><Link to={`/products/${product._id}`} className="product-name">{product.name}</Link><div className="product-price-row"><strong>₹{Number(product.price).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}</strong><span className={product.stock > 0 ? "stock" : "stock out"}>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</span></div><button className="button add-button" onClick={addCart} disabled={adding || product.stock < 1}>{adding ? "Adding…" : "Add to cart"}</button>{message && <p className="inline-message">{message}</p>}</div></article>;
}
