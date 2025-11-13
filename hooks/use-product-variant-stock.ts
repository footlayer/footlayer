import { useState, useEffect, useCallback } from 'react';

interface VariantStockInfo {
  inStock: boolean;
  quantity: number;
  availableQuantity: number;
  reservedQuantity: number;
}

interface StockMatrix {
  [size: string]: {
    [color: string]: VariantStockInfo;
  };
}

interface ProductStockData {
  productId: string;
  productName: string;
  sizes: string[];
  colors: string[];
  overallInStock: boolean;
  stockMatrix: StockMatrix;
}

interface UseProductVariantStockReturn {
  stockData: ProductStockData | null;
  loading: boolean;
  error: string | null;
  getVariantStock: (size: string, color: string) => VariantStockInfo;
  isVariantInStock: (size: string, color: string) => boolean;
  getAvailableSizes: (color: string) => string[];
  getAvailableColors: (size: string) => string[];
  refetch: () => Promise<void>;
}

export function useProductVariantStock(productId: string | null): UseProductVariantStockReturn {
  const [stockData, setStockData] = useState<ProductStockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStockData = useCallback(async () => {
    if (!productId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/products/${productId}/stock`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch variant stock');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setStockData(data);
    } catch (err) {
      console.error('Error fetching variant stock:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const getVariantStock = useCallback((size: string, color: string): VariantStockInfo => {
    if (!stockData || !stockData.stockMatrix[size] || !stockData.stockMatrix[size][color]) {
      return {
        inStock: false,
        quantity: 0,
        availableQuantity: 0,
        reservedQuantity: 0
      };
    }

    return stockData.stockMatrix[size][color];
  }, [stockData]);

  const isVariantInStock = useCallback((size: string, color: string): boolean => {
    return getVariantStock(size, color).inStock;
  }, [getVariantStock]);

  const getAvailableSizes = useCallback((color: string): string[] => {
    if (!stockData) return [];

    return stockData.sizes.filter(size => {
      const variantStock = getVariantStock(size, color);
      return variantStock.inStock;
    });
  }, [stockData, getVariantStock]);

  const getAvailableColors = useCallback((size: string): string[] => {
    if (!stockData) return [];

    return stockData.colors.filter(color => {
      const variantStock = getVariantStock(size, color);
      return variantStock.inStock;
    });
  }, [stockData, getVariantStock]);

  useEffect(() => {
    fetchStockData();
  }, [fetchStockData]);

  return {
    stockData,
    loading,
    error,
    getVariantStock,
    isVariantInStock,
    getAvailableSizes,
    getAvailableColors,
    refetch: fetchStockData
  };
}
