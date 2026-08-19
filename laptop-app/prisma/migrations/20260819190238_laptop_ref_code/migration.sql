/*
  Adds a short human-facing reference code (e.g. LT-4F2A) to every laptop.

  New rows get a random code from the app. Rows that already exist are
  backfilled here by base-31 encoding their rowid into the same
  transcription-safe alphabet (no 0/O, 1/I/L, U), which is unique by
  construction, so the NOT NULL + UNIQUE constraints hold on an
  already-populated table.
*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Laptop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "refCode" TEXT NOT NULL,
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
    "serialNumber" TEXT,
    "colour" TEXT,
    "condition" TEXT,
    "chargerWattage" TEXT,
    "cpuCores" INTEGER,
    "gpuCores" INTEGER,
    "screenSize" TEXT,
    "macType" TEXT,
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
INSERT INTO "new_Laptop" ("refCode", "batteryHealth", "brand", "brandOs", "chargerWattage", "colour", "condition", "cost", "cpuCores", "createdAt", "cycleCount", "fees", "gpuCores", "hasCharger", "id", "macType", "modelNumber", "notes", "price", "processor", "ram", "resolution", "screenSize", "serialNumber", "shipping", "sold", "soldAt", "soldPrice", "source", "statusCleaned", "statusListed", "statusPrepared", "statusReset", "storage", "updatedAt", "year") SELECT 'LT-' || substr('23456789ABCDEFGHJKMNPQRSTUVWXYZ', ((rowid / 29791) % 31) + 1, 1) || substr('23456789ABCDEFGHJKMNPQRSTUVWXYZ', ((rowid / 961) % 31) + 1, 1) || substr('23456789ABCDEFGHJKMNPQRSTUVWXYZ', ((rowid / 31) % 31) + 1, 1) || substr('23456789ABCDEFGHJKMNPQRSTUVWXYZ', (rowid % 31) + 1, 1), "batteryHealth", "brand", "brandOs", "chargerWattage", "colour", "condition", "cost", "cpuCores", "createdAt", "cycleCount", "fees", "gpuCores", "hasCharger", "id", "macType", "modelNumber", "notes", "price", "processor", "ram", "resolution", "screenSize", "serialNumber", "shipping", "sold", "soldAt", "soldPrice", "source", "statusCleaned", "statusListed", "statusPrepared", "statusReset", "storage", "updatedAt", "year" FROM "Laptop";
DROP TABLE "Laptop";
ALTER TABLE "new_Laptop" RENAME TO "Laptop";
CREATE UNIQUE INDEX "Laptop_refCode_key" ON "Laptop"("refCode");
CREATE INDEX "Laptop_sold_idx" ON "Laptop"("sold");
CREATE INDEX "Laptop_statusPrepared_idx" ON "Laptop"("statusPrepared");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
