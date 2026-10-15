import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errorMessage } from "../services/api";
import { useCart } from "../context/CartContext";
const initial={fullName:"",phone:"",addressLine1:"",city:"",state:"",pincode:""};
function loadRazorpay(){return new Promise(resolve=>{if(window.Razorpay)return resolve(true);const script=document.createElement("script");script.src="https://checkout.razorpay.com/v1/checkout.js";script.onload=()=>resolve(true);script.onerror=()=>resolve(false);document.body.appendChild(script);});}
export default function Checkout(){
 const {cartItems,subtotal,clearCart,refreshCart}=useCart();const [address,setAddress]=useState(initial);const [busy,setBusy]=useState(false);const [error,setError]=useState("");const navigate=useNavigate();
 function change(e){setAddress({...address,[e.target.name]:e.target.value});}
 async function submit(e){
  e.preventDefault();setError("");
  if(Object.values(address).some(v=>!v.trim()))return setError("Please complete every shipping field.");
  if(!/^[+()\-\s\d]{7,20}$/.test(address.phone.trim()))return setError("Enter a valid phone number.");
  if(!/^\d{6}$/.test(address.pincode.trim()))return setError("Pincode must be exactly 6 digits.");
  if(!cartItems.length)return setError("Your cart is empty.");
  setBusy(true);
  try{
   const loaded=await loadRazorpay();if(!loaded)throw new Error("Could not load Razorpay Checkout. Check your connection and try again.");
   const {data:order}=await api.post("/orders/create-payment-order",{shippingAddress:address});
   const options={
    key:order.keyId,amount:order.amount,currency:order.currency,name:"ShopKart",description:"ShopKart purchase",
    order_id:order.razorpayOrderId,prefill:{name:order.customer.name,email:order.customer.email,contact:order.customer.phone},
    theme:{color:"#234c3b"},
    handler:async response=>{
     try{
      const {data}=await api.post("/orders/verify-payment",{...response,orderId:order.orderId});
      if(!data.success)throw new Error("Payment verification failed.");
      clearCart();await refreshCart().catch(()=>{});clearCart();navigate(`/orders/${order.orderId}`,{replace:true,state:{justPlaced:true}});
     }catch(err){setError(errorMessage(err,"Payment could not be verified. Your cart has been preserved. Please contact support before retrying."));setBusy(false);}
    },
    modal:{ondismiss:()=>{setError("Checkout was closed. Your cart is unchanged.");setBusy(false);}}
   };
   const checkout=new window.Razorpay(options);
   checkout.on("payment.failed",response=>{setError(response.error?.description||"Payment failed. Your cart is unchanged.");setBusy(false);});
   checkout.open();
   // Keep the submit lock while checkout is open; handler/failed/dismiss callbacks release it.
  }catch(err){setError(errorMessage(err,"Unable to start checkout"));setBusy(false);}
 }
 if(!cartItems.length)return <main className="container page-content"><div className="state-card"><h2>Your cart is empty</h2><Link className="button" to="/products">Browse products</Link></div></main>;
 return <main className="container page-content"><div className="page-heading"><div><p className="eyebrow">ALMOST YOURS</p><h1>Shipping & <em>payment.</em></h1><p className="muted">Complete your address, then pay securely in Razorpay Test Mode.</p></div></div><div className="checkout-layout"><form className="checkout-form" onSubmit={submit}><h2>Shipping address</h2><div className="form-grid"><label>Full name<input name="fullName" value={address.fullName} onChange={change} required/></label><label>Phone number<input name="phone" value={address.phone} onChange={change} required/></label><label className="span-two">Address line<input name="addressLine1" value={address.addressLine1} onChange={change} required/></label><label>City<input name="city" value={address.city} onChange={change} required/></label><label>State<input name="state" value={address.state} onChange={change} required/></label><label>Pincode<input name="pincode" inputMode="numeric" maxLength={6} value={address.pincode} onChange={change} required/></label></div><div className="test-mode-note"><strong>Test Mode checkout</strong><p>This lab uses Razorpay test credentials only. Do not use live payment keys.</p></div>{error&&<p className="error-box">{error}</p>}<button className="button button-large full-width" disabled={busy}>{busy?"Opening secure checkout…":"Continue to payment →"}</button><Link to="/cart" className="continue-link">← Return to cart</Link></form><aside className="summary-card"><p className="eyebrow">YOUR ORDER</p>{cartItems.map(({product,quantity})=>product&&<div className="checkout-item" key={product._id}><img src={product.image} alt={product.name}/><div><strong>{product.name}</strong><p className="muted">Qty {quantity}</p></div><span>₹{(product.price*quantity).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}</span></div>)}<div className="summary-total"><span>Estimated subtotal</span><strong>₹{subtotal.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}</strong></div><p className="muted small-note">The server recalculates the final order amount using current product prices.</p></aside></div></main>;
}
