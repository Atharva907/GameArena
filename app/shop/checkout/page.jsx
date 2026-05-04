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
import { apiFetch } from '@/lib/apiClient';

const CheckoutContent = () => {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { auth } = useAuth();
  const router = useRouter();
  const checkoutPath = "/shop/checkout";
  const loginHref = "/auth/login?callback=" + encodeURIComponent("/shop/checkout");
  const [sessionUser, setSessionUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionErrorMessage, setSessionErrorMessage] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletStatusMessage, setWalletStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [validationItems, setValidationItems] = useState([]);
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  const total = getTotalPrice();
  const checkoutEmail = auth?.email || sessionUser?.email;

  useEffect(() => {
    let isMounted = true;

    const fetchSessionUser = async () => {
      try {
        const response = await apiFetch('/user/me');
        const data = await response.json().catch(() => ({}));
        if (response.ok && isMounted) {
          setSessionUser(data.data || data);
          setSessionErrorMessage("");
        } else if (response.status === 401 || response.status === 403) {
          router.replace(loginHref);
          return;
        } else if (isMounted) {
          setSessionErrorMessage(
            data.error || 'Unable to verify your session right now. Please try again later.',
          );
        }
      } catch (error) {
        console.error('Error checking checkout session:', error);
        if (isMounted) {
          setSessionErrorMessage('Unable to verify your session right now. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setCheckingSession(false);
        }
      }
    };

    fetchSessionUser();

    return () => {
      isMounted = false;
    };
  }, [router, loginHref]);

  useEffect(() => {
    let isMounted = true;

    const fetchWalletBalance = async () => {
      if (!checkoutEmail) {
        if (isMounted) {
          setWalletLoading(false);
          setWalletStatusMessage('');
        }
        return;
      }

      try {
        setWalletLoading(true);
        const response = await apiFetch(`/wallet?email=${encodeURIComponent(checkoutEmail)}`);
        const data = await response.json().catch(() => ({}));

        if (response.ok && isMounted) {
          setWalletBalance(Number(data.balance ?? data.walletBalance ?? 0));
          setWalletStatusMessage('');
        } else if (isMounted) {
          setWalletBalance(0);
          setWalletStatusMessage(
            data.error || 'Complete your dashboard profile and add wallet balance before placing an order.',
          );
        }
      } catch (error) {
        console.error('Error fetching wallet balance for checkout:', error);
        if (isMounted) {
          setWalletBalance(0);
          setWalletStatusMessage('Failed to load wallet balance.');
        }
      } finally {
        if (isMounted) {
          setWalletLoading(false);
        }
      }
    };

    if (!checkingSession) {
      fetchWalletBalance();
    }

    return () => {
      isMounted = false;
    };
  }, [checkoutEmail, checkingSession]);

  const validateCart = async () => {
    const response = await apiFetch('/cart/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: cartItems.map(item => ({
          productId: item._id,
          quantity: item.quantity
        }))
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to validate cart');
    }

    setValidationItems(data.items || []);

    if (!data.valid) {
      throw new Error('Some cart items are unavailable or have insufficient stock.');
    }

    return data;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!checkoutEmail) {
      router.push(loginHref);
      return;
    }

    setCheckoutError('');

    try {
      if (walletStatusMessage && walletStatusMessage.toLowerCase().includes('profile')) {
        setCheckoutError(walletStatusMessage);
        return;
      }

      if (walletBalance < total) {
        setCheckoutError(
          `Your wallet balance is ${formatCurrency(walletBalance)}. Add ${formatCurrency(
            total - walletBalance,
          )} or more to place this order.`,
        );
        return;
      }

      setIsSubmitting(true);
      await validateCart();

      const orderItems = cartItems.map(item => ({
        productId: item._id,
        quantity: item.quantity
      }));

      const response = await apiFetch('/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerEmail: checkoutEmail,
          items: orderItems,
          shippingAddress,
          idempotencyKey:
            typeof crypto !== 'undefined' && crypto.randomUUID
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random()}`
        }),
      });

      if (response.ok) {
        const order = await response.json();
        clearCart();
        router.push(`/dashboard/orders?success=${order._id}`);
      } else {
        const errorData = await response.json();
        console.error('CheckoutContent: Order failed:', errorData);
        const errorMessage = errorData.error || 'Unknown error';
        setCheckoutError(
          errorMessage.includes('Player not found')
            ? 'Complete your dashboard profile and add wallet balance before placing an order.'
            : `Order failed: ${errorMessage}`,
        );
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setCheckoutError(error.message || 'Error placing order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-slate-800 border-slate-700 text-center py-12">
          <CardContent>
            <h3 className="text-xl font-medium text-white mb-2">Checking session...</h3>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (sessionErrorMessage) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-slate-800 border-slate-700 text-center py-12">
          <CardContent className="space-y-4">
            <h3 className="text-xl font-medium text-white">Checkout unavailable</h3>
            <p className="text-gray-400">{sessionErrorMessage}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600">
                <Link href={loginHref}>Sign In</Link>
              </Button>
              <Button asChild variant="outline" className="border-slate-600 text-white">
                <Link href="/shop">Return to Shop</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                {checkoutError && (
                  <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {checkoutError}
                  </div>
                )}

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
                  disabled={
                    isSubmitting ||
                    (checkoutEmail ? walletLoading || walletBalance < total || Boolean(walletStatusMessage) : false)
                  }
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
                <div className="bg-slate-700/50 p-3 rounded-lg space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                      Wallet Payment
                    </Badge>
                    <span className="text-sm text-gray-400">
                      {checkoutEmail
                        ? walletLoading
                          ? 'Checking wallet balance...'
                          : `Balance: ${formatCurrency(walletBalance)}`
                        : 'Sign in to place the order through wallet payment'}
                    </span>
                  </div>

                  {checkoutEmail && !walletLoading && walletBalance < total && !walletStatusMessage && (
                    <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                      You need {formatCurrency(total - walletBalance)} more to place this order.
                    </div>
                  )}

                  {walletStatusMessage && (
                    <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                      {walletStatusMessage}
                    </div>
                  )}

                  {checkoutEmail &&
                    !walletLoading &&
                    walletStatusMessage &&
                    walletStatusMessage.toLowerCase().includes('profile') && (
                      <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                        <Link href={`/dashboard/my-account?callback=${encodeURIComponent(checkoutPath)}`}>
                          Create Profile
                        </Link>
                      </Button>
                    )}

                  {checkoutEmail && !walletLoading && walletBalance < total && !walletStatusMessage && (
                    <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                      <Link href={`/dashboard/wallet?callback=${encodeURIComponent(checkoutPath)}`}>
                        Add Funds
                      </Link>
                    </Button>
                  )}
                </div>
                {validationItems.some(item => !item.valid) && (
                  <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-100">
                    {validationItems
                      .filter(item => !item.valid)
                      .map(item => `${item.name || item.productId}: ${item.reason}`)
                      .join(' ')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const CheckoutPage = () => {
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
