/*
  Warnings:

  - You are about to drop the column `emailVerificationExpires` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerificationToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `garminId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isEmailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resetPasswordExpires` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resetPasswordToken` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TrainingPlanStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "WorkoutType" AS ENUM ('EASY_RUN', 'LONG_RUN', 'TEMPO_RUN', 'INTERVALS', 'FARTLEK', 'RECOVERY', 'RACE_PACE', 'HILL_REPEATS', 'CROSS_TRAINING', 'REST');

-- DropIndex
DROP INDEX "User_garminId_key";

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "bestEfforts" JSON,
ADD COLUMN     "laps" JSON,
ALTER COLUMN "pacePerKm" SET DATA TYPE JSON;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerificationExpires",
DROP COLUMN "emailVerificationToken",
DROP COLUMN "garminId",
DROP COLUMN "isEmailVerified",
DROP COLUMN "resetPasswordExpires",
DROP COLUMN "resetPasswordToken";

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "targetRaceDate" TIMESTAMP(3),
    "weeksCount" INTEGER NOT NULL,
    "sessionsPerWeek" INTEGER NOT NULL,
    "trainingDays" JSONB NOT NULL,
    "status" "TrainingPlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "generatedBy" TEXT NOT NULL DEFAULT 'OPENAI',
    "analysisData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanWeek" (
    "id" TEXT NOT NULL,
    "trainingPlanId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "weekGoal" TEXT,
    "totalDistance" DOUBLE PRECISION,
    "totalDuration" INTEGER,

    CONSTRAINT "PlanWeek_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanWorkout" (
    "id" TEXT NOT NULL,
    "planWeekId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "workoutType" "WorkoutType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetDistance" DOUBLE PRECISION,
    "targetDuration" INTEGER,
    "targetPace" TEXT,
    "intensity" TEXT,
    "intervals" JSONB,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "actualDistance" DOUBLE PRECISION,
    "actualDuration" INTEGER,
    "notes" TEXT,

    CONSTRAINT "PlanWorkout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "TrainingPlan_userId_idx" ON "TrainingPlan"("userId");

-- CreateIndex
CREATE INDEX "TrainingPlan_status_idx" ON "TrainingPlan"("status");

-- CreateIndex
CREATE INDEX "PlanWeek_trainingPlanId_idx" ON "PlanWeek"("trainingPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanWeek_trainingPlanId_weekNumber_key" ON "PlanWeek"("trainingPlanId", "weekNumber");

-- CreateIndex
CREATE INDEX "PlanWorkout_planWeekId_idx" ON "PlanWorkout"("planWeekId");

-- CreateIndex
CREATE INDEX "PlanWorkout_dayOfWeek_idx" ON "PlanWorkout"("dayOfWeek");

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingPlan" ADD CONSTRAINT "TrainingPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanWeek" ADD CONSTRAINT "PlanWeek_trainingPlanId_fkey" FOREIGN KEY ("trainingPlanId") REFERENCES "TrainingPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanWorkout" ADD CONSTRAINT "PlanWorkout_planWeekId_fkey" FOREIGN KEY ("planWeekId") REFERENCES "PlanWeek"("id") ON DELETE CASCADE ON UPDATE CASCADE;
