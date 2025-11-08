"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

const CartContext = createContext();

export const useCart = () => {
  console.log('useCart: Hook called');
  const context = useContext(CartContext);
  if (!context) {
    console.error('useCart: Context not found, component is not wrapped in CartProvider');
    throw new Error('useCart must be used within a CartProvider');
  }
  console.log('useCart: Context found with', context.cartItems.length, 'items');
  return context;
};

export const CartProvider = ({ children }) => {
  console.log('CartProvider: Initializing provider at', new Date().toISOString());

  // Initialize cart state with localStorage data if available
  const getInitialCart = () => {
    console.log('CartProvider: Getting initial cart from localStorage');
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('gameArenaCart');
      console.log('CartProvider: localStorage content:', savedCart);

      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          console.log('CartProvider: Successfully parsed initial cart items:', parsedCart);
          return parsedCart;
        } catch (error) {
          console.error('CartProvider: Error parsing initial cart data:', error);
          console.log('CartProvider: Clearing corrupted localStorage data');
          localStorage.removeItem('gameArenaCart');
        }
      }
    }
    console.log('CartProvider: No initial cart data found, returning empty array');
    return [];
  };

  const [cartItems, setCartItems] = useState(getInitialCart);

  // No need to load from localStorage on mount since we initialize state directly

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    console.log('CartProvider: useEffect triggered for saving cart items');
    console.log('CartProvider: Current cart items:', cartItems);
    console.log('CartProvider: Cart items count:', cartItems.length);

    if (cartItems.length > 0) {
      console.log('CartProvider: Saving non-empty cart to localStorage');
      localStorage.setItem('gameArenaCart', JSON.stringify(cartItems));
      console.log('CartProvider: Cart saved to localStorage');
    } else {
      console.log('CartProvider: Cart is empty, checking if we should clear localStorage');
      const savedCart = localStorage.getItem('gameArenaCart');
      if (savedCart) {
        console.log('CartProvider: Clearing empty cart from localStorage');
        localStorage.removeItem('gameArenaCart');
      }
    }
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    console.log('CartProvider: addToCart called with product:', product.name, 'quantity:', quantity);

    setCartItems(prevItems => {
      console.log('CartProvider: Current cart items before adding:', prevItems);
      const existingItem = prevItems.find(item => item._id === product._id);

      let updatedItems;
      if (existingItem) {
        console.log('CartProvider: Product already exists in cart, updating quantity');
        updatedItems = prevItems.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        console.log('CartProvider: Adding new product to cart');
        updatedItems = [...prevItems, { ...product, quantity }];
      }

      console.log('CartProvider: Updated cart items:', updatedItems);
      return updatedItems;
    });
  };

  const removeFromCart = (productId) => {
    console.log('CartProvider: removeFromCart called with productId:', productId);

    setCartItems(prevItems => {
      console.log('CartProvider: Current cart items before removing:', prevItems);
      const itemToRemove = prevItems.find(item => item._id === productId);

      if (itemToRemove) {
        console.log('CartProvider: Removing item from cart:', itemToRemove.name);
      } else {
        console.log('CartProvider: Item not found in cart with ID:', productId);
      }

      const updatedItems = prevItems.filter(item => item._id !== productId);
      console.log('CartProvider: Updated cart items after removal:', updatedItems);
      return updatedItems;
    });
  };

  const updateQuantity = (productId, quantity) => {
    console.log('CartProvider: updateQuantity called with productId:', productId, 'quantity:', quantity);

    if (quantity <= 0) {
      console.log('CartProvider: Quantity is 0 or less, removing item from cart');
      removeFromCart(productId);
    } else {
      setCartItems(prevItems => {
        console.log('CartProvider: Current cart items before updating quantity:', prevItems);
        const itemToUpdate = prevItems.find(item => item._id === productId);

        if (itemToUpdate) {
          console.log('CartProvider: Updating quantity for item:', itemToUpdate.name, 'from', itemToUpdate.quantity, 'to', quantity);
        } else {
          console.log('CartProvider: Item not found in cart with ID:', productId);
        }

        const updatedItems = prevItems.map(item =>
          item._id === productId ? { ...item, quantity } : item
        );

        console.log('CartProvider: Updated cart items after quantity change:', updatedItems);
        return updatedItems;
      });
    }
  };

  const clearCart = () => {
    console.log('CartProvider: clearCart called');
    setCartItems(prevItems => {
      console.log('CartProvider: Current cart items before clearing:', prevItems);
      console.log('CartProvider: Clearing all items from cart');
      return [];
    });
  };

  const getTotalItems = () => {
    const total = cartItems.reduce((total, item) => total + item.quantity, 0);
    console.log('CartProvider: getTotalItems calculated:', total, 'from', cartItems.length, 'items');
    return total;
  };

  const getTotalPrice = () => {
    const total = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    console.log('CartProvider: getTotalPrice calculated:', total, 'from', cartItems.length, 'items');
    return total;
  };

  const contextValue = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
  };

  console.log('CartProvider: Providing context with', cartItems.length, 'items');

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const CartIcon = () => {
  console.log('CartIcon: Component rendering');
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();
  console.log('CartIcon: Total items in cart:', totalItems);

  return (
    <Link href="/shop/cart">
      <Button
        variant="ghost"
        size="icon"
        className="relative text-white"
      >
        <ShoppingCart className="h-5 w-5" />
        {totalItems > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-purple-600">
            {totalItems > 99 ? '99+' : totalItems}
          </Badge>
        )}
      </Button>
    </Link>
  );
};
