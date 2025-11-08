"use client";

import { useCart } from '@/components/ui/Cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

const CartPageContent = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();

  const handleCheckout = () => {
    // Navigate to checkout page
    window.location.href = '/shop/checkout';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-800/80 backdrop-blur-md border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/shop" className="text-gray-400 hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <Link href="/" className="text-xl font-bold text-white">
                GameArena
              </Link>
              <span className="text-gray-400">/</span>
              <h1 className="text-xl font-bold text-white">Shopping Cart</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700 text-center py-12">
            <CardContent>
              <ShoppingCart className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">Your cart is empty</h3>
              <p className="text-gray-400 mb-4">Add some products to get started</p>
              <Link href="/shop">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(item => (
                <Card key={item._id} className="bg-slate-800 border-slate-700 text-white">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-slate-700">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-2">
                          <h3 className="text-lg font-medium text-white">{item.name}</h3>
                          {/* REMOVED: Individual item price to prevent 'count' confusion and keep subtotal as the focus */}
                          {/* <p className="text-lg font-bold text-white">{formatCurrency(item.price)}</p> */}
                        </div>
                        <p className="text-sm text-gray-400 mb-4">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 border-slate-600 text-white hover:bg-slate-700"
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-sm w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 border-slate-600 text-white hover:bg-slate-700"
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* RESTORED: Subtotal display */}
                            <span className="text-sm text-gray-400 mr-2">Subtotal:</span>
                            <span className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-pink-500 hover:text-pink-400 ml-2" 
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
              <Card className="bg-slate-800 border-slate-700 text-white sticky top-24">
                <CardHeader>
                  <CardTitle className="text-xl">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal</span>
                    <span>{formatCurrency(getTotalPrice())}</span>
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
                    <span>{formatCurrency(getTotalPrice())}</span>
                  </div>
                  <div className="space-y-2 pt-4">
                    <Button
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      onClick={handleCheckout}
                    >
                      Proceed to Checkout
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-slate-600 text-white hover:bg-slate-700"
                      onClick={clearCart}
                    >
                      Clear Cart
                    </Button>
                    <Link href="/shop">
                      <Button
                        variant="ghost"
                        className="w-full text-gray-400 hover:text-white"
                      >
                        Continue Shopping
                      </Button>
                    </Link>
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