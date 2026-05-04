"use client";

import { CartProvider } from "@/components/ui/Cart";

export default function ShopLayout({ children }) {
  return <CartProvider>{children}</CartProvider>;
}
