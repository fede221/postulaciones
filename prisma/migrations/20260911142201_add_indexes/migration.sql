-- CreateIndex
CREATE INDEX `Application_email_idx` ON `Application`(`email`);

-- CreateIndex
CREATE INDEX `Application_status_idx` ON `Application`(`status`);

-- CreateIndex
CREATE INDEX `Application_createdAt_idx` ON `Application`(`createdAt`);

-- CreateIndex
CREATE INDEX `CvDrop_email_idx` ON `CvDrop`(`email`);

-- CreateIndex
CREATE INDEX `CvDrop_createdAt_idx` ON `CvDrop`(`createdAt`);

-- RenameIndex
ALTER TABLE `Application` RENAME INDEX `Application_jobId_fkey` TO `Application_jobId_idx`;

-- RenameIndex
ALTER TABLE `ApplicationStatusHistory` RENAME INDEX `ApplicationStatusHistory_applicationId_fkey` TO `ApplicationStatusHistory_applicationId_idx`;
