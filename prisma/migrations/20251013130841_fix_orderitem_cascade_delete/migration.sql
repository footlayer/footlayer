/*
  Warnings:

  - Added the required column `discountedPrice` to the `order_items` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_productId_fkey";

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "discountedPrice" DOUBLE PRECISION;

-- Update existing records to set discountedPrice = price (since discountAmount defaults to 0)
UPDATE "order_items" SET "discountedPrice" = "price" WHERE "discountedPrice" IS NULL;

-- Make discountedPrice NOT NULL after setting values for existing records
ALTER TABLE "order_items" ALTER COLUMN "discountedPrice" SET NOT NULL;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "discountAmount" DOUBLE PRECISION,
ADD COLUMN     "discountEndDate" TIMESTAMP(3),
ADD COLUMN     "discountPercentage" DOUBLE PRECISION,
ADD COLUMN     "discountStartDate" TIMESTAMP(3),
ADD COLUMN     "isDiscounted" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
