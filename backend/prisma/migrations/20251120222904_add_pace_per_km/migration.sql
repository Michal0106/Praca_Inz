-- AlterTable (tylko pola Activity, bez zmian w User - zostały dodane w JWT migration)
ALTER TABLE "Activity" ADD COLUMN     "intensityFactor" DOUBLE PRECISION,
ADD COLUMN     "normalizedPower" INTEGER,
ADD COLUMN     "pacePerKm" JSONB,
ADD COLUMN     "tss" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "GpsPoint" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "altitude" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "speed" DOUBLE PRECISION,
    "heartRate" INTEGER,
    "power" INTEGER,
    "cadence" INTEGER,

    CONSTRAINT "GpsPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PowerCurve" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sec5" DOUBLE PRECISION,
    "sec30" DOUBLE PRECISION,
    "min1" DOUBLE PRECISION,
    "min2" DOUBLE PRECISION,
    "min5" DOUBLE PRECISION,
    "min10" DOUBLE PRECISION,
    "min20" DOUBLE PRECISION,
    "min60" DOUBLE PRECISION,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PowerCurve_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FitnessMetrics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "ctl" DOUBLE PRECISION NOT NULL,
    "atl" DOUBLE PRECISION NOT NULL,
    "tsb" DOUBLE PRECISION NOT NULL,
    "rampRate" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FitnessMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable (ActivityCluster już istnieje z migracji add_activity_cluster_relation)
-- CreateTable
CREATE TABLE "Segment" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "avgGrade" DOUBLE PRECISION,
    "startLat" DOUBLE PRECISION NOT NULL,
    "startLng" DOUBLE PRECISION NOT NULL,
    "endLat" DOUBLE PRECISION NOT NULL,
    "endLng" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Segment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SegmentEffort" (
    "id" TEXT NOT NULL,
    "segmentId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "elapsedTime" INTEGER NOT NULL,
    "movingTime" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "avgPower" INTEGER,
    "avgHr" INTEGER,
    "isPr" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SegmentEffort_pkey" PRIMARY KEY ("id")
);

-- CreateTable (Achievement już istnieje z JWT migration)

-- CreateIndex (indeksy RefreshToken i Achievement już istnieją z JWT migration)
-- CreateIndex
CREATE INDEX "GpsPoint_activityId_idx" ON "GpsPoint"("activityId");

-- CreateIndex
CREATE INDEX "GpsPoint_timestamp_idx" ON "GpsPoint"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "PowerCurve_activityId_key" ON "PowerCurve"("activityId");

-- CreateIndex
CREATE INDEX "PowerCurve_userId_idx" ON "PowerCurve"("userId");

-- CreateIndex
CREATE INDEX "PowerCurve_createdAt_idx" ON "PowerCurve"("createdAt");

-- CreateIndex
CREATE INDEX "FitnessMetrics_userId_idx" ON "FitnessMetrics"("userId");

-- CreateIndex
CREATE INDEX "FitnessMetrics_date_idx" ON "FitnessMetrics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "FitnessMetrics_userId_date_key" ON "FitnessMetrics"("userId", "date");

-- CreateIndex (indeksy ActivityCluster już istnieją z migracji add_activity_cluster_relation)

-- CreateIndex
CREATE UNIQUE INDEX "Segment_externalId_key" ON "Segment"("externalId");

-- CreateIndex
CREATE INDEX "SegmentEffort_userId_idx" ON "SegmentEffort"("userId");

-- CreateIndex
CREATE INDEX "SegmentEffort_segmentId_idx" ON "SegmentEffort"("segmentId");

-- CreateIndex
CREATE INDEX "SegmentEffort_startDate_idx" ON "SegmentEffort"("startDate");

-- CreateIndex (indeksy Achievement już istnieją z JWT migration)

-- AddForeignKey (FK dla RefreshToken i Achievement już istnieją z JWT migration)
-- AddForeignKey
ALTER TABLE "GpsPoint" ADD CONSTRAINT "GpsPoint_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PowerCurve" ADD CONSTRAINT "PowerCurve_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FitnessMetrics" ADD CONSTRAINT "FitnessMetrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey (FK dla ActivityCluster już istnieje z migracji add_activity_cluster_relation)

-- AddForeignKey
ALTER TABLE "SegmentEffort" ADD CONSTRAINT "SegmentEffort_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "Segment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SegmentEffort" ADD CONSTRAINT "SegmentEffort_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey (FK dla Achievement już istnieje z JWT migration)
