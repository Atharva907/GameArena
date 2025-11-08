"use client";

import { CartProvider } from '@/components/ui/Cart';

export default function ShopLayout({ children }) {
  console.log('ShopLayout: Rendering layout with CartProvider at', new Date().toISOString());

  // Check if localStorage has cart data
  const savedCart = typeof window !== 'undefined' ? localStorage.getItem('gameArenaCart') : null;
  console.log('ShopLayout: localStorage content:', savedCart);

  return (
    <CartProvider>
      {children}
    </CartProvider>
  );
}
