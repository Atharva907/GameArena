'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const response = await fetch('/api/admin/orders');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateOrderStatus(id, status) {
    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh orders list
      fetchOrders();
      alert('Order status updated successfully');
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status');
    }
  }

  async function handleDeleteOrder(id) {
    if (confirm('Are you sure you want to delete this order?')) {
      try {
        const response = await fetch(`/api/admin/orders/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Refresh orders list
        fetchOrders();
        alert('Order deleted successfully');
      } catch (err) {
        console.error('Error deleting order:', err);
        alert('Failed to delete order');
      }
    }
  }

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold">All Orders</h2>
      </div>

      {orders.length === 0 ? (
        <div className="bg-yellow-50 p-4 rounded-md text-yellow-800">
          No orders found.
        </div>
      ) : (
        <>
          {/* Desktop view - Table */}
          <div className="hidden lg:block w-full overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{order._id.substring(0, 8)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.player?.name || 'Guest'}</div>
                      <div className="text-sm text-gray-500">{order.player?.email || 'No email'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${order.totalAmount.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'shipped' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/orders/${order._id}`} className="text-indigo-600 hover:text-indigo-900 mr-3">
                        View
                      </Link>
                      <select
                        value={order.status || 'pending'}
                        onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                        className="text-sm border border-gray-300 rounded-md py-1 px-2 mr-3"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button
                        onClick={() => handleDeleteOrder(order._id)}
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
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Order #{order._id.substring(0, 8)}</h3>
                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'shipped' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status || 'pending'}
                  </span>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-900 font-medium">Customer: {order.player?.name || 'Guest'}</p>
                  <p className="text-sm text-gray-500">{order.player?.email || 'No email'}</p>
                  <p className="text-sm text-gray-900 font-medium mt-1">Total: ${order.totalAmount.toFixed(2)}</p>
                </div>

                <div className="flex space-x-2">
                  <Link
                    href={`/admin/orders/${order._id}`}
                    className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 px-4 rounded-md text-center font-medium transition-colors"
                  >
                    View
                  </Link>
                  <select
                    value={order.status || 'pending'}
                    onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                    className="flex-1 text-sm border border-gray-300 rounded-md py-2 px-4"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={() => handleDeleteOrder(order._id)}
                    className="bg-red-50 hover:bg-red-100 text-red-700 py-2 px-4 rounded-md font-medium transition-colors"
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
