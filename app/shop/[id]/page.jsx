"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Star, ArrowLeft, Check, Package, Truck, Shield, Heart, Share2, ZoomIn } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/components/ui/Cart';

// Custom formatter for Indian Rupee
const formatINR = (amount) => {
  return `₹${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

const ProductDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdded, setIsAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${params.id}`);

        if (!response.ok) {
          throw new Error('Product not found');
        }

        const data = await response.json();
        setProduct(data.product);
      } catch (error) {
        console.error('Error fetching product:', error);
        router.push('/shop');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id, router]);

  const handleAddToCart = () => {
    if (product) {
      // Add the product with the selected quantity
      const productWithQuantity = { ...product, quantity };
      addToCart(productWithQuantity);

      // Set button to "Added" state
      setIsAdded(true);

      // Reset button state after 2 seconds
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (product && quantity < product.inStock) {
      setQuantity(quantity + 1);
    }
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    // Here you would implement actual wishlist functionality
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <p className="text-white">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-6 text-6xl">🔍</div>
          <h2 className="text-2xl font-bold text-white mb-4">Product Not Found</h2>
          <p className="text-gray-400 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/shop')} className="bg-gradient-to-r from-purple-600 to-pink-600">
            Back to Shop
          </Button>
        </div>
      </div>
    );
  }

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
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.back()}
                className="text-white hover:bg-slate-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Link href="/" className="text-xl font-bold text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                GameArena
              </Link>
              <span className="text-gray-400">/</span>
              <Link href="/shop" className="text-xl font-bold text-white hover:text-purple-400 transition-colors">
                Shop
              </Link>
              <span className="text-gray-400">/</span>
              <h1 className="text-xl font-bold text-white truncate max-w-xs md:max-w-md">{product.name}</h1>
            </div>
            <div className="flex items-center gap-5">
              <Button variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-600/20">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Link href="/shop/cart">
                <Button variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-600/20">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Cart
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg border border-slate-700 bg-slate-800/50 group">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ZoomIn className="h-5 w-5" />
              </Button>
            </div>
            {/* Additional images could be added here if available */}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                <h1 className="text-3xl font-bold text-white">{product.name}</h1>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleWishlist}
                    className={`border-purple-500/50 ${isWishlisted ? 'text-red-500' : 'text-purple-300'} hover:bg-purple-600/20`}
                  >
                    <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  </Button>
                  {product.isFeatured && (
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                      Featured
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating || 0)
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-400 text-sm">
                  {product.rating || 0} ({product.reviews || 0} reviews)
                </span>
              </div>
              <p className="text-gray-300 mb-6">{product.description}</p>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#00FFAA]">{formatINR(product.price)}</span>
              {product.oldPrice && (
                <span className="text-xl text-gray-500 line-through">{formatINR(product.oldPrice)}</span>
              )}
              {product.oldPrice && (
                <Badge className="bg-green-600 text-white">
                  {Math.round((1 - product.price / product.oldPrice) * 100)}% OFF
                </Badge>
              )}
            </div>

            <div className="space-y-4">
              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {product.inStock > 0 ? (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-green-400">
                      In Stock ({product.inStock} available)
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-red-400">Out of Stock</span>
                  </>
                )}
              </div>

              {/* Category */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Category:</span>
                <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                  {product.category?.name || 'Uncategorized'}
                </Badge>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-white">Quantity:</span>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="border-slate-600 text-white hover:bg-slate-700"
                >
                  -
                </Button>
                <span className="w-12 text-center text-white">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={increaseQuantity}
                  disabled={quantity >= product.inStock}
                  className="border-slate-600 text-white hover:bg-slate-700"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={product.inStock === 0 || isAdded}
              className={`w-full py-3 ${
                isAdded
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gradient-to-r from-[#00FFAA] to-[#4F46E5] text-[#0B0F19] font-bold hover:shadow-[0_0_20px_rgba(0,255,170,0.5)]"
              } transition-all duration-300`}
            >
              {isAdded ? (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>

            {/* Product Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
              <div className="flex flex-col items-center gap-2 text-gray-300 p-3 rounded-lg bg-slate-800/50">
                <Package className="h-6 w-6 text-purple-400" />
                <span className="text-sm text-center">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-gray-300 p-3 rounded-lg bg-slate-800/50">
                <Truck className="h-6 w-6 text-purple-400" />
                <span className="text-sm text-center">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-gray-300 p-3 rounded-lg bg-slate-800/50">
                <Shield className="h-6 w-6 text-purple-400" />
                <span className="text-sm text-center">Secure Payment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <Card className="bg-slate-800/80 backdrop-blur-md border-slate-700/50 shadow-xl">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Product Details</h2>
              <div className="text-gray-300 space-y-2">
                {product.details?.map((detail, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-purple-400">•</span>
                    <span>{detail}</span>
                  </div>
                )) || (
                  <p>No additional details available for this product.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
