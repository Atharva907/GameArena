'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteCategory(id) {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await fetch(`/api/categories/${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to delete category');
        }

        // Refresh categories list
        fetchCategories();
        alert('Category deleted successfully');
      } catch (err) {
        console.error('Error deleting category:', err);
        alert(err.message || 'Failed to delete category');
      }
    }
  }

  if (loading) return <div>Loading categories...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6 scrollbar-hide">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Categories Management</h1>
        <Link
          href="/admin/categories/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md w-full sm:w-auto text-center"
        >
          Add New Category
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="bg-yellow-50 p-4 rounded-md text-yellow-800">
          No categories found. Add your first category to get started.
        </div>
      ) : (
        <>
          {/* Desktop view - Table */}
          <div className="hidden lg:block w-full overflow-hidden rounded-lg shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{category.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 truncate max-w-xs">{category.description || 'No description'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-indigo-600">{category.productCount || 0}</span>
                        <span className="ml-1 text-sm text-gray-500">products</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        category.isFeatured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {category.isFeatured ? 'Featured' : 'Regular'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/categories/${category._id}/edit`} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2">
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteCategory(category._id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile view - Cards */}
          <div className="lg:hidden space-y-4">
            {categories.map((category) => (
              <div key={category._id} className="bg-white rounded-lg shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    category.isFeatured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {category.isFeatured ? 'Featured' : 'Regular'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2 break-words">{category.description || 'No description provided'}</p>

                <div className="mt-4 bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Products in this category:</span>
                    <span className="text-lg font-bold text-indigo-600">{category.productCount || 0}</span>
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  <Link 
                    href={`/admin/categories/${category._id}/edit`} 
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-md text-center font-medium transition-colors shadow-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteCategory(category._id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-md font-medium transition-colors shadow-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
