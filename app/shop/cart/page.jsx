"use client";

import { useCart } from '@/components/ui/Cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, Package, CreditCard, Shield } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

const CartPageContent = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();

  const handleCheckout = () => {
    // Navigate to checkout page
    window.location.href = '/shop/checkout';
  };

  // Custom formatter for Indian Rupee
  const formatINR = (amount) => {
    return `₹${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-800/80 backdrop-blur-md border-b border-slate-700 shadow-lg shadow-black/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/shop" className="text-gray-400 hover:text-white transition-colors duration-300 p-2 rounded-lg hover:bg-slate-700/50">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <Link href="/" className="text-xl font-bold text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent transition-all duration-300 hover:from-purple-300 hover:to-pink-300">
                GameArena
              </Link>
              <span className="text-gray-400">/</span>
              <h1 className="text-xl font-bold text-white">Shopping Cart</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400 bg-slate-700/50 px-3 py-1 rounded-full">
              <ShoppingCart className="h-4 w-4" />
              <span>{cartItems.length} {cartItems.length === 1 ? "item" : "items"}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {cartItems.length === 0 ? (
          <Card className="bg-slate-800/80 backdrop-blur-md border-slate-700/50 text-center py-12 shadow-2xl overflow-hidden relative group hover:border-purple-500/30 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="relative z-10">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl"></div>
                <ShoppingCart className="h-16 w-16 text-gray-500 mx-auto relative" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Your cart is empty</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">Looks like you haven't added any games to your cart yet. Start shopping to fill it up!</p>
              <Link href="/shop">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 px-6 py-2.5 rounded-full">
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, index) => (
                <Card 
                  key={item._id} 
                  className="bg-slate-800/80 backdrop-blur-md border-slate-700/50 text-white overflow-hidden group hover:border-purple-500/30 transition-all duration-500 shadow-lg hover:shadow-xl hover:shadow-purple-500/10"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-slate-700 shadow-lg group-hover:shadow-purple-500/20 transition-all duration-500 transform group-hover:scale-105">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-2">
                          <h3 className="text-lg font-medium text-white group-hover:text-purple-300 transition-colors duration-300">{item.name}</h3>
                          {/* REMOVED: Individual item price to prevent 'count' confusion and keep subtotal as the focus */}
                          {/* <p className="text-lg font-bold text-white">{formatINR(item.price)}</p> */}
                        </div>
                        <p className="text-sm text-gray-400 mb-4">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 border-slate-600 text-black hover:bg-slate-700 hover:border-purple-500/50 transition-all duration-300"
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-sm w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 border-slate-600 text-black hover:bg-slate-700 hover:border-purple-500/50 transition-all duration-300"
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* RESTORED: Subtotal display */}
                            <span className="text-sm text-gray-400 mr-2">Subtotal:</span>
                            <span className="text-sm font-medium">{formatINR(item.price * item.quantity)}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-pink-500 hover:text-pink-400 hover:bg-pink-500/10 ml-2 transition-all duration-300"
                              onClick={() => removeFromCart(item._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="bg-slate-800/80 backdrop-blur-md border-slate-700/50 text-white sticky top-24 shadow-xl overflow-hidden group hover:border-purple-500/30 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative z-10 pb-4">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Package className="h-5 w-5 text-purple-400" />
                    </div>
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal</span>
                    <span>{formatINR(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tax</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <Separator className="bg-slate-700" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatINR(getTotalPrice())}</span>
                  </div>
                  <div className="space-y-2 pt-4">
                    <Button
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
                      onClick={handleCheckout}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Proceed to Checkout
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-slate-600 text-black hover:bg-slate-700 hover:border-purple-500/50 transition-all duration-300"
                      onClick={clearCart}
                    >
                      Clear Cart
                    </Button>
                    <Link href="/shop">
                      <Button
                        variant="ghost"
                        className="w-full text-gray-400 hover:text-white transition-colors duration-300"
                      >
                        Continue Shopping
                      </Button>
                    </Link>
                  </div>
                  
                  {/* Trust badges */}
                  <div className="pt-4 mt-4 border-t border-slate-700">
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        <span>Secure Checkout</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        <span>Fast Delivery</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CartPage = () => {
  return <CartPageContent />;
};

export default CartPage;
