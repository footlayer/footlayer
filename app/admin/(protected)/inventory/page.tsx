'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Plus, Edit, Package, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Alert, AlertDescription } from '../../../../components/ui/alert';

interface Product {
  id: string;
  name: string;
  imageUrl: string;
  sizes: string[];
  colors: string[];
  inventoryItems: InventoryItem[];
  category?: { name: string };
}

interface InventoryItem {
  id: string;
  size: string;
  color: string;
  quantity: number;
}

interface InventoryMatrix {
  [size: string]: {
    [color: string]: number;
  };
}

interface PageProps {
  searchParams?: { q?: string; page?: string; limit?: string };
}

export default function InventoryPage({ searchParams }: PageProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [inventoryMatrix, setInventoryMatrix] = useState<InventoryMatrix>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams?.q || '');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchParams?.q || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams?.page || '1', 10));
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const limit = 9; // Same as products page
  const skip = (currentPage - 1) * limit;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, debouncedSearchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearchQuery) params.set('q', debouncedSearchQuery);
      params.set('page', currentPage.toString());
      params.set('limit', limit.toString());

      const response = await fetch(`/api/admin/products?${params.toString()}`, { cache: 'no-store' });
      const data = await response.json();
      
      if (response.ok) {
        // Fetch inventory for each product
        const productsWithInventory = await Promise.all(
          data.products.map(async (product: any) => {
            const inventoryResponse = await fetch(`/api/admin/inventory?productId=${product.id}`);
            const inventoryData = await inventoryResponse.json();
            
            return {
              ...product,
              inventoryItems: inventoryData.inventoryItems || []
            };
          })
        );
        
        setProducts(productsWithInventory);
        setTotalProducts(data.total || 0);
        setTotalPages(Math.max(Math.ceil((data.total || 0) / limit), 1));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const openInventoryDialog = (product: Product) => {
    setSelectedProduct(product);
    setError(null);
    setSuccess(null);
    
    // Initialize inventory matrix with current values
    const matrix: InventoryMatrix = {};
    product.sizes.forEach(size => {
      matrix[size] = {};
      product.colors.forEach(color => {
        const existingItem = product.inventoryItems.find(
          item => item.size === size && item.color === color
        );
        matrix[size][color] = existingItem ? existingItem.quantity : 0;
      });
    });
    
    setInventoryMatrix(matrix);
    setIsDialogOpen(true);
  };

  const updateInventoryQuantity = (size: string, color: string, quantity: number) => {
    setInventoryMatrix(prev => ({
      ...prev,
      [size]: {
        ...prev[size],
        [color]: Math.max(0, quantity)
      }
    }));
  };

  const saveInventory = async () => {
    if (!selectedProduct) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/admin/inventory/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          inventoryMatrix
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'Inventory updated successfully');
        setIsDialogOpen(false);
        fetchProducts(); // Refresh the data
      } else {
        setError(data.error || 'Failed to update inventory');
      }
    } catch (error) {
      console.error('Error saving inventory:', error);
      setError('Failed to save inventory');
    } finally {
      setSaving(false);
    }
  };

  const getTotalInventory = (product: Product) => {
    return product.inventoryItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getLowStockItems = (product: Product) => {
    return product.inventoryItems.filter(item => item.quantity <= 5 && item.quantity > 0);
  };

  const getOutOfStockItems = (product: Product) => {
    return product.inventoryItems.filter(item => item.quantity === 0);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
    // Update URL with search params
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    params.set('page', '1');
    router.push(`/admin/inventory?${params.toString()}`);
  };

  const buildHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (debouncedSearchQuery) params.set('q', debouncedSearchQuery);
    params.set('page', String(nextPage));
    return `/admin/inventory?${params.toString()}`;
  };

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Manage stock levels for all products</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-amber-50 text-left text-gray-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Total Stock</th>
                <th className="px-4 py-3 font-semibold">Low Stock</th>
                <th className="px-4 py-3 font-semibold">Out of Stock</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const totalInventory = getTotalInventory(product);
                const lowStockItems = getLowStockItems(product);
                const outOfStockItems = getOutOfStockItems(product);
                
                return (
                  <tr key={product.id} className="border-t">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 bg-gray-50 rounded overflow-hidden">
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500">
                            {product.sizes.length} sizes × {product.colors.length} colors
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{product.category?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs border-amber-200 text-amber-700">
                        <Package className="w-3 h-3 mr-1" />
                        {totalInventory}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {lowStockItems.length > 0 ? (
                        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                          {lowStockItems.length} items
                        </Badge>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {outOfStockItems.length > 0 ? (
                        <Badge variant="destructive" className="text-xs">
                          {outOfStockItems.length} items
                        </Badge>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {totalInventory === 0 ? (
                        <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                      ) : lowStockItems.length > 0 ? (
                        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">Low Stock</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-amber-700 border-amber-200">In Stock</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Button
                        onClick={() => openInventoryDialog(product)}
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Manage
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Page {currentPage} of {totalPages} • {totalProducts} total
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            disabled={!hasPrev}
            onClick={() => hasPrev && router.push(buildHref(currentPage - 1))}
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            disabled={!hasNext}
            onClick={() => hasNext && router.push(buildHref(currentPage + 1))}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Inventory Management Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Manage Inventory - {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-6">
              {/* Product Info Header */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="relative w-24 h-24 bg-white rounded-lg overflow-hidden border-2 border-gray-200">
                  <Image
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-900">{selectedProduct.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{selectedProduct.category?.name}</p>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-xs">
                      {selectedProduct.sizes.length} Sizes
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {selectedProduct.colors.length} Colors
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {selectedProduct.sizes.length * selectedProduct.colors.length} Variants
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Inventory Matrix */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-lg text-gray-900">Stock Management</h4>
                  <div className="text-sm text-gray-600">
                    Total Stock: <span className="font-medium text-amber-600">
                      {Object.values(inventoryMatrix).reduce((total, sizeObj) => 
                        total + Object.values(sizeObj).reduce((sum, qty) => sum + qty, 0), 0
                      )}
                    </span>
                  </div>
                </div>

                {/* Responsive Grid for Inventory */}
                <div className="grid gap-4">
                  {selectedProduct.sizes.map((size) => (
                    <div key={size} className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-semibold text-gray-900 text-lg">Size {size}</h5>
                        <Badge variant="secondary" className="text-xs">
                          {selectedProduct.colors.reduce((total, color) => 
                            total + (inventoryMatrix[size]?.[color] || 0), 0
                          )} total
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {selectedProduct.colors.map((color) => (
                          <div key={`${size}-${color}`} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900 text-sm">{color}</span>
                              <div className={`w-3 h-3 rounded-full border border-gray-300 ${
                                (inventoryMatrix[size]?.[color] || 0) === 0 ? 'bg-red-100' :
                                (inventoryMatrix[size]?.[color] || 0) <= 5 ? 'bg-yellow-100' :
                                'bg-green-100'
                              }`}></div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label htmlFor={`${size}-${color}`} className="text-xs text-gray-600">
                                  Quantity:
                                </Label>
                                <Input
                                  id={`${size}-${color}`}
                                  type="number"
                                  min="0"
                                  value={inventoryMatrix[size]?.[color] || 0}
                                  onChange={(e) => 
                                    updateInventoryQuantity(size, color, parseInt(e.target.value) || 0)
                                  }
                                  className="w-20 text-center text-sm h-8"
                                />
                              </div>
                              <div className="text-xs text-gray-500">
                                {inventoryMatrix[size]?.[color] === 0 ? (
                                  <span className="text-red-600 font-medium">Out of Stock</span>
                                ) : (inventoryMatrix[size]?.[color] || 0) <= 5 ? (
                                  <span className="text-yellow-600 font-medium">Low Stock</span>
                                ) : (
                                  <span className="text-green-600 font-medium">In Stock</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-3">Quick Actions</h5>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newMatrix = { ...inventoryMatrix };
                      selectedProduct.sizes.forEach(size => {
                        selectedProduct.colors.forEach(color => {
                          newMatrix[size] = { ...newMatrix[size], [color]: 0 };
                        });
                      });
                      setInventoryMatrix(newMatrix);
                    }}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Clear All Stock
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newMatrix = { ...inventoryMatrix };
                      selectedProduct.sizes.forEach(size => {
                        selectedProduct.colors.forEach(color => {
                          newMatrix[size] = { ...newMatrix[size], [color]: 10 };
                        });
                      });
                      setInventoryMatrix(newMatrix);
                    }}
                    className="text-amber-600 border-amber-200 hover:bg-amber-50"
                  >
                    Set All to 10
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newMatrix = { ...inventoryMatrix };
                      selectedProduct.sizes.forEach(size => {
                        selectedProduct.colors.forEach(color => {
                          newMatrix[size] = { ...newMatrix[size], [color]: 25 };
                        });
                      });
                      setInventoryMatrix(newMatrix);
                    }}
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    Set All to 25
                  </Button>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h5 className="font-semibold text-amber-700 mb-2">Inventory Summary</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Total Stock</div>
                    <div className="font-semibold text-gray-900">
                      {Object.values(inventoryMatrix).reduce((total, sizeObj) => 
                        total + Object.values(sizeObj).reduce((sum, qty) => sum + qty, 0), 0
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">In Stock Variants</div>
                    <div className="font-semibold text-green-600">
                      {Object.values(inventoryMatrix).reduce((total, sizeObj) => 
                        total + Object.values(sizeObj).filter(qty => qty > 5).length, 0
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Low Stock Variants</div>
                    <div className="font-semibold text-yellow-600">
                      {Object.values(inventoryMatrix).reduce((total, sizeObj) => 
                        total + Object.values(sizeObj).filter(qty => qty > 0 && qty <= 5).length, 0
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Out of Stock</div>
                    <div className="font-semibold text-red-600">
                      {Object.values(inventoryMatrix).reduce((total, sizeObj) => 
                        total + Object.values(sizeObj).filter(qty => qty === 0).length, 0
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={saving}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveInventory}
                  disabled={saving}
                  className="bg-amber-600 hover:bg-amber-700 px-6"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Inventory'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


