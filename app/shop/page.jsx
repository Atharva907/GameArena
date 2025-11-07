"use client";

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ui/ProductCard';
import { CartIcon, CartProvider } from '@/components/ui/Cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ShoppingCart, Filter, Grid, List } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

const ShopPage = () => {
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

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, sortBy]);

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

    // Filter by search term
    if (searchTerm) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(product => {
        // Handle both string ID and object with _id
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
        result.sort((a, b) => a.name.localeCompare(b.name));
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

  // Categories are now fetched dynamically from the API

  return (
    <CartProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-slate-800/80 backdrop-blur-md border-b border-slate-700">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/" className="text-xl font-bold text-white">
                  GameArena
                </Link>
                <span className="text-gray-400">/</span>
                <h1 className="text-xl font-bold text-white">Shop</h1>
              </div>
              <div className="flex items-center gap-2">
                <CartIcon />
                <Link href="/auth/login">
                  <Button variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-600/20">
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Search and filters */}
          <Card className="bg-slate-800 border-slate-700 mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full md:w-48 bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {categories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full md:w-48 bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex bg-slate-700 rounded-md border border-slate-600">
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

          {/* Featured products banner */}
          <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/30 mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Featured Products</h2>
                  <p className="text-gray-300">Check out our latest gaming gear and exclusive merchandise</p>
                </div>
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 text-sm">
                  New Arrivals
                </Badge>
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
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <Card className="bg-slate-800 border-slate-700 text-center py-12">
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
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </CartProvider>
  );
};

export default ShopPage;
