"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Heart,
  Package,
  Share2,
  Shield,
  ShoppingCart,
  Star,
  Truck,
  ZoomIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/components/ui/Cart";
import { apiFetch } from "@/lib/apiClient";
import { showToast } from "@/lib/showToast";

const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

const ProductDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdded, setIsAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await apiFetch(`/products/${params.id}`);

        if (!response.ok) {
          throw new Error("Product not found");
        }

        const data = await response.json();
        setProduct(data.product);
      } catch (error) {
        console.error("Error fetching product:", error);
        router.push("/shop");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id, router]);

  const handleAddToCart = () => {
    if (!product) {
      return;
    }

    addToCart(product, quantity);
    setIsAdded(true);

    window.setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: product?.name || "GameArena product",
          text: product?.description || "Check out this product on GameArena.",
          url: shareUrl,
        });
        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        showToast("success", "Product link copied");
      }
    } catch (error) {
      console.error("Unable to share product:", error);
    }
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    if (product) {
      setQuantity((current) => Math.min(current + 1, Number(product.inStock || 1)));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
        <div className="flex min-h-screen items-center justify-center px-4">
          <Card className="gap-0 border-border/70 bg-background/95 py-0 shadow-sm">
            <CardContent className="space-y-3 px-6 py-10 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
              <p className="text-sm text-muted-foreground">Loading product details...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
        <div className="flex min-h-screen items-center justify-center px-4">
          <Card className="gap-0 border-border/70 bg-background/95 py-0 shadow-sm">
            <CardContent className="space-y-4 px-6 py-10 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl border border-border/70 bg-muted/30">
                <ZoomIn className="size-5 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold tracking-tight">Product not found</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  The item you are looking for does not exist or has been removed.
                </p>
              </div>
              <Button asChild className="bg-sky-600 text-white hover:bg-sky-500">
                <Link href="/shop">Back to Shop</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const rating = Number(product.rating || 0);
  const selectedPrice = formatINR(product.price);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/shop")}
              className="h-9 w-9 rounded-lg text-foreground hover:bg-accent"
              aria-label="Back to shop"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="min-w-0 text-sm sm:text-base">
              <div className="flex min-w-0 items-center gap-2">
                <Link href="/" className="truncate font-semibold tracking-tight text-foreground">
                  GameArena
                </Link>
                <span className="text-muted-foreground">/</span>
                <Link href="/shop" className="truncate font-semibold tracking-tight text-foreground">
                  Shop
                </Link>
                <span className="text-muted-foreground">/</span>
                <h1 className="truncate font-semibold tracking-tight text-foreground">
                  {product.name}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={handleShare}
              className="h-9 rounded-lg border-border/70 bg-background px-3 text-sm text-foreground hover:bg-accent"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button asChild variant="outline" className="h-9 rounded-lg border-border/70 bg-background px-3 text-sm text-foreground hover:bg-accent">
              <Link href="/shop/cart">
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Cart</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <Card className="gap-0 overflow-hidden border-border/70 bg-background/95 py-0 shadow-sm">
            <div className="relative aspect-square overflow-hidden border-b border-border/70 bg-muted/40">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-4 h-10 w-10 rounded-lg border-border/70 bg-background/90 text-foreground shadow-sm backdrop-blur hover:bg-accent"
                aria-label="Zoom image"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              {product.isFeatured && (
                <Badge className="absolute left-4 top-4 border-0 bg-sky-600 text-white shadow-sm">
                  Featured
                </Badge>
              )}
            </div>

            <CardContent className="space-y-4 px-4 py-4 sm:px-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2">
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Stock
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {product.inStock > 0 ? `${product.inStock} available` : "Out of stock"}
                  </p>
                </div>
                <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2">
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Category
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {product.category?.name || "Uncategorized"}
                  </p>
                </div>
                <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2">
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Availability
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    Wallet checkout
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border/70 bg-muted/20 px-4 py-3">
                <p className="text-sm font-medium text-muted-foreground">Product note</p>
                <p className="mt-1 text-sm leading-6 text-foreground">
                  Standard storefront item designed for wallet-based checkout and fast
                  fulfillment inside the GameArena shop.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="gap-0 overflow-hidden border-border/70 bg-background/95 py-0 shadow-sm">
            <CardHeader className="gap-2 px-4 py-4 pb-0 sm:px-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">
                    {product.name}
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {product.category?.name || "Store item"}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsWishlisted((current) => !current)}
                  className={`h-10 w-10 rounded-lg border-border/70 bg-background ${
                    isWishlisted ? "text-rose-600 hover:bg-rose-50" : "text-foreground hover:bg-accent"
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 px-4 py-4 sm:px-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      className={`h-4 w-4 ${
                        index < Math.floor(rating) ? "fill-current" : "text-slate-300 dark:text-slate-700"
                      }`}
                    />
                  ))}
                </div>
                <span>
                  {rating.toFixed(1)} ({product.reviews || 0} reviews)
                </span>
              </div>

              <p className="text-sm leading-6 text-muted-foreground">
                {product.description}
              </p>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-semibold tracking-tight text-emerald-700 dark:text-emerald-400">
                  {selectedPrice}
                </span>
                {product.oldPrice && (
                  <>
                    <span className="text-sm text-muted-foreground line-through">
                      {formatINR(product.oldPrice)}
                    </span>
                    <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                      {Math.round((1 - product.price / product.oldPrice) * 100)}% OFF
                    </Badge>
                  </>
                )}
              </div>

              <div className="space-y-3 rounded-lg border border-border/70 bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-sm">
                  {product.inStock > 0 ? (
                    <>
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      <span className="text-emerald-700 dark:text-emerald-400">
                        In stock ({product.inStock} available)
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                      <span className="text-rose-700 dark:text-rose-300">Out of stock</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Category</span>
                  <Badge variant="outline" className="border-border/70 bg-background text-foreground">
                    {product.category?.name || "Uncategorized"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-foreground">Quantity</span>
                <div className="inline-flex items-center rounded-lg border border-border/70 bg-background p-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className="h-8 w-8 rounded-md text-foreground hover:bg-accent"
                  >
                    -
                  </Button>
                  <span className="w-10 text-center text-sm font-medium text-foreground">
                    {quantity}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={increaseQuantity}
                    disabled={quantity >= product.inStock}
                    className="h-8 w-8 rounded-md text-foreground hover:bg-accent"
                  >
                    +
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={product.inStock === 0 || isAdded}
                className={`h-11 w-full rounded-lg text-sm font-medium text-white shadow-sm transition ${
                  isAdded
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : "bg-sky-600 hover:bg-sky-500"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="h-4 w-4" />
                    Added to cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    Add to cart
                  </>
                )}
              </Button>

              <Separator className="bg-border/70" />

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="h-4 w-4 text-sky-600" />
                  <span>Free shipping</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="h-4 w-4 text-sky-600" />
                  <span>Fast delivery</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-sky-600" />
                  <span>Secure payment</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="px-4 pb-4 pt-0 sm:px-5">
              <Button
                asChild
                variant="outline"
                className="h-10 w-full rounded-lg border-border/70 bg-background text-foreground hover:bg-accent"
              >
                <Link href="/shop">Continue shopping</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ProductDetailPage;
