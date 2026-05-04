"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  Grid,
  List,
  Search,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductCard from "@/components/ui/ProductCard";
import { CartIcon } from "@/components/ui/Cart";
import { apiFetch } from "@/lib/apiClient";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const formatINR = (amount) => currencyFormatter.format(Number(amount || 0));

const ShopPageContent = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState("grid");
  const [categories, setCategories] = useState([{ value: "all", label: "All Categories" }]);
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
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm && searchTerm.length > 0) {
      const suggestions = products
        .filter((product) => {
          const name = product.name || "";
          return name.toLowerCase().includes(searchTerm.toLowerCase());
        })
        .slice(0, 5)
        .map((product) => product.name);

      setSearchSuggestions(suggestions);
      setShowSuggestions(true);
      return;
    }

    setSearchSuggestions([]);
    setShowSuggestions(false);
  }, [searchTerm, products]);

  const showNotification = (productName) => {
    setNotification(`${productName} added to cart`);
    window.setTimeout(() => {
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

      const productsResponse = await apiFetch("/products");
      const productsData = await productsResponse.json();
      setProducts(productsData.products || []);

      const categoriesResponse = await apiFetch("/categories");
      const categoriesData = await categoriesResponse.json();

      if (categoriesData.success) {
        const dynamicCategories = categoriesData.categories.map((category) => ({
          value: category._id,
          label: category.name,
        }));
        setCategories([{ value: "all", label: "All Categories" }, ...dynamicCategories]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let result = [...products];

    if (searchTerm) {
      result = result.filter((product) => {
        const name = product.name || "";
        const description = product.description || "";
        return (
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    if (selectedCategory !== "all") {
      result = result.filter((product) => {
        if (!product.category) return false;
        const categoryId = product.category._id || product.category;
        return categoryId === selectedCategory;
      });
    }

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name":
        result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "featured":
      default:
        result.sort((a, b) => {
          if (a.isFeatured === b.isFeatured) return 0;
          return a.isFeatured ? -1 : 1;
        });
    }

    setFilteredProducts(result);
  };

  const hasFilters =
    searchTerm || selectedCategory !== "all" || sortBy !== "featured" || viewMode !== "grid";

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSortBy("featured");
    setViewMode("grid");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      {notification && (
        <div className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-600 px-4 py-2 text-sm text-white shadow-lg dark:border-emerald-900">
          <CheckCircle className="h-4 w-4" />
          <span>{notification}</span>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="truncate text-lg font-semibold tracking-tight text-foreground">
              GameArena
            </Link>
            <span className="text-muted-foreground">/</span>
            <h1 className="truncate text-lg font-semibold tracking-tight text-foreground">
              Shop
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <CartIcon />
            <Button
              asChild
              variant="outline"
              className="h-9 rounded-lg border-border/70 bg-background px-3 text-sm text-foreground hover:bg-accent"
            >
              <Link href="/auth/login?callback=%2Fshop">Login</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Card className="gap-0 border-border/70 bg-background/95 py-0 shadow-sm">
          <CardHeader className="gap-1.5 px-4 py-4 pb-0 sm:px-5">
            <CardTitle className="text-base font-semibold tracking-tight">
              Browse catalog
            </CardTitle>
            <CardDescription className="text-sm">
              Search products, narrow by category, and switch between grid or list views.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1" ref={searchRef}>
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="h-10 border-border/70 bg-background pl-10 text-sm text-foreground placeholder:text-muted-foreground"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                />

                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-border/70 bg-background/95 shadow-lg backdrop-blur">
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={`${suggestion}-${index}`}
                        type="button"
                        className="block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-accent"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:w-auto lg:grid-cols-[220px_220px_auto]">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-10 w-full border-border/70 bg-background text-sm text-foreground lg:w-[220px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="z-50 border-border/70 bg-background text-foreground shadow-lg">
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-10 w-full border-border/70 bg-background text-sm text-foreground lg:w-[220px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="z-50 border-border/70 bg-background text-foreground shadow-lg">
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>

                <div className="inline-flex h-10 overflow-hidden rounded-lg border border-border/70 bg-background p-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    className={`h-8 w-8 rounded-md border-0 ${
                      viewMode === "grid"
                        ? "bg-sky-600 text-white hover:bg-sky-500"
                        : "bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                    aria-label="Grid view"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className={`h-8 w-8 rounded-md border-0 ${
                      viewMode === "list"
                        ? "bg-sky-600 text-white hover:bg-sky-500"
                        : "bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"} shown
              </p>
              {hasFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 justify-start px-2 text-sm text-muted-foreground hover:text-foreground sm:justify-center"
                  onClick={resetFilters}
                >
                  Reset filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                : "space-y-4"
            }
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={showNotification}
                formatCurrency={formatINR}
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          <Card className="gap-0 border-border/70 bg-background/95 py-0 text-center shadow-sm">
            <CardContent className="space-y-4 py-14">
              <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  No products found
                </h3>
                <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground">
                  Try adjusting your search, category, or sort options.
                </p>
              </div>
              <Button onClick={resetFilters} className="bg-sky-600 text-white hover:bg-sky-500">
                Reset filters
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default function ShopPage() {
  return <ShopPageContent />;
}
