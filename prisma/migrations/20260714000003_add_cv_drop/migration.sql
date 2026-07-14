CREATE TABLE `CvDrop` (
  `id`        VARCHAR(191) NOT NULL,
  `firstName` VARCHAR(191) NOT NULL,
  `lastName`  VARCHAR(191) NOT NULL,
  `email`     VARCHAR(191) NOT NULL,
  `phone`     VARCHAR(191) NULL,
  `message`   TEXT         NULL,
  `cvPath`    VARCHAR(191) NULL,
  `cvText`    LONGTEXT     NULL,
  `reviewed`  TINYINT(1)   NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
