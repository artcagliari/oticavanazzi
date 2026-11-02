"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { defaultSettings, demoProducts } from "@/lib/demo-products";
import type { Cart, Product, StoreSettings } from "@/lib/store-types";

type StoreContextValue = {
  products: Product[];
  favorites: string[];
  cart: Cart;
  settings: StoreSettings;
  hydrated: boolean;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
  toggleFavorite: (id: string) => void;
  addToCart: (id: string, amount?: number) => void;
  setQuantity: (id: string, amount: number) => void;
  clearCart: () => void;
  resetDemo: () => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);
const KEYS = {
  products: "vanazzi-products-v1",
  favorites: "vanazzi-favorites-v1",
  cart: "vanazzi-cart-v1",
  settings: "vanazzi-settings-v1",
};

function read<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cart, setCart] = useState<Cart>({});
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setProducts(read(KEYS.products, demoProducts));
      setFavorites(read(KEYS.favorites, []));
      setCart(read(KEYS.cart, {}));
      setSettings(read(KEYS.settings, defaultSettings));
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(KEYS.products, JSON.stringify(products));
  }, [products, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(KEYS.favorites, JSON.stringify(favorites));
  }, [favorites, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(KEYS.cart, JSON.stringify(cart));
  }, [cart, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(KEYS.settings, JSON.stringify(settings));
  }, [settings, hydrated]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }, []);
  const addToCart = useCallback((id: string, amount = 1) => {
    setCart((current) => ({ ...current, [id]: (current[id] || 0) + amount }));
  }, []);
  const setQuantity = useCallback((id: string, amount: number) => {
    setCart((current) => {
      const next = { ...current };
      if (amount <= 0) delete next[id];
      else next[id] = amount;
      return next;
    });
  }, []);
  const clearCart = useCallback(() => setCart({}), []);
  const resetDemo = useCallback(() => {
    setProducts(demoProducts);
    setFavorites([]);
    setCart({});
    setSettings(defaultSettings);
  }, []);

  const value = useMemo(() => ({
    products, favorites, cart, settings, hydrated, setProducts, setSettings,
    toggleFavorite, addToCart, setQuantity, clearCart, resetDemo,
  }), [products, favorites, cart, settings, hydrated, toggleFavorite, addToCart, setQuantity, clearCart, resetDemo]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used inside StoreProvider");
  return value;
}

