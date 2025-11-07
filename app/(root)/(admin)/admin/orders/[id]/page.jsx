import { Suspense } from 'react';
import OrderDetails from './OrderDetails';

export default function OrderPage({ params }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Order Details</h1>
      <Suspense fallback={<div>Loading order details...</div>}>
        <OrderDetails orderId={params.id} />
      </Suspense>
    </div>
  );
}
