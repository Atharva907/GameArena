import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/databaseConnection';
import Product from '@/models/Product';
import ProductForm from '../../ProductForm';

export default async function EditProductPage({ params }) {
  const { id } = await params;
  await connectDB();

  const product = await Product.findById(id).populate('category');

  if (!product) {
    notFound();
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <ProductForm product={JSON.parse(JSON.stringify(product))} />
    </div>
  );
}
