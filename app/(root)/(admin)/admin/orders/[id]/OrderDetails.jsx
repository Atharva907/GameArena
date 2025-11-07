'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OrderDetails({ orderId }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  async function fetchOrder() {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/orders/${orderId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setOrder(data);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(status) {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedOrder = await response.json();
      setOrder(updatedOrder);
      alert('Order status updated successfully');
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  }

  if (loading) return <div>Loading order details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!order) return <div>Order not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Order #{order._id.substring(0, 8)}</h2>
        <Link
          href="/admin/orders"
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Orders
        </Link>
      </div>

      <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-4">Order Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Order Date</p>
            <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <div className="flex items-center space-x-2">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                order.status === 'shipped' ? 'bg-yellow-100 text-yellow-800' :
                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {order.status || 'pending'}
              </span>
              <select
                value={order.status || 'pending'}
                onChange={(e) => handleUpdateStatus(e.target.value)}
                disabled={isUpdating}
                className="text-sm border border-gray-300 rounded-md py-1 px-2"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Payment Status</p>
            <p className="font-medium capitalize">{order.paymentStatus || 'pending'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="font-medium">${order.totalAmount.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-4">Customer Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">{order.player?.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{order.player?.email || 'N/A'}</p>
          </div>
          {order.shippingAddress && (
            <>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Shipping Address</p>
                <p className="font-medium">
                  {order.shippingAddress?.street || order.shippingAddress?.address || ''}
                  {order.shippingAddress?.street || order.shippingAddress?.address ? ', ' : ''}
                  {order.shippingAddress?.city || ''}
                  {order.shippingAddress?.city ? ', ' : ''}
                  {order.shippingAddress?.state || ''}
                  {order.shippingAddress?.state ? ', ' : ''}
                  {order.shippingAddress?.zipCode || ''}
                  {order.shippingAddress?.zipCode ? ', ' : ''}
                  {order.shippingAddress?.country || ''}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-4">Order Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full object-cover" src={item.product?.image || '/placeholder.png'} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.product?.name || 'Unknown Product'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${item.price.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.quantity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${(item.price * item.quantity).toFixed(2)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="px-6 py-4 text-right font-medium">
                  Total:
                </td>
                <td className="px-6 py-4 font-medium">
                  ${order.totalAmount.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
