import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, Check, Eye } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/components/ui/Cart';
import Link from 'next/link';

const ProductCard = ({ product }) => {
  console.log('ProductCard: Component rendering for product:', product.name);
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    console.log('ProductCard: Add to cart clicked for product:', product.name);
    console.log('ProductCard: Product details:', JSON.stringify(product));

    // Check if localStorage has cart data
    const savedCart = typeof window !== 'undefined' ? localStorage.getItem('gameArenaCart') : null;
    console.log('ProductCard: localStorage content before adding:', savedCart);

    addToCart(product);
    console.log('ProductCard: Product added to cart:', product.name);
    
    // Set button to "Added" state
    setIsAdded(true);
    
    // Reset button state after 2 seconds
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  // Custom formatter for Indian Rupee
  const formatINR = (amount) => {
    return `₹${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  return (
    <Card className="bg-slate-800 border-slate-700 text-white overflow-hidden hover:border-purple-500/50 transition-all duration-300 group">
      <div className="relative overflow-hidden h-48">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.isFeatured && (
          <Badge className="absolute top-2 left-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            Featured
          </Badge>
        )}
        {product.inStock <= 5 && product.inStock > 0 && (
          <Badge className="absolute top-2 right-2 bg-orange-600 text-white">
            Only {product.inStock} left
          </Badge>
        )}
        {product.inStock === 0 && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <Badge className="bg-red-600 text-white text-lg px-3 py-1">Out of Stock</Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-white group-hover:text-purple-400 transition-colors">
            {product.name}
          </h3>
        </div>
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-white">{formatINR(product.price)}</span>
          <Button
            size="sm"
            className={`${
              isAdded
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            } transition-all duration-300`}
            disabled={product.inStock === 0 || isAdded}
            onClick={handleAddToCart}
          >
            {isAdded ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Added
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-1" />
                Add
              </>
            )}
          </Button>
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-600/20"
        >
          <Link href={`/shop/${product._id}`}>
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
