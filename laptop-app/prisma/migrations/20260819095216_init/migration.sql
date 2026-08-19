-- CreateTable
CREATE TABLE "Laptop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brandOs" TEXT NOT NULL,
    "brand" TEXT,
    "year" INTEGER,
    "processor" TEXT,
    "ram" TEXT,
    "storage" TEXT,
    "modelNumber" TEXT,
    "hasCharger" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "source" TEXT,
    "resolution" TEXT,
    "batteryHealth" INTEGER,
    "cycleCount" INTEGER,
    "cost" REAL,
    "price" REAL,
    "statusReset" BOOLEAN NOT NULL DEFAULT false,
    "statusCleaned" BOOLEAN NOT NULL DEFAULT false,
    "statusPrepared" BOOLEAN NOT NULL DEFAULT false,
    "statusListed" BOOLEAN NOT NULL DEFAULT false,
    "sold" BOOLEAN NOT NULL DEFAULT false,
    "soldPrice" REAL,
    "shipping" REAL,
    "fees" REAL,
    "soldAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PriceEstimate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "laptopId" TEXT NOT NULL,
    "averagePrice" REAL NOT NULL,
    "lowPrice" REAL,
    "highPrice" REAL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "sampleSize" INTEGER,
    "summary" TEXT NOT NULL,
    "sources" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PriceEstimate_laptopId_fkey" FOREIGN KEY ("laptopId") REFERENCES "Laptop" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "Laptop_sold_idx" ON "Laptop"("sold");

-- CreateIndex
CREATE INDEX "Laptop_statusPrepared_idx" ON "Laptop"("statusPrepared");

-- CreateIndex
CREATE INDEX "PriceEstimate_laptopId_idx" ON "PriceEstimate"("laptopId");
