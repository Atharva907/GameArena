"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  AdminBackLink,
  AdminHeader,
  AdminPage,
  AdminPanel,
  AdminSecurityNote,
  adminFieldClass,
  adminPrimaryButtonClass,
  adminTextareaClass,
} from "@/components/Application/Admin/AdminUi";
import { showToast } from "@/lib/showToast";
import { apiFetch } from "@/lib/apiClient";

const defaultFormData = {
  name: "",
  description: "",
  isFeatured: false,
};

export default function CategoryForm({
  category,
  mode = "create",
}) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    ...defaultFormData,
    name: category?.name || "",
    description: category?.description || "",
    isFeatured: category?.isFeatured || false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = mode === "edit";

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
    setError("");

    try {
      const response = await apiFetch(
        isEdit ? `/categories/${category._id}` : "/categories",
        {
          method: isEdit ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || `Failed to ${isEdit ? "update" : "create"} category`);
      }

      showToast("success", data.message || `Category ${isEdit ? "updated" : "created"} successfully`);
      router.push("/admin/categories");
      router.refresh();
    } catch (err) {
      setError(err.message);
      showToast("error", err.message || "Unable to save category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminPage className="mx-0 max-w-none">
      <AdminHeader
        eyebrow="Category"
        title={isEdit ? "Refine category details" : "Create a new category"}
        description={
          isEdit
            ? "Keep the storefront taxonomy clean with clear labels, short descriptions, and optional featured visibility."
            : "Add a category with a simple, standardized form so the storefront stays easy to browse and manage."
        }
        chips={["Simple form", "Standard palette", "Store taxonomy"]}
        actions={<AdminBackLink href="/admin/categories">Back to Categories</AdminBackLink>}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_340px] 2xl:grid-cols-[minmax(0,1.7fr)_360px]">
        <AdminPanel
          title={isEdit ? "Edit category" : "Category details"}
          description="Use a short name, a concise description, and only feature categories that deserve extra visibility."
        >
          {error && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[13px] text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className={adminFieldClass}
                placeholder="Enter category name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                className={`${adminTextareaClass} min-h-36`}
                placeholder="Explain what belongs in this category"
              />
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/25 p-3.5">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="isFeatured"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 rounded border-border text-slate-900 focus:ring-slate-500 dark:text-slate-100"
                />
                <div>
                  <Label htmlFor="isFeatured" className="text-[13px] font-medium">
                    Featured category
                  </Label>
                  <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
                    Featured categories get more visual emphasis across the storefront.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
              <Button asChild variant="outline" className="rounded-md">
                <Link href="/admin/categories">Cancel</Link>
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className={adminPrimaryButtonClass}
              >
                {loading
                  ? isEdit
                    ? "Updating..."
                    : "Creating..."
                  : isEdit
                    ? "Update Category"
                    : "Create Category"}
              </Button>
            </div>
          </form>
        </AdminPanel>

        <div className="space-y-5 xl:sticky xl:top-20 xl:self-start">
          <AdminSecurityNote />
          <AdminPanel title="Form guidance" description="Keep the category list tidy and predictable.">
            <div className="space-y-3 text-[13px] leading-5 text-muted-foreground">
              <p>Use singular, storefront-friendly names that are easy to scan.</p>
              <p>Descriptions should explain the grouping, not repeat the name.</p>
              <p>Feature only categories that need visibility on landing surfaces.</p>
            </div>
          </AdminPanel>
        </div>
      </div>
    </AdminPage>
  );
}
