"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Layers3, PencilLine, Plus, Star, Trash2 } from "lucide-react";
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
  AdminHeader,
  AdminMetric,
  adminDangerButtonClass,
  adminMobileCardClass,
  AdminPage,
  AdminPanel,
  AdminStatusBadge,
  adminGhostButtonClass,
  adminPrimaryButtonClass,
  adminTableWrapClass,
} from "@/components/Application/Admin/AdminUi";
import { showToast } from "@/lib/showToast";
import { apiFetch } from "@/lib/apiClient";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      setLoading(true);
      const response = await apiFetch("/categories");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCategories(data.categories || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteCategory(id) {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      const response = await apiFetch(`/categories/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete category");
      }

      showToast("success", data.message || "Category deleted successfully");
      fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
      showToast("error", err.message || "Failed to delete category");
    }
  }

  const metrics = useMemo(() => {
    const featuredCategories = categories.filter((category) => category.isFeatured).length;
    const totalProducts = categories.reduce(
      (sum, category) => sum + (category.productCount || 0),
      0,
    );

    return {
      totalCategories: categories.length,
      featuredCategories,
      totalProducts,
    };
  }, [categories]);

  return (
    <AdminPage className="mx-0 max-w-none">
      <AdminHeader
        eyebrow="Categories"
        title="Organize the storefront taxonomy"
        description="Manage category structure with a simple standard layout, restrained color palette, and clear visibility into featured sections and product counts."
        chips={["Store taxonomy", "Featured sections", "Responsive list"]}
        actions={
          <Button asChild className={adminPrimaryButtonClass}>
            <Link href="/admin/categories/new">
              <Plus className="size-4" />
              Add Category
            </Link>
          </Button>
        }
      />

      <section className="grid gap-3 md:grid-cols-3">
        <AdminMetric
          label="Categories"
          value={metrics.totalCategories}
          detail="Active storefront groupings"
          icon={Layers3}
          accent="from-sky-500/20 via-sky-500/5 to-transparent"
        />
        <AdminMetric
          label="Featured"
          value={metrics.featuredCategories}
          detail="Highlighted for extra visibility"
          icon={Star}
          accent="from-fuchsia-500/20 via-fuchsia-500/5 to-transparent"
        />
        <AdminMetric
          label="Linked products"
          value={metrics.totalProducts}
          detail="Products assigned across categories"
          icon={Layers3}
          accent="from-emerald-500/20 via-emerald-500/5 to-transparent"
        />
      </section>

      <AdminPanel
        title="Category management"
        description="Edit descriptions, review product counts, and keep the storefront taxonomy clean."
      >
        {loading ? (
          <div className="py-12 text-sm text-muted-foreground">Loading categories...</div>
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[13px] text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            Error: {error}
          </div>
        ) : categories.length === 0 ? (
          <AdminEmptyState
            title="No categories yet"
            description="Create the first category to start organizing the storefront into clear, manageable sections."
            action={
              <Button asChild className={adminPrimaryButtonClass}>
                <Link href="/admin/categories/new">Create Category</Link>
              </Button>
            }
          />
        ) : (
          <>
            <div className={`hidden lg:block ${adminTableWrapClass}`}>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Category</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground md:hidden">
                            {category.description || "No description"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden max-w-sm md:table-cell">
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {category.description || "No description"}
                        </p>
                      </TableCell>
                      <TableCell className="font-medium">{category.productCount || 0}</TableCell>
                      <TableCell>
                        <AdminStatusBadge status={category.isFeatured ? "featured" : "regular"}>
                          {category.isFeatured ? "Featured" : "Regular"}
                        </AdminStatusBadge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="outline" size="sm" className={adminGhostButtonClass}>
                            <Link href={`/admin/categories/${category._id}/edit`}>
                              <PencilLine className="size-4" />
                              <span className="hidden sm:inline">Edit</span>
                            </Link>
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className={adminDangerButtonClass}
                            onClick={() => handleDeleteCategory(category._id)}
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

            <div className="mt-6 grid gap-4 lg:hidden">
              {categories.map((category) => (
                <div
                  key={`${category._id}-mobile`}
                  className={adminMobileCardClass}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium">{category.name}</h3>
                      <p className="mt-2 text-[13px] leading-5 text-muted-foreground">
                        {category.description || "No description"}
                      </p>
                    </div>
                    <AdminStatusBadge status={category.isFeatured ? "featured" : "regular"}>
                      {category.isFeatured ? "Featured" : "Regular"}
                    </AdminStatusBadge>
                  </div>

                  <div className="mt-3 text-[13px] text-muted-foreground">
                    {category.productCount || 0} products linked
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Button asChild variant="outline" className="flex-1 rounded-lg text-[13px]">
                      <Link href={`/admin/categories/${category._id}/edit`}>Edit</Link>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className={`flex-1 ${adminDangerButtonClass}`}
                      onClick={() => handleDeleteCategory(category._id)}
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
    </AdminPage>
  );
}
