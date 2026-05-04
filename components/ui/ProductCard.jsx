import React, { useState } from "react";
import Link from "next/link";
import { Check, Eye, Package, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/components/ui/Cart";
import { cn } from "@/lib/utils";

const formatINR = (amount) =>
  `Rs. ${Number(amount || 0)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

const ProductCard = ({ product, onAddToCart, formatCurrency, viewMode = "grid" }) => {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const isList = viewMode === "list";
  const currency = formatCurrency || formatINR;

  const handleAddToCart = () => {
    addToCart(product);
    onAddToCart?.(product.name);
    setIsAdded(true);

    window.setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  return (
    <Card
      className={cn(
        "gap-0 overflow-hidden border-border/70 bg-background/95 py-0 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md dark:hover:border-sky-800/60",
        isList && "md:grid md:grid-cols-[240px_minmax(0,1fr)]",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-muted/40",
          isList ? "aspect-[4/3] md:aspect-auto md:h-full" : "aspect-[4/3] border-b border-border/70",
        )}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Package className="size-10" />
          </div>
        )}

        {product.isFeatured && (
          <Badge className="absolute left-3 top-3 border-0 bg-sky-600 text-white shadow-sm">
            Featured
          </Badge>
        )}

        {product.inStock <= 5 && product.inStock > 0 && (
          <Badge className="absolute right-3 top-3 border-0 bg-amber-500 text-white shadow-sm">
            Only {product.inStock} left
          </Badge>
        )}

        {product.inStock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70">
            <Badge className="border-0 bg-slate-900 text-white shadow-sm">Out of stock</Badge>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-col">
        <CardHeader className="gap-1.5 px-4 pt-4 pb-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="truncate text-base font-semibold tracking-tight text-foreground">
                {product.name}
              </CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {product.category?.name || "Store item"}
              </p>
            </div>
            {product.isFeatured && !isList && (
              <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300">
                Top pick
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3 px-4 pt-3 pb-0">
          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
            {product.description}
          </p>

          <div className="flex items-center justify-between gap-3">
            <span className="text-lg font-semibold tracking-tight text-foreground">
              {currency(product.price)}
            </span>

            <Button
              size="sm"
              className={cn(
                "h-8 rounded-lg px-3 text-sm font-medium text-white shadow-sm",
                isAdded ? "bg-emerald-600 hover:bg-emerald-500" : "bg-sky-600 hover:bg-sky-500",
              )}
              disabled={product.inStock === 0 || isAdded}
              onClick={handleAddToCart}
            >
              {isAdded ? (
                <>
                  <Check className="h-4 w-4" />
                  Added
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  Add
                </>
              )}
            </Button>
          </div>
        </CardContent>

        <CardFooter className="px-4 pb-4 pt-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 w-full rounded-lg border-border/70 bg-background text-foreground hover:bg-accent"
          >
            <Link href={`/shop/${product._id}`}>
              <Eye className="h-4 w-4" />
              View details
            </Link>
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
};

export default ProductCard;
