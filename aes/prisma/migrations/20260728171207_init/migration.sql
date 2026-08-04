-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'VIEWER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Mine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "company" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Pit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "mineId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "geometry" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pit_mineId_fkey" FOREIGN KEY ("mineId") REFERENCES "Mine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bench" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "pitId" TEXT NOT NULL,
    "elevation" REAL,
    "height" REAL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "geometry" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Bench_pitId_fkey" FOREIGN KEY ("pitId") REFERENCES "Pit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Block" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "benchId" TEXT NOT NULL,
    "designVolume" REAL,
    "designTonnage" REAL,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "geometry" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Block_benchId_fkey" FOREIGN KEY ("benchId") REFERENCES "Bench" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "sequence" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "geometry" JSONB,
    "materialClass" TEXT,
    "destination" TEXT,
    "destinationId" TEXT,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "SubBlock_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Sample" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subBlockId" TEXT NOT NULL,
    "sampleNumber" TEXT NOT NULL,
    "sampleDate" DATETIME NOT NULL,
    "sampler" TEXT,
    "location" JSONB,
    "depth" REAL,
    "remarks" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Sample_subBlockId_fkey" FOREIGN KEY ("subBlockId") REFERENCES "SubBlock" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LabResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sampleId" TEXT NOT NULL,
    "labNumber" TEXT NOT NULL,
    "fe" REAL,
    "feo" REAL,
    "sio2" REAL,
    "al2o3" REAL,
    "p" REAL,
    "s" REAL,
    "moisture" REAL,
    "density" REAL,
    "receiveDate" DATETIME,
    "approveDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "subBlockId" TEXT,
    CONSTRAINT "LabResult_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "Sample" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LabResult_subBlockId_fkey" FOREIGN KEY ("subBlockId") REFERENCES "SubBlock" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaterialProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subBlockId" TEXT NOT NULL,
    "oreType" TEXT,
    "rockType" TEXT,
    "processingBehavior" TEXT,
    "gradeCategory" TEXT,
    "economicClass" TEXT,
    "mixingClass" TEXT,
    "priority" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "labResultId" TEXT,
    CONSTRAINT "MaterialProfile_subBlockId_fkey" FOREIGN KEY ("subBlockId") REFERENCES "SubBlock" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MaterialProfile_labResultId_fkey" FOREIGN KEY ("labResultId") REFERENCES "LabResult" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DestinationDecision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subBlockId" TEXT NOT NULL,
    "destinationType" TEXT NOT NULL,
    "destinationId" TEXT,
    "decisionReason" TEXT,
    "decisionBy" TEXT,
    "decisionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedBy" TEXT,
    "approvedDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "materialProfileId" TEXT,
    CONSTRAINT "DestinationDecision_subBlockId_fkey" FOREIGN KEY ("subBlockId") REFERENCES "SubBlock" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DestinationDecision_materialProfileId_fkey" FOREIGN KEY ("materialProfileId") REFERENCES "MaterialProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LoadingRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subBlockId" TEXT NOT NULL,
    "loadTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "loader" TEXT,
    "destination" TEXT,
    "tonnage" REAL,
    "truckCount" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'LOADING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LoadingRecord_subBlockId_fkey" FOREIGN KEY ("subBlockId") REFERENCES "SubBlock" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_code_key" ON "User"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Mine_code_key" ON "Mine"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Pit_code_key" ON "Pit"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Bench_code_key" ON "Bench"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Block_code_key" ON "Block"("code");

-- CreateIndex
CREATE UNIQUE INDEX "SubBlock_code_key" ON "SubBlock"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Sample_sampleNumber_key" ON "Sample"("sampleNumber");

-- CreateIndex
CREATE UNIQUE INDEX "LabResult_labNumber_key" ON "LabResult"("labNumber");
