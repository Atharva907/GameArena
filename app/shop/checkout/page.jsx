"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/components/ui/Cart';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const CheckoutContent = () => {
  console.log('CheckoutContent: Component rendering');
  const { cartItems, getTotalPrice, clearCart } = useCart();
  console.log('CheckoutContent: Cart items count:', cartItems.length);
  console.log('CheckoutContent: Cart items:', cartItems);
  const { auth } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  const total = getTotalPrice();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    console.log('CheckoutContent: Submitting order');
    e.preventDefault();

    if (!auth || !auth.email) {
      console.log('CheckoutContent: User not authenticated, redirecting to login');
      router.push('/auth/login');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems = cartItems.map(item => ({
        productId: item._id,
        quantity: item.quantity
      }));

      console.log('CheckoutContent: Order items:', orderItems);
      console.log('CheckoutContent: Shipping address:', shippingAddress);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerEmail: auth.email,
          items: orderItems,
          shippingAddress
        }),
      });

      if (response.ok) {
        const order = await response.json();
        console.log('CheckoutContent: Order created successfully:', order);
        clearCart();
        console.log('CheckoutContent: Cart cleared, redirecting to orders page');
        router.push(`/dashboard/orders?success=${order._id}`);
      } else {
        const errorData = await response.json();
        console.error('CheckoutContent: Order failed:', errorData);
        alert(`Order failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert(`Error placing order: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-slate-800 border-slate-700 text-center py-12">
          <CardContent>
            <h3 className="text-xl font-medium text-white mb-2">Your cart is empty</h3>
            <p className="text-gray-400 mb-4">Add some products to checkout</p>
            <Link href="/shop">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                Continue Shopping
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Shipping Information */}
        <div className="flex-1">
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      name="street"
                      value={shippingAddress.street}
                      onChange={handleInputChange}
                      required
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      required
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      name="state"
                      value={shippingAddress.state}
                      onChange={handleInputChange}
                      required
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={shippingAddress.zipCode}
                      onChange={handleInputChange}
                      required
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      value={shippingAddress.country}
                      onChange={handleInputChange}
                      required
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Place Order'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:w-96">
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item._id} className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-slate-700 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
                <Separator className="bg-slate-700" />
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="font-medium">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Shipping</span>
                  <span className="font-medium">Free</span>
                </div>
                <Separator className="bg-slate-700" />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total</span>
                  <span className="text-xl font-bold">{formatCurrency(total)}</span>
                </div>
                <div className="bg-slate-700/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                      Wallet Payment
                    </Badge>
                    <span className="text-sm text-gray-400">
                      Amount will be deducted from your wallet balance
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const CheckoutPage = () => {
  console.log('CheckoutPage: Component rendering');
  console.log('CheckoutPage: Page loaded at', new Date().toISOString());
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-800/80 backdrop-blur-md border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/shop" className="text-xl font-bold text-white">
              GameArena
            </Link>
            <span className="text-gray-400">/</span>
            <h1 className="text-xl font-bold text-white">Checkout</h1>
          </div>
        </div>
      </header>

      <CheckoutContent />
    </div>
  );
};

export default CheckoutPage;
