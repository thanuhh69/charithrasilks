'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [cart, setCart] = useState({ items: [], summary: { totalMRP: 0, discountOnMRP: 0, totalAmount: 0, itemCount: 0 } });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchCart = useCallback(async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    try {
      const { data } = await api.get('/cart');
      if (data.success) setCart(data.cart);
    } catch (err) {
      console.error('Fetch cart failed', err);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!authLoading) {
      if (isLoggedIn) fetchCart();
      else setCart({ items: [], summary: { totalMRP: 0, discountOnMRP: 0, totalAmount: 0, itemCount: 0 } });
    }
  }, [isLoggedIn, authLoading, fetchCart]);

  // The key requirement: clicking cart when not logged in -> redirect to /login
  const goToCart = useCallback(() => {
    if (!isLoggedIn) {
      router.push('/login?redirect=/cart');
      return;
    }
    router.push('/cart');
  }, [isLoggedIn, router]);

  const addToCart = async ({ productId, variantId, color, size, quantity = 1 }) => {
    if (!isLoggedIn) {
      router.push('/login?redirect=/cart');
      return false;
    }
    try {
      const { data } = await api.post('/cart/items', { productId, variantId, color, size, quantity });
      if (data.success) {
        setCart(data.cart);
        toast.success('Added to cart');
        return true;
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not add to cart');
      return false;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const { data } = await api.put(`/cart/items/${itemId}`, { quantity });
      if (data.success) setCart(data.cart);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not update item');
    }
  };

  const removeItem = async (itemId) => {
    try {
      const { data } = await api.delete(`/cart/items/${itemId}`);
      if (data.success) {
        setCart(data.cart);
        toast.success('Removed from cart');
      }
    } catch (err) {
      toast.error('Could not remove item');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, loading, fetchCart, goToCart, addToCart, updateQuantity, removeItem }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
