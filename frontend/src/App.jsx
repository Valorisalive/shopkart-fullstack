import { Link, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
function NotFound(){return <main className="container page-content"><div className="state-card"><p className="eyebrow">404 / NOT FOUND</p><h1>Looks like a wrong turn.</h1><p>The page you’re looking for doesn’t exist.</p><Link to="/products" className="button">Back to shopping</Link></div></main>;}
export default function App(){
 return <><Navbar/><Routes><Route path="/" element={<Home/>}/><Route path="/home" element={<Home/>}/><Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/><Route path="/products" element={<Products/>}/><Route path="/products/:id" element={<ProductDetails/>}/><Route element={<ProtectedRoute/>}><Route path="/wishlist" element={<Wishlist/>}/><Route path="/cart" element={<Cart/>}/><Route path="/checkout" element={<Checkout/>}/><Route path="/orders" element={<Orders/>}/><Route path="/orders/:id" element={<OrderDetails/>}/></Route><Route path="*" element={<NotFound/>}/></Routes><footer className="footer"><Link className="brand" to="/">shop<span>kart.</span></Link><p>Thoughtful finds for everyday life.</p><span>Built for the ShopKart engineering labs · Test mode only</span></footer></>;
}
