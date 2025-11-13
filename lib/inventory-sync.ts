import { prisma } from './db';

/**
 * Syncs the inStock status of a product based on its inventory levels
 * Sets inStock to false if all inventory items have quantity 0
 * Sets inStock to true if at least one inventory item has quantity > 0
 */
export async function syncProductStockStatus(productId: string): Promise<boolean> {
  try {
    // Get all inventory items for this product
    const inventoryItems = await (prisma as any).inventoryItem.findMany({
      where: { productId },
      select: { quantity: true }
    });

    // Calculate total available inventory
    const totalInventory = inventoryItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
    
    // Determine new stock status
    const newInStockStatus = totalInventory > 0;
    
    // Update the product's inStock status
    await prisma.product.update({
      where: { id: productId },
      data: { inStock: newInStockStatus }
    });

    console.log(`Synced stock status for product ${productId}: ${newInStockStatus ? 'IN STOCK' : 'OUT OF STOCK'} (Total inventory: ${totalInventory})`);
    
    return newInStockStatus;
  } catch (error) {
    console.error(`Error syncing stock status for product ${productId}:`, error);
    throw error;
  }
}

/**
 * Syncs stock status for multiple products
 */
export async function syncMultipleProductsStockStatus(productIds: string[]): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};
  
  for (const productId of productIds) {
    try {
      results[productId] = await syncProductStockStatus(productId);
    } catch (error) {
      console.error(`Failed to sync stock status for product ${productId}:`, error);
      results[productId] = false; // Default to out of stock on error
    }
  }
  
  return results;
}
