'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    recentOrders: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch products count
      const productsRes = await fetch('/api/products');
      const productsData = await productsRes.json();

      // Initialize with default values
      let totalOrders = 0;
      let totalRevenue = 0;
      let totalUsers = 0;
      let recentOrders = [];
      let topProducts = [];

      // Try to fetch orders data (might not exist yet)
      try {
        const ordersRes = await fetch('/api/orders');
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          totalOrders = ordersData.orders?.length || 0;
          totalRevenue = ordersData.orders?.reduce((sum, order) => sum + order.totalAmount, 0) || 0;

          // Get recent orders (last 5)
          recentOrders = ordersData.orders?.slice(0, 5).map(order => ({
            id: order._id,
            customer: order.user?.name || 'Unknown',
            date: new Date(order.createdAt).toLocaleDateString(),
            amount: order.totalAmount,
            status: order.status
          })) || [];

          // Get top products (most sold)
          const productSales = {};
          ordersData.orders?.forEach(order => {
            order.items?.forEach(item => {
              if (!productSales[item.product]) {
                productSales[item.product] = { name: item.name, quantity: 0 };
              }
              productSales[item.product].quantity += item.quantity;
            });
          });

          topProducts = Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);
        }
      } catch (err) {
        console.log('Orders API not available yet:', err.message);
      }

      // Try to fetch users data (might not exist yet)
      try {
        const usersRes = await fetch('/api/users');
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          totalUsers = usersData.users?.length || 0;
        }
      } catch (err) {
        console.log('Users API not available yet:', err.message);
      }

      setStats({
        totalProducts: productsData.products?.length || 0,
        totalOrders,
        totalRevenue,
        totalUsers,
        recentOrders,
        topProducts
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
            <div className="ml-4 bg-blue-100 rounded-full p-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin/products" className="text-sm font-medium text-blue-600 hover:text-blue-500">View all products →</Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
            <div className="ml-4 bg-green-100 rounded-full p-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin/orders" className="text-sm font-medium text-green-600 hover:text-green-500">View all orders →</Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="ml-4 bg-yellow-100 rounded-full p-3">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin/analytics" className="text-sm font-medium text-yellow-600 hover:text-yellow-500">View analytics →</Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <div className="ml-4 bg-purple-100 rounded-full p-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin/users" className="text-sm font-medium text-purple-600 hover:text-purple-500">View all users →</Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
          </div>
          <div className="p-0">
            {stats.recentOrders.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {stats.recentOrders.map((order) => (
                  <li key={order.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate">Order #{order.id.substring(0, 8)}</p>
                        <p className="text-sm text-gray-500">{order.customer} • {order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">${order.amount.toFixed(2)}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No recent orders found
              </div>
            )}
          </div>
          {stats.recentOrders.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 text-right">
              <Link href="/admin/orders" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                View all orders →
              </Link>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Top Selling Products</h3>
          </div>
          <div className="p-0">
            {stats.topProducts.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {stats.topProducts.map((product, index) => (
                  <li key={index} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.quantity} units sold</p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No sales data available
              </div>
            )}
          </div>
          {stats.topProducts.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 text-right">
              <Link href="/admin/products" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                View all products →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
