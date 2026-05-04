"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const getInitialCart = () => {
    if (typeof window === "undefined") {
      return [];
    }

    const savedCart = localStorage.getItem("gameArenaCart");
    if (!savedCart) {
      return [];
    }

    try {
      return JSON.parse(savedCart);
    } catch (error) {
      console.error("Error parsing cart data:", error);
      localStorage.removeItem("gameArenaCart");
      return [];
    }
  };

  const [cartItems, setCartItems] = useState(getInitialCart);

  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem("gameArenaCart", JSON.stringify(cartItems));
      return;
    }

    localStorage.removeItem("gameArenaCart");
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item._id === product._id);
      const stockLimit = Number(product.inStock || 99);
      const safeQuantity = Math.max(1, Number(quantity || 1));

      if (existingItem) {
        return prevItems.map((item) =>
          item._id === product._id
            ? {
                ...item,
                quantity: Math.min(item.quantity + safeQuantity, stockLimit),
                inStock: stockLimit,
              }
            : item
        );
      }

      return [...prevItems, { ...product, quantity: Math.min(safeQuantity, stockLimit) }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item._id !== productId)
    );
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === productId
          ? { ...item, quantity: Math.min(quantity, Number(item.inStock || 99)) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () =>
    cartItems.reduce((total, item) => total + item.quantity, 0);

  const getTotalPrice = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const CartIcon = () => {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <Button asChild variant="ghost" size="icon" className="relative text-foreground">
      <Link href="/shop/cart">
        <ShoppingCart className="h-5 w-5" />
        {totalItems > 0 && (
          <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 p-0 text-white">
            {totalItems > 99 ? "99+" : totalItems}
          </Badge>
        )}
      </Link>
    </Button>
  );
};
