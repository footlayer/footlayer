
'use client';

import { CartContent } from '../../components/cart/cart-content';

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Shopping Cart
          </h1>
          <p className="text-lg text-gray-600">
            Review your items before checkout
          </p>
        </div>

        <CartContent />
      </div>
    </div>
  );
}
