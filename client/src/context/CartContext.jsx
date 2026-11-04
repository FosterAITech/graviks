import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { parsePrice } from "../data/store";

const STORAGE_KEY = "garviks-cart-v1";
const CartContext = createContext(null);

const readCart = () => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage full or blocked: the cart still works for this visit.
    }
  }, [items]);

  const addItem = useCallback((product, quantity = 1) => {
    if (!product?._id) return;
    setItems((current) => {
      const existing = current.find((item) => item.id === product._id);
      if (existing) {
        return current.map((item) =>
          item.id === product._id ? { ...item, quantity: Math.min(item.quantity + quantity, 99) } : item
        );
      }
      const image = typeof product.image === "string" && !product.image.startsWith("data:") ? product.image : "";
      return [
        ...current,
        {
          id: product._id,
          name: product.name,
          slug: product.slug,
          category: product.category,
          price: parsePrice(product.price),
          image,
          quantity: Math.min(quantity, 99),
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    setItems((current) =>
      quantity <= 0
        ? current.filter((item) => item.id !== id)
        : current.map((item) => (item.id === id ? { ...item, quantity: Math.min(quantity, 99) } : item))
    );
  }, []);

  const removeItem = useCallback((id) => setItems((current) => current.filter((item) => item.id !== id)), []);
  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return { items, count, subtotal, addItem, updateQuantity, removeItem, clearCart };
  }, [items, addItem, updateQuantity, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);
