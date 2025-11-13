
'use client';

import { CheckoutForm } from '../../components/checkout/checkout-form';

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Checkout
          </h1>
          <p className="text-lg text-gray-600">
            Complete your order with cash on delivery
          </p>
        </div>

        <CheckoutForm />
      </div>
    </div>
  );
}
