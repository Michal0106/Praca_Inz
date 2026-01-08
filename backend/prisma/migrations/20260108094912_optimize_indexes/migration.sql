CREATE INDEX "Activity_userId_startDate_idx" ON "Activity"("userId", "startDate");

CREATE INDEX "Activity_userId_type_startDate_idx" ON "Activity"("userId", "type", "startDate");

CREATE INDEX "TrainingPlan_userId_status_idx" ON "TrainingPlan"("userId", "status");
