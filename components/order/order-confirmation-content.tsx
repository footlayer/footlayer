
'use client';

import { useSearchParams } from 'next/navigation';
import { OrderConfirmation } from './order-confirmation';

export function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');

  if (!orderNumber) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Order</h1>
          <p className="text-gray-600">No order number provided.</p>
        </div>
      </div>
    );
  }

  return <OrderConfirmation orderNumber={orderNumber} />;
}
