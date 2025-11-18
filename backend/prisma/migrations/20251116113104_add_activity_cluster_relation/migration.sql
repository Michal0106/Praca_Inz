/*
  Warnings:

  - A unique constraint covering the columns `[activityId]` on the table `ActivityCluster` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ActivityCluster_userId_activityId_key";

-- CreateIndex
CREATE UNIQUE INDEX "ActivityCluster_activityId_key" ON "ActivityCluster"("activityId");

-- AddForeignKey
ALTER TABLE "ActivityCluster" ADD CONSTRAINT "ActivityCluster_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
