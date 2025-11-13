
import { Suspense } from 'react';
import { OrderConfirmationContent } from '../../components/order/order-confirmation-content';
import { Loading } from '../../components/ui/loading';

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<Loading text="Loading order details..." />}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
