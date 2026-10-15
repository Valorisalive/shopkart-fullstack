import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errorMessage } from "../services/api";
import ProductCard from "../components/ProductCard";
export default function Wishlist() {
 const [items,setItems]=useState([]);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
 const load=useCallback(async()=>{setLoading(true);setError("");try{const {data}=await api.get("/wishlist");setItems(data.wishlist||[]);}catch(e){setError(errorMessage(e,"Unable to load your wishlist"));}finally{setLoading(false);}},[]);
 useEffect(()=>{load();},[load]);
 async function remove(id){try{await api.delete(`/wishlist/${id}`);setItems(v=>v.filter(p=>p._id!==id));}catch(e){setError(errorMessage(e,"Could not remove item"));}}
 return <main className="container page-content"><div className="page-heading"><div><p className="eyebrow">SAVED FOR LATER</p><h1>Your <em>wishlist.</em></h1><p className="muted">The ones you don’t want to forget.</p></div><span className="result-count">{items.length} saved</span></div>{loading?<div className="page-state">Loading your wishlist…</div>:error?<div className="state-card"><h3>Unable to load your wishlist</h3><p>{error}</p><button className="button" onClick={load}>Try Again</button></div>:items.length===0?<div className="state-card"><div className="empty-icon">♡</div><h3>Nothing saved. Yet.</h3><p>When something catches your eye, save it here.</p><Link to="/products" className="button">Browse products →</Link></div>:<div className="product-grid">{items.map(p=><div className="wishlist-card-wrap" key={p._id}><ProductCard product={p} initialWishlisted={true}/><button className="remove-link" onClick={()=>remove(p._id)}>Remove from wishlist</button></div>)}</div>}</main>;
}
