'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Refresh products list
        fetchProducts();
        alert('Product deleted successfully');
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Failed to delete product');
      }
    }
  }

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold">All Products</h2>
        <Link 
          href="/admin/products/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md w-full sm:w-auto text-center"
        >
          Add New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-yellow-50 p-4 rounded-md text-yellow-800">
          No products found. Add your first product to get started.
        </div>
      ) : (
        <>
          {/* Desktop view - Table */}
          <div className="hidden lg:block w-full overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Featured
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full object-cover" src={product.image} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.category?.name || product.category || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${product.price.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.inStock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.isFeatured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.isFeatured ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/products/${product._id}/edit`} className="text-indigo-600 hover:text-indigo-900 mr-3">
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="text-red-600 hover:text-red-900"
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
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <div className="flex items-start space-x-4">
                  <img 
                    className="h-16 w-16 rounded-lg object-cover flex-shrink-0" 
                    src={product.image} 
                    alt={product.name} 
                  />
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <h3 className="text-lg font-medium text-gray-900 break-words">{product.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2 break-words">{product.description}</p>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Category:</span>
                        <span className="ml-1 text-gray-900">{product.category?.name || product.category || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Price:</span>
                        <span className="ml-1 text-gray-900">${product.price.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Stock:</span>
                        <span className="ml-1 text-gray-900">{product.inStock}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Featured:</span>
                        <span className={`ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.isFeatured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.isFeatured ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex space-x-2">
                      <Link 
                        href={`/admin/products/${product._id}/edit`} 
                        className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 px-4 rounded-md text-center font-medium transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 py-2 px-4 rounded-md font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
