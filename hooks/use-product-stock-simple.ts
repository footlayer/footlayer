import { useState, useEffect, useCallback, useRef } from 'react';

interface StockStatus {
  id: string;
  name: string;
  inStock: boolean;
  inventory?: {
    quantity: number;
    reservedQuantity: number;
    availableQuantity: number;
  } | null;
}

interface UseProductStockReturn {
  stockStatus: Record<string, StockStatus>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateStock: (productId: string, inStock: boolean) => void;
}

export function useProductStock(productIds: string[]): UseProductStockReturn {
  const [stockStatus, setStockStatus] = useState<Record<string, StockStatus>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedIdsRef = useRef<string>('');

  const updateStock = useCallback((productId: string, inStock: boolean) => {
    setStockStatus(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        inStock
      }
    }));
  }, []);

  useEffect(() => {
    const fetchStockStatus = async () => {
      if (productIds.length === 0) return;

      const sortedIds = [...productIds].sort();
      const idString = sortedIds.join(',');
      
      // Prevent duplicate requests for the same product IDs
      if (fetchedIdsRef.current === idString) {
        return;
      }

      fetchedIdsRef.current = idString;
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/products/stock?ids=${idString}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch stock status');
        }

        const data = await response.json();
        
        if (data.success) {
          setStockStatus(data.stockStatus);
        } else {
          throw new Error(data.error || 'Failed to fetch stock status');
        }
      } catch (err) {
        console.error('Error fetching stock status:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchStockStatus();
  }, [productIds.join(',')]); // Only depend on the joined string

  const refetch = useCallback(async () => {
    fetchedIdsRef.current = ''; // Reset to allow new fetch
    setStockStatus({}); // Clear current data to trigger new fetch
  }, []);

  return {
    stockStatus,
    loading,
    error,
    refetch,
    updateStock
  };
}

// Hook for single product stock
export function useSingleProductStock(productId: string | null): {
  stockStatus: StockStatus | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const {
    stockStatus,
    loading,
    error,
    refetch
  } = useProductStock(productId ? [productId] : []);

  return {
    stockStatus: productId ? stockStatus[productId] || null : null,
    loading,
    error,
    refetch
  };
}
