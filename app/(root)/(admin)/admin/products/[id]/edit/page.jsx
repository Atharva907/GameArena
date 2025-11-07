import { notFound } from 'next/navigation';
import ProductForm from '../../ProductForm';

async function getProduct(id) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/products/${id}`, { cache: "no-store" });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const productData = await getProduct(id);

  if (!productData) {
    notFound();
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <ProductForm product={productData} />
    </div>
  );
}
