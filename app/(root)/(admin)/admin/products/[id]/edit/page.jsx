import { notFound } from "next/navigation";
import ProductForm from "../../ProductForm";
import {
  AdminBackLink,
  AdminHeader,
  AdminPage,
} from "@/components/Application/Admin/AdminUi";
import { serverApiFetch } from "@/lib/serverApiClient";

export default async function EditProductPage({ params }) {
  const { id } = await params;

  const response = await serverApiFetch(`/products/${id}`);

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("Failed to load product");
  }

  const data = await response.json();
  const product = data.product;

  return (
    <AdminPage className="mx-0 max-w-none">
      <AdminHeader
        eyebrow="Edit Product"
        title={`Update ${product.name}`}
        description="Refine pricing, stock, category mapping, and imagery without leaving the standardized product workflow."
        chips={["Catalog", "Inventory", "Edit flow"]}
        actions={<AdminBackLink href="/admin/products">Back to Products</AdminBackLink>}
      />

      <ProductForm product={product} />
    </AdminPage>
  );
}
