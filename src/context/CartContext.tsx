'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { CartItem, CartState } from '@/types/database';

// ============================================================
// Types
// ============================================================
type CartAction =
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string } // productId
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'APPLY_COUPON'; payload: { code: string; discountPercent: number; discountAmount: number } }
  | { type: 'REMOVE_COUPON' }
  | { type: 'CLEAR_CART' }
  | { type: 'HYDRATE'; payload: CartState };

interface CartContextType {
  cart: CartState;
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  applyCoupon: (code: string, discountPercent: number, discountAmount: number) => void;
  removeCoupon: () => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
}

// ============================================================
// Helpers
// ============================================================
const SHIPPING_THRESHOLD = 999;
const SHIPPING_COST = 99;
const CART_STORAGE_KEY = 'isha_vastram_cart';

function calcShipping(subtotal: number, discount: number): number {
  return (subtotal - discount) >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}

function calcTotals(items: CartItem[], coupon: CartState['coupon']): Pick<CartState, 'totalItems' | 'subtotal' | 'total'> {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const discountAmount = coupon?.discountAmount ?? 0;
  const shipping = calcShipping(subtotal, discountAmount);
  const total = subtotal - discountAmount + shipping;
  return { subtotal, totalItems, total };
}

// ============================================================
// Initial State
// ============================================================
const initialState: CartState = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  coupon: null,
  total: 0,
};

// ============================================================
// Reducer
// ============================================================
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {

    case 'HYDRATE':
      return action.payload;

    case 'ADD_TO_CART': {
      const existing = state.items.find(i => i.productId === action.payload.productId);
      let items: CartItem[];

      if (existing) {
        items = state.items.map(i =>
          i.productId === action.payload.productId
            ? { ...i, quantity: Math.min(i.quantity + (action.payload.quantity ?? 1), i.stock) }
            : i
        );
      } else {
        items = [...state.items, { ...action.payload, quantity: action.payload.quantity ?? 1 }];
      }

      return { ...state, items, ...calcTotals(items, state.coupon) };
    }

    case 'REMOVE_FROM_CART': {
      const items = state.items.filter(i => i.productId !== action.payload);
      // Remove coupon if cart is now empty
      const coupon = items.length > 0 ? state.coupon : null;
      return { ...state, items, coupon, ...calcTotals(items, coupon) };
    }

    case 'UPDATE_QUANTITY': {
      const items = state.items
        .map(i => i.productId === action.payload.productId
          ? { ...i, quantity: Math.max(0, Math.min(action.payload.quantity, i.stock)) }
          : i
        )
        .filter(i => i.quantity > 0);
      return { ...state, items, ...calcTotals(items, state.coupon) };
    }

    case 'APPLY_COUPON': {
      const coupon = {
        code: action.payload.code,
        discountPercent: action.payload.discountPercent,
        discountAmount: action.payload.discountAmount,
      };
      return { ...state, coupon, ...calcTotals(state.items, coupon) };
    }

    case 'REMOVE_COUPON': {
      return { ...state, coupon: null, ...calcTotals(state.items, null) };
    }

    case 'CLEAR_CART':
      return { ...initialState };

    default:
      return state;
  }
}

// ============================================================
// Context
// ============================================================
const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, initialState);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed: CartState = JSON.parse(stored);
        dispatch({ type: 'HYDRATE', payload: parsed });
      }
    } catch {
      // Invalid stored data — ignore
    }
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Storage full — ignore
    }
  }, [cart]);

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY && e.newValue) {
        try {
          dispatch({ type: 'HYDRATE', payload: JSON.parse(e.newValue) });
        } catch { /* ignore */ }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    dispatch({ type: 'ADD_TO_CART', payload: { ...item, quantity: item.quantity ?? 1 } });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  }, []);

  const applyCoupon = useCallback((code: string, discountPercent: number, discountAmount: number) => {
    dispatch({ type: 'APPLY_COUPON', payload: { code, discountPercent, discountAmount } });
  }, []);

  const removeCoupon = useCallback(() => {
    dispatch({ type: 'REMOVE_COUPON' });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const isInCart = useCallback((productId: string) => {
    return cart.items.some(i => i.productId === productId);
  }, [cart.items]);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      applyCoupon,
      removeCoupon,
      clearCart,
      isInCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
