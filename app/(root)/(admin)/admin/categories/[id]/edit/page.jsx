
import { notFound } from 'next/navigation';
import EditCategoryForm from './EditCategoryForm';
import { serverApiFetch } from '@/lib/serverApiClient';

// Server component to fetch category data
export default async function EditCategoryPage({ params }) {
  const { id } = await params;

  const response = await serverApiFetch(`/categories/${id}`);

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("Failed to load category");
  }

  const data = await response.json();

  return <EditCategoryForm category={data.category} />;
}
