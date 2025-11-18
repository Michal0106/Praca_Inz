-- CreateTable
CREATE TABLE "PaceDistance" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "km1" DOUBLE PRECISION,
    "km5" DOUBLE PRECISION,
    "km10" DOUBLE PRECISION,
    "km21" DOUBLE PRECISION,
    "km42" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaceDistance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaceDistance_activityId_key" ON "PaceDistance"("activityId");

-- CreateIndex
CREATE INDEX "PaceDistance_userId_idx" ON "PaceDistance"("userId");

-- CreateIndex
CREATE INDEX "PaceDistance_createdAt_idx" ON "PaceDistance"("createdAt");

-- AddForeignKey
ALTER TABLE "PaceDistance" ADD CONSTRAINT "PaceDistance_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
