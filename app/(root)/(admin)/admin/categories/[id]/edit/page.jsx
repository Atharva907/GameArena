
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/databaseConnection';
import Category from '@/models/Category';
import EditCategoryForm from './EditCategoryForm';

// Server component to fetch category data
export default async function EditCategoryPage({ params }) {
  const { id } = await params;
  await connectDB();

  const category = await Category.findById(id);

  if (!category) {
    notFound();
  }

  return <EditCategoryForm category={JSON.parse(JSON.stringify(category))} />;
}
