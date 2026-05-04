"use client";

import ProductForm from "../ProductForm";
import {
  AdminBackLink,
  AdminHeader,
  AdminPage,
} from "@/components/Application/Admin/AdminUi";

export default function NewProductPage() {
  return (
    <AdminPage className="mx-0 max-w-none">
      <AdminHeader
        eyebrow="New Product"
        title="Add a new catalog item"
        description="Create a product with the same standard admin palette, simple field grouping, and responsive form layout used across the rest of the control panel."
        chips={["Catalog", "Inventory", "Media"]}
        actions={<AdminBackLink href="/admin/products">Back to Products</AdminBackLink>}
      />

      <ProductForm />
    </AdminPage>
  );
}
