import type { Product } from './types';

export interface DiscountInfo {
  originalPrice: number;
  discountedPrice: number;
  discountAmount: number;
  discountPercentage?: number;
  isActive: boolean;
}

export function calculateDiscount(product: any): DiscountInfo {
  const originalPrice = product.price;
  let discountedPrice = originalPrice;
  let discountAmount = 0;
  let discountPercentage: number | undefined;

  // Check if discount is active based on dates
  const now = new Date();
  const startDate = product.discountStartDate ? new Date(product.discountStartDate) : null;
  const endDate = product.discountEndDate ? new Date(product.discountEndDate) : null;
  
  // Correct date logic:
  // - If no dates set: always active
  // - If only start date: active from start date onwards
  // - If only end date: active until end date
  // - If both dates: active between start and end dates
  let isDateActive = true;
  
  if (startDate && endDate) {
    // Both dates set: must be between start and end
    isDateActive = now >= startDate && now <= endDate;
  } else if (startDate) {
    // Only start date set: must be after start
    isDateActive = now >= startDate;
  } else if (endDate) {
    // Only end date set: must be before end
    isDateActive = now <= endDate;
  }
  // If no dates set: isDateActive remains true

  const isActive = product.isDiscounted && isDateActive;

  if (isActive) {
    if (product.discountPercentage) {
      discountPercentage = product.discountPercentage;
      discountedPrice = originalPrice * (1 - product.discountPercentage / 100);
      discountAmount = originalPrice - discountedPrice;
    } else if (product.discountAmount) {
      discountedPrice = Math.max(0, originalPrice - product.discountAmount);
      discountAmount = product.discountAmount;
    }
  }

  return {
    originalPrice,
    discountedPrice: Math.round(discountedPrice * 100) / 100, // Round to 2 decimal places
    discountAmount: Math.round(discountAmount * 100) / 100,
    discountPercentage,
    isActive
  };
}

export function formatDiscountDisplay(product: any): string {
  if (!product.isDiscounted) return '';
  
  const discountInfo = calculateDiscount(product);
  
  if (!discountInfo.isActive) return 'Expired';
  
  if (product.discountPercentage) {
    return `${product.discountPercentage}% OFF`;
  } else if (product.discountAmount) {
    return `Rs. ${product.discountAmount.toFixed(0)} OFF`;
  }
  
  return '';
}

export function isDiscountExpired(product: any): boolean {
  if (!product.discountStartDate || !product.discountEndDate) return false;
  
  const now = new Date();
  const endDate = new Date(product.discountEndDate);
  return now > endDate;
}

export function isDiscountUpcoming(product: any): boolean {
  if (!product.discountStartDate) return false;
  
  const now = new Date();
  const startDate = new Date(product.discountStartDate);
  return now < startDate;
}
