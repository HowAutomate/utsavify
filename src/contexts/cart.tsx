import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { Product } from "@/lib/products";
import { computeBoxPricing } from "@/lib/box-pricing";
import { trackAddToCart } from "@/lib/analytics";

export type CartItem = Product & { qty: number };

type CartContextValue = {
  cart: CartItem[];
  cartCount: number;
  /** Box-aware total the customer pays (before prepaid/bulk discounts). */
  cartTotal: number;
  /** Naive sum (priceNum × qty) — for the strike-through "you saved" line. */
  cartNaiveTotal: number;
  /** cartNaiveTotal − cartTotal, the bundle-box savings. */
  cartSavings: number;
  /** Number of boxes the rakhis pack into. */
  cartBoxCount: number;
  /** Add-on slots left in the current box — for the upsell nudge. */
  cartSlotsLeftInBox: number;
  addToCart: (p: Product) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, delta: number) => void;
  clearCart: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const CART_STORAGE_KEY = "utsavify-cart-v1";
// Saved carts expire so customers don't check out weeks later at stale prices.
const CART_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function loadSavedCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const saved = JSON.parse(raw) as { items?: CartItem[]; savedAt?: number };
    if (!Array.isArray(saved.items)) return [];
    if (!saved.savedAt || Date.now() - saved.savedAt > CART_TTL_MS) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return [];
    }
    return saved.items.filter((i) => i && i.id && i.name && i.qty > 0);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(loadSavedCart);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    try {
      if (cart.length === 0) localStorage.removeItem(CART_STORAGE_KEY);
      else localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items: cart, savedAt: Date.now() }));
    } catch {
      // storage full or blocked (private mode) — cart still works in-memory
    }
  }, [cart]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const pricing = useMemo(() => computeBoxPricing(cart), [cart]);

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const found = prev.find((i) => i.id === p.id);
      if (found) return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...p, qty: 1 }];
    });
    toast.success("Added to cart", { description: p.name });
    setCartOpen(true);
    trackAddToCart(p);
  };

  const removeFromCart = (id: string) =>
    setCart((prev) => prev.filter((i) => i.id !== id));

  const updateQty = (id: string, delta: number) =>
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0),
    );

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal: pricing.cartTotal,
        cartNaiveTotal: pricing.naiveTotal,
        cartSavings: pricing.savings,
        cartBoxCount: pricing.boxCount,
        cartSlotsLeftInBox: pricing.slotsLeftInBox,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        cartOpen,
        setCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
