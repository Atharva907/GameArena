"use client";

import { useState, useEffect, useRef } from 'react';
import ProductCard from '@/components/ui/ProductCardNew';
import { CartIcon } from '@/components/ui/Cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ShoppingCart, Filter, Grid, List, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

// Custom formatter for Indian Rupee
const formatINR = (amount) => {
  return `₹${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

const ShopPageContent = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');
  const [categories, setCategories] = useState([
    { value: 'all', label: 'All Categories' }
  ]);
  const [notification, setNotification] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, sortBy]);

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Generate search suggestions
    if (searchTerm && searchTerm.length > 0) {
      const suggestions = products
        .filter(product => {
          const name = product.name || '';
          return name.toLowerCase().includes(searchTerm.toLowerCase());
        })
        .slice(0, 5) // Limit to 5 suggestions
        .map(product => product.name);
      
      setSearchSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, products]);

  const showNotification = (productName) => {
    setNotification(`${productName} added to cart!`);
    setTimeout(() => {
      setNotification(null);
    }, 2000);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch products
      const productsResponse = await fetch('/api/products');
      const productsData = await productsResponse.json();
      setProducts(productsData.products || []);

      // Fetch categories
      const categoriesResponse = await fetch('/api/categories');
      const categoriesData = await categoriesResponse.json();

      if (categoriesData.success) {
        const dynamicCategories = categoriesData.categories.map(cat => ({
          value: cat._id,
          label: cat.name
        }));
        setCategories([{ value: 'all', label: 'All Categories' }, ...dynamicCategories]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let result = [...products];

    // Filter by search term - Fixed to handle potential undefined values
    if (searchTerm) {
      result = result.filter(product => {
        const name = product.name || '';
        const description = product.description || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               description.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(product => {
        // Handle both string ID and object with _id
        if (!product.category) return false;
        const categoryId = product.category._id || product.category;
        return categoryId === selectedCategory;
      });
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'featured':
      default:
        result.sort((a, b) => {
          if (a.isFeatured === b.isFeatured) return 0;
          return a.isFeatured ? -1 : 1;
        });
    }

    setFilteredProducts(result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
          <CheckCircle className="h-5 w-5" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-800/80 backdrop-blur-md border-b border-slate-700 shadow-lg shadow-black/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                GameArena
              </Link>
              <span className="text-gray-400">/</span>
              <h1 className="text-xl font-bold text-white">Shop</h1>
            </div>
            <div className="flex items-center gap-5">
              <CartIcon/>
              <Link href="/auth/login">
                <Button variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-600/20">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Search and filters */}
        <Card className="bg-slate-800/80 backdrop-blur-md border-slate-700/50 mb-8 shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1" ref={searchRef}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                />
                {/* Search suggestions dropdown */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-slate-700/95 backdrop-blur-md border border-slate-600 rounded-md shadow-xl z-10 max-h-60 overflow-y-auto">
                    {searchSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 hover:bg-slate-600 cursor-pointer text-white"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-48 bg-slate-700/50 border-slate-600 text-white focus:border-purple-500/50">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700/95 backdrop-blur-md border-slate-600">
                    {categories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-48 bg-slate-700/50 border-slate-600 text-white focus:border-purple-500/50">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700/95 backdrop-blur-md border-slate-600">
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex bg-slate-700/50 rounded-md border border-slate-600">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    className="rounded-r-none"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    className="rounded-l-none"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className={
            viewMode === 'grid'
              ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              : "space-y-4"
          }>
            {filteredProducts.map(product => (
              <ProductCard 
                key={product._id} 
                product={product} 
                onAddToCart={showNotification} 
                formatCurrency={formatINR} 
              />
            ))}
          </div>
        ) : (
          <Card className="bg-slate-800/80 backdrop-blur-md border-slate-700/50 text-center py-12 shadow-xl">
            <CardContent>
              <ShoppingCart className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No products found</h3>
              <p className="text-gray-400 mb-4">Try adjusting your search or filter criteria</p>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSortBy('featured');
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25"
              >
                Reset Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

const ShopPage = () => {
  return <ShopPageContent />;
};

export default ShopPage;
