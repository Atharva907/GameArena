"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Package, PencilLine, Sparkles, Trash2, Warehouse } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AdminEmptyState,
  AdminMetric,
  AdminPanel,
  AdminStatusBadge,
  adminGhostButtonClass,
  adminTableWrapClass,
} from "@/components/Application/Admin/AdminUi";
import { showToast } from "@/lib/showToast";
import { apiFetch } from "@/lib/apiClient";

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const response = await apiFetch("/products");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data.products || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteProduct(id) {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await apiFetch(`/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      showToast("success", "Product deleted successfully");
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      showToast("error", "Failed to delete product");
    }
  }

  const metrics = useMemo(() => {
    const featuredProducts = products.filter((product) => product.isFeatured).length;
    const totalStock = products.reduce((sum, product) => sum + (product.inStock || 0), 0);
    const lowStock = products.filter((product) => (product.inStock || 0) <= 5).length;

    return { featuredProducts, totalStock, lowStock };
  }, [products]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <AdminMetric
          label="Products"
          value={products.length}
          detail="Catalog items currently available"
          icon={Package}
          accent="from-sky-500/20 via-sky-500/5 to-transparent"
        />
        <AdminMetric
          label="Featured"
          value={metrics.featuredProducts}
          detail="Products highlighted in premium surfaces"
          icon={Sparkles}
          accent="from-fuchsia-500/20 via-fuchsia-500/5 to-transparent"
        />
        <AdminMetric
          label="Total stock"
          value={metrics.totalStock}
          detail={`${metrics.lowStock} products at low stock threshold`}
          icon={Warehouse}
          accent="from-emerald-500/20 via-emerald-500/5 to-transparent"
        />
      </section>

      <AdminPanel
        title="Product inventory"
        description="Review pricing, category mapping, stock levels, and featured visibility from one standard table."
      >
        {loading ? (
          <div className="py-12 text-sm text-muted-foreground">Loading products...</div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
            Error: {error}
          </div>
        ) : products.length === 0 ? (
          <AdminEmptyState
            title="No products yet"
            description="Add the first product to start building a clean catalog for the storefront."
            action={
              <Button asChild className="rounded-full bg-emerald-600 text-white hover:bg-emerald-500">
                <Link href="/admin/products/new">Create Product</Link>
              </Button>
            }
          />
        ) : (
          <>
            <div className={`hidden lg:block ${adminTableWrapClass}`}>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            className="size-12 rounded-2xl object-cover ring-1 ring-border/60"
                            src={product.image}
                            alt={product.name}
                          />
                          <div className="min-w-0">
                            <p className="font-medium">{product.name}</p>
                            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{product.category?.name || product.category || "N/A"}</TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.inStock}</TableCell>
                      <TableCell>
                        <AdminStatusBadge status={product.isFeatured ? "featured" : "regular"}>
                          {product.isFeatured ? "Featured" : "Standard"}
                        </AdminStatusBadge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="outline" size="sm" className={adminGhostButtonClass}>
                            <Link href={`/admin/products/${product._id}/edit`}>
                              <PencilLine className="size-4" />
                              <span className="hidden sm:inline">Edit</span>
                            </Link>
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-full border-rose-500/20 bg-rose-500/5 text-rose-700 hover:bg-rose-500/10 hover:text-rose-700 dark:text-rose-300 dark:hover:text-rose-200"
                            onClick={() => handleDeleteProduct(product._id)}
                          >
                            <Trash2 className="size-4" />
                            <span className="hidden sm:inline">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="grid gap-4 lg:hidden">
              {products.map((product) => (
                <div
                  key={`${product._id}-mobile`}
                  className="rounded-[24px] border border-border/60 bg-muted/20 p-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      className="size-16 rounded-[20px] object-cover ring-1 ring-border/60"
                      src={product.image}
                      alt={product.name}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {product.category?.name || product.category || "N/A"}
                          </p>
                        </div>
                        <AdminStatusBadge status={product.isFeatured ? "featured" : "regular"}>
                          {product.isFeatured ? "Featured" : "Standard"}
                        </AdminStatusBadge>
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {product.description}
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Price</p>
                          <p className="font-medium">${product.price.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Stock</p>
                          <p className="font-medium">{product.inStock}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button asChild variant="outline" className="flex-1 rounded-full">
                      <Link href={`/admin/products/${product._id}/edit`}>Edit</Link>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 rounded-full border-rose-500/20 bg-rose-500/5 text-rose-700 dark:text-rose-300"
                      onClick={() => handleDeleteProduct(product._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </AdminPanel>
    </div>
  );
}
