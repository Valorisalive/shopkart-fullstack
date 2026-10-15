import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
export default function Navbar() {
  const { customer, logout } = useAuth(); const { cartCount } = useCart(); const navigate = useNavigate();
  async function handleLogout() { await logout(); navigate("/login"); }
  return <header className="navbar"><Link className="brand" to="/">shop<span>kart.</span></Link><nav>
    <NavLink to="/products">Products</NavLink>
    {customer && <><NavLink to="/wishlist">Wishlist</NavLink><NavLink to="/cart">Cart <span className="count">{cartCount}</span></NavLink><NavLink to="/orders">Orders</NavLink></>}
  </nav><div className="nav-right">{customer ? <><span className="nav-greeting">Hi, {customer.fullName.split(" ")[0]}</span><button className="button button-quiet button-small" onClick={handleLogout}>Log out</button></> : <><Link to="/login" className="nav-login">Log in</Link><Link to="/register" className="button button-small">Create account</Link></>}</div></header>;
}
