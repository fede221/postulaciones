ALTER TABLE `Application`
  ADD COLUMN `city`              VARCHAR(191) NULL,
  ADD COLUMN `linkedinUrl`       VARCHAR(191) NULL,
  ADD COLUMN `yearsExperience`   INT          NULL,
  ADD COLUMN `educationLevel`    VARCHAR(191) NULL,
  ADD COLUMN `workMode`          VARCHAR(191) NULL,
  ADD COLUMN `availability`      VARCHAR(191) NULL,
  ADD COLUMN `salaryExpectation` VARCHAR(191) NULL,
  ADD COLUMN `skills`            TEXT         NULL;
