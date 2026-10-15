import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";
const CartContext = createContext(null);
export function CartProvider({ children }) {
  const { customer } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState("");
  const refreshCart = useCallback(async () => {
    if (!customer) { setCartItems([]); setCartError(""); return []; }
    setCartLoading(true); setCartError("");
    try { const { data } = await api.get("/cart"); setCartItems(data.cart || []); return data.cart || []; }
    catch (e) { setCartError(e.response?.data?.message || "Unable to load cart"); throw e; }
    finally { setCartLoading(false); }
  }, [customer]);
  useEffect(() => { refreshCart().catch(() => {}); }, [refreshCart]);
  const addToCart = async productId => { const { data } = await api.post(`/cart/${productId}`); setCartItems(data.cart || []); return data; };
  const updateQuantity = async (productId, quantity) => { const { data } = await api.patch(`/cart/${productId}`, { quantity }); setCartItems(data.cart || []); return data; };
  const removeFromCart = async productId => { const { data } = await api.delete(`/cart/${productId}`); setCartItems(data.cart || []); return data; };
  const clearCart = () => setCartItems([]);
  const cartCount = useMemo(() => cartItems.reduce((n, i) => n + i.quantity, 0), [cartItems]);
  const subtotal = useMemo(() => cartItems.reduce((n, i) => n + (Number(i.product?.price) || 0) * i.quantity, 0), [cartItems]);
  return <CartContext.Provider value={{ cartItems, setCartItems, cartLoading, cartError, refreshCart, addToCart, updateQuantity, removeFromCart, clearCart, cartCount, subtotal }}>{children}</CartContext.Provider>;
}
export const useCart = () => useContext(CartContext);
