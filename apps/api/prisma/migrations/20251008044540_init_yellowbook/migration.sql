-- CreateEnum
CREATE TYPE "Category" AS ENUM ('restaurant', 'cafe', 'shop', 'hotel', 'service', 'bank', 'atm', 'pharmacy', 'gym', 'education', 'entertainment', 'government', 'other');

-- CreateEnum
CREATE TYPE "PriceLevel" AS ENUM ('FREE', 'CHEAP', 'MODERATE', 'EXPENSIVE', 'LUXURY');

-- CreateTable
CREATE TABLE "YellowBook" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "Category" NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Ulaanbaatar',
    "district" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "building" TEXT,
    "postalCode" TEXT,
    "lat" DECIMAL(9,6) NOT NULL,
    "lng" DECIMAL(9,6) NOT NULL,
    "contacts" JSONB,
    "hours" JSONB,
    "photos" JSONB,
    "rating" DOUBLE PRECISION,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "priceLevel" "PriceLevel",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YellowBook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "YellowBook_slug_key" ON "YellowBook"("slug");
