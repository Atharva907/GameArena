import { Suspense } from 'react';
import OrdersList from './OrdersList';

export default function OrdersPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Orders Management</h1>
      <Suspense fallback={<div>Loading orders...</div>}>
        <OrdersList />
      </Suspense>
    </div>
  );
}
