'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2, Edit, Plus, Calendar, Percent, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: {
    name: string;
  };
  discountPercentage?: number;
  discountAmount?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  isDiscounted: boolean;
}

interface DiscountFormData {
  discountPercentage?: number;
  discountAmount?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  isDiscounted: boolean;
}

export default function PromotionsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [discountForm, setDiscountForm] = useState<DiscountFormData>({
    isDiscounted: false
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('percentage');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscountSubmit = async () => {
    if (!selectedProduct) return;

    try {
      const response = await fetch(`/api/admin/products/${selectedProduct.id}/discount`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...discountForm,
          discountType
        }),
      });

      if (response.ok) {
        toast.success('Discount updated successfully');
        fetchProducts();
        setIsDialogOpen(false);
        setSelectedProduct(null);
        setDiscountForm({ isDiscounted: false });
      } else {
        toast.error('Failed to update discount');
      }
    } catch (error) {
      console.error('Error updating discount:', error);
      toast.error('Failed to update discount');
    }
  };

  const handleRemoveDiscount = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/discount`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Discount removed successfully');
        fetchProducts();
      } else {
        toast.error('Failed to remove discount');
      }
    } catch (error) {
      console.error('Error removing discount:', error);
      toast.error('Failed to remove discount');
    }
  };

  const openDiscountDialog = (product: Product) => {
    setSelectedProduct(product);
    setDiscountForm({
      discountPercentage: product.discountPercentage || undefined,
      discountAmount: product.discountAmount || undefined,
      discountStartDate: product.discountStartDate ? product.discountStartDate.split('T')[0] : undefined,
      discountEndDate: product.discountEndDate ? product.discountEndDate.split('T')[0] : undefined,
      isDiscounted: product.isDiscounted
    });
    setDiscountType(product.discountPercentage ? 'percentage' : 'amount');
    setIsDialogOpen(true);
  };

  const calculateDiscountedPrice = (price: number, discountPercentage?: number, discountAmount?: number) => {
    if (discountPercentage) {
      return price * (1 - discountPercentage / 100);
    }
    if (discountAmount) {
      return Math.max(0, price - discountAmount);
    }
    return price;
  };

  const isDiscountActive = (startDate?: string, endDate?: string) => {
    const now = new Date();
    
    // If no dates set: always active
    if (!startDate && !endDate) return true;
    
    // If only start date set: active from start date onwards
    if (startDate && !endDate) {
      return now >= new Date(startDate);
    }
    
    // If only end date set: active until end date
    if (!startDate && endDate) {
      return now <= new Date(endDate);
    }
    
    // If both dates set: active between start and end dates
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return now >= start && now <= end;
    }
    
    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Promotions & Discounts</h1>
        <Badge variant="outline" className="text-sm">
          {products?.filter(p => p.isDiscounted).length || 0} Active Discounts
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products?.map((product) => {
          const discountedPrice = calculateDiscountedPrice(
            product.price,
            product.discountPercentage,
            product.discountAmount
          );
          const active = isDiscountActive(product.discountStartDate, product.discountEndDate);
          const discountAmount = product.price - discountedPrice;

          return (
            <Card key={product.id} className="overflow-hidden">
              <div className="relative">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                {product.isDiscounted && active && (
                  <Badge className="absolute top-2 left-2 bg-red-500">
                    {product.discountPercentage ? `${product.discountPercentage}% OFF` : `Rs. ${product.discountAmount} OFF`}
                  </Badge>
                )}
                {product.isDiscounted && !active && (
                  <Badge variant="secondary" className="absolute top-2 left-2">
                    Expired
                  </Badge>
                )}
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <div className="text-sm text-gray-600">{product.category.name}</div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    {product.isDiscounted && active ? (
                      <>
                        <div className="text-sm text-gray-500 line-through">Rs. {product.price.toLocaleString()}</div>
                        <div className="text-lg font-bold text-red-600">Rs. {discountedPrice.toLocaleString()}</div>
                      </>
                    ) : (
                      <div className="text-lg font-bold">Rs. {product.price.toLocaleString()}</div>
                    )}
                  </div>
                </div>

                {product.isDiscounted && (
                  <div className="text-xs text-gray-500 space-y-1">
                    {product.discountStartDate && product.discountEndDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(product.discountStartDate).toLocaleDateString()} - {new Date(product.discountEndDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openDiscountDialog(product)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {product.isDiscounted ? 'Edit' : 'Add'} Discount
                  </Button>
                  
                  {product.isDiscounted && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveDiscount(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Discount Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct?.isDiscounted ? 'Edit Discount' : 'Add Discount'} - {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isDiscounted"
                checked={discountForm.isDiscounted}
                onCheckedChange={(checked) => setDiscountForm({ ...discountForm, isDiscounted: checked })}
              />
              <Label htmlFor="isDiscounted">Enable Discount</Label>
            </div>

            {discountForm.isDiscounted && (
              <>
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <Select value={discountType} onValueChange={(value: 'percentage' | 'amount') => setDiscountType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="amount">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {discountType === 'percentage' ? (
                  <div className="space-y-2">
                    <Label htmlFor="discountPercentage">Discount Percentage (%)</Label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="discountPercentage"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={discountForm.discountPercentage || ''}
                        onChange={(e) => setDiscountForm({ ...discountForm, discountPercentage: parseFloat(e.target.value) })}
                        className="pl-10"
                        placeholder="Enter percentage"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="discountAmount">Discount Amount (Rs.)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="discountAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={discountForm.discountAmount || ''}
                        onChange={(e) => setDiscountForm({ ...discountForm, discountAmount: parseFloat(e.target.value) })}
                        className="pl-10"
                        placeholder="Enter amount"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={discountForm.discountStartDate || ''}
                      onChange={(e) => setDiscountForm({ ...discountForm, discountStartDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={discountForm.discountEndDate || ''}
                      onChange={(e) => setDiscountForm({ ...discountForm, discountEndDate: e.target.value })}
                    />
                  </div>
                </div>

                {selectedProduct && discountForm.isDiscounted && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Preview:</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm line-through">Rs. {selectedProduct.price.toLocaleString()}</span>
                      <span className="font-bold text-red-600">
                        Rs. {calculateDiscountedPrice(
                          selectedProduct.price,
                          discountForm.discountPercentage,
                          discountForm.discountAmount
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex gap-2 pt-4">
              <Button onClick={handleDiscountSubmit} className="flex-1">
                {selectedProduct?.isDiscounted ? 'Update Discount' : 'Add Discount'}
              </Button>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}