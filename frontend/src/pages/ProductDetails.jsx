import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { errorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
export default function ProductDetails() {
 const {id}=useParams();const [product,setProduct]=useState(null);const [loading,setLoading]=useState(true);const [error,setError]=useState("");const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");const {customer}=useAuth();const {addToCart}=useCart();const navigate=useNavigate();
 async function load(){setLoading(true);setError("");try{const {data}=await api.get(`/products/${id}`);setProduct(data.product);}catch(e){setError(errorMessage(e,"Could not load product"));}finally{setLoading(false);}}
 useEffect(()=>{load();},[id]);
 async function add(){if(!customer)return navigate("/login");setBusy(true);setMessage("");try{await addToCart(product._id);setMessage("Added to your cart.");}catch(e){setMessage(errorMessage(e,"Could not add to cart"));}finally{setBusy(false);}}
 if(loading)return <div className="page-state">Loading product…</div>;
 if(error||!product)return <main className="container page-content"><div className="state-card"><h2>Product unavailable</h2><p>{error||"Product not found"}</p><Link to="/products" className="button">Back to products</Link></div></main>;
 return <main className="container page-content"><Link to="/products" className="back-link">← All products</Link><section className="detail-layout"><div className="detail-image"><img src={product.image} alt={product.name} onError={e=>{e.currentTarget.src="https://placehold.co/800x700/f0eee8/333?text=ShopKart";}}/></div><div className="detail-copy"><p className="eyebrow">{product.category}</p><h1>{product.name}</h1><p className="detail-price">₹{Number(product.price).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}</p><p className="detail-description">{product.description}</p><p className={product.stock>0?"stock":"stock out"}>{product.stock>0?`${product.stock} available`: "Currently out of stock"}</p><button className="button button-large" onClick={add} disabled={busy||product.stock<1}>{busy?"Adding…":"Add to cart →"}</button>{message&&<p className="inline-message">{message}</p>}<p className="muted small-note">Your cart is saved to your account.</p></div></section></main>;
}
