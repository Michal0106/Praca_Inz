-- AlterTable
ALTER TABLE "PlanWorkout" ADD COLUMN     "googleEventId" TEXT;

-- AlterTable
ALTER TABLE "TrainingPlan" ADD COLUMN     "calendarSyncDate" TIMESTAMP(3),
ADD COLUMN     "syncedToCalendar" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "googleAccessToken" TEXT,
ADD COLUMN     "googleRefreshToken" TEXT,
ADD COLUMN     "googleTokenExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "ActivityCluster_userId_idx" ON "ActivityCluster"("userId");

-- CreateIndex
CREATE INDEX "ActivityCluster_cluster_idx" ON "ActivityCluster"("cluster");
