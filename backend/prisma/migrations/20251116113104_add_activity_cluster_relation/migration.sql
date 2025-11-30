/*
  Warnings:

  - A unique constraint covering the columns `[activityId]` on the table `ActivityCluster` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex (only if exists)
DROP INDEX IF EXISTS "ActivityCluster_userId_activityId_key";

-- CreateTable (if not exists)
CREATE TABLE IF NOT EXISTS "ActivityCluster" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "cluster" INTEGER NOT NULL,
    "pca1" DOUBLE PRECISION NOT NULL,
    "pca2" DOUBLE PRECISION NOT NULL,
    "features" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityCluster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ActivityCluster_activityId_key" ON "ActivityCluster"("activityId");

-- AddForeignKey
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'ActivityCluster_activityId_fkey'
    ) THEN
        ALTER TABLE "ActivityCluster" ADD CONSTRAINT "ActivityCluster_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
