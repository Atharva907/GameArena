"use client";

import { Suspense } from "react";
import ProductsList from "./ProductsList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { AdminHeader, AdminPage, adminPrimaryButtonClass } from "@/components/Application/Admin/AdminUi";

export default function ProductsPage() {
  return (
    <AdminPage className="mx-0 max-w-none">
      <AdminHeader
        eyebrow="Products"
        title="Manage the merchandise catalog"
        description="Keep product information, stock, and featured visibility aligned with a simple, consistent admin layout."
        chips={["Catalog", "Inventory", "Featured products"]}
        actions={
          <Button asChild className={adminPrimaryButtonClass}>
            <Link href="/admin/products/new">
              <Plus className="size-4" />
              Add Product
            </Link>
          </Button>
        }
      />

      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading products...</div>}>
        <ProductsList />
      </Suspense>
    </AdminPage>
  );
}
