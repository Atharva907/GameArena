"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AdminPanel,
  adminFieldClass,
  adminGhostButtonClass,
  adminPrimaryButtonClass,
  adminSelectClass,
  adminTextareaClass,
} from "@/components/Application/Admin/AdminUi";
import { showToast } from "@/lib/showToast";
import { apiFetch } from "@/lib/apiClient";

export default function ProductForm({ product = {} }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: product.name || "",
    description: product.description || "",
    price: product.price || "",
    category: product.category?._id || product.category || "",
    image: product.image || "",
    inStock: product.inStock || 0,
    isFeatured: product.isFeatured || false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [libraryImages, setLibraryImages] = useState([]);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiFetch("/categories");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load categories");
        }

        setCategories(data.categories || []);
      } catch (fetchError) {
        console.error("Error loading categories:", fetchError);
        setError(fetchError.message || "Error loading categories");
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = product._id ? `/products/${product._id}` : "/products";
      const method = product._id ? "PUT" : "POST";

      const response = await apiFetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          inStock: Number(formData.inStock),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to save product");
      }

      showToast("success", product._id ? "Product updated" : "Product created");
      router.push("/admin/products");
    } catch (submitError) {
      console.error("Error saving product:", submitError);
      setError(submitError.message);
      showToast("error", submitError.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const fetchLibraryImages = async () => {
    setImageLoading(true);

    try {
      const response = await apiFetch("/media/library");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details || errorData.error || "Failed to fetch images",
        );
      }

      const data = await response.json();
      setLibraryImages(data.resources || []);
      setShowImageSelector(true);
    } catch (fetchError) {
      console.error("Error fetching images:", fetchError);
      setError(`Failed to load images: ${fetchError.message}`);
      showToast("error", fetchError.message || "Failed to load images");
    } finally {
      setImageLoading(false);
    }
  };

  const selectImage = (imageUrl) => {
    setFormData((prev) => ({
      ...prev,
      image: imageUrl,
    }));
    setShowImageSelector(false);
  };

  return (
    <div className="flex w-full flex-col gap-6">
      {error && (
        <div className="rounded-[24px] border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <AdminPanel
          title="Product profile"
          description="Start with the product name, a short description, and the category mapping."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className={adminFieldClass}
                placeholder="Enter product name"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                required
                rows={5}
                value={formData.description}
                onChange={handleChange}
                className={`w-full ${adminTextareaClass}`}
                placeholder="Describe the product, key value, and positioning."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className={`w-full ${adminSelectClass}`}
                disabled={categoriesLoading}
              >
                <option value="">
                  {categoriesLoading ? "Loading categories..." : "Select a category"}
                </option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (INR)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className={adminFieldClass}
                placeholder="0.00"
              />
            </div>
          </div>
        </AdminPanel>

        <AdminPanel
          title="Inventory and visibility"
          description="Keep stock data and featured visibility aligned with the storefront."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="inStock">Stock Quantity</Label>
              <Input
                id="inStock"
                name="inStock"
                type="number"
                required
                min="0"
                value={formData.inStock}
                onChange={handleChange}
                className={adminFieldClass}
                placeholder="0"
              />
            </div>

            <div className="rounded-[24px] border border-border/60 bg-muted/20 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-emerald-500/10 p-2 text-emerald-500">
                  <Sparkles className="size-4" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isFeatured" className="text-sm font-medium">
                    Featured product
                  </Label>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Highlight this product in premium storefront placements.
                  </p>
                  <label className="flex items-center gap-3 pt-1 text-sm font-medium">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleChange}
                      className="size-4 rounded border-border/60"
                    />
                    Mark as featured
                  </label>
                </div>
              </div>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel
          title="Media"
          description="Attach the product image from ImageKit or paste a direct image URL."
        >
          <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className={adminFieldClass}
                placeholder="Paste image URL"
              />
              <Button
                type="button"
                onClick={fetchLibraryImages}
                disabled={imageLoading}
                className={`${adminPrimaryButtonClass} h-11 gap-2 px-5`}
              >
                {imageLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ImagePlus className="size-4" />
                    Open Library
                  </>
                )}
              </Button>
            </div>

            {formData.image && (
              <div className="overflow-hidden rounded-[24px] border border-border/60 bg-muted/20">
                <div className="relative aspect-[16/9] w-full max-w-2xl">
                  <img
                    src={formData.image}
                    alt="Product preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                    className="absolute right-3 top-3 rounded-full border border-white/15 bg-slate-950/70 px-3 py-1 text-sm text-white backdrop-blur transition hover:bg-slate-950/90"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        </AdminPanel>

        <div className="flex flex-col gap-3 border-t border-border/60 pt-6 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className={adminGhostButtonClass}
            onClick={() => router.push("/admin/products")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className={adminPrimaryButtonClass}>
            {loading ? "Saving..." : product._id ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>

      {showImageSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-5xl overflow-hidden rounded-[28px] border border-border/60 bg-background shadow-[0_28px_100px_-50px_rgba(15,23,42,0.9)]">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Select product artwork</h2>
                <p className="text-sm text-muted-foreground">
                  Choose an existing asset instead of pasting the URL manually.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className={adminGhostButtonClass}
                onClick={() => setShowImageSelector(false)}
              >
                Close
              </Button>
            </div>

            {libraryImages.length > 0 ? (
              <div className="grid max-h-[70vh] grid-cols-2 gap-4 overflow-y-auto p-5 sm:grid-cols-3 lg:grid-cols-4 sm:p-6">
                {libraryImages.map((image) => (
                  <button
                    key={image.fileId}
                    type="button"
                    className="group overflow-hidden rounded-[22px] border border-border/60 bg-muted/20 text-left transition hover:-translate-y-0.5 hover:border-foreground/15 hover:bg-muted/35"
                    onClick={() => selectImage(image.url || image.thumbnailUrl)}
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={image.url || image.thumbnailUrl}
                        alt={image.filePath || image.fileId}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="px-4 py-3">
                      <p className="line-clamp-1 text-sm font-medium text-foreground">
                        {image.filePath || image.fileId}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Click to use this image
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="px-6 py-12 text-center text-sm text-muted-foreground">
                No images found in the ImageKit library.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
