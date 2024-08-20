-- CreateTable
CREATE TABLE `Logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `message` VARCHAR(191) NOT NULL,
    `runtime` VARCHAR(191) NOT NULL,
    `runtimeVersion` VARCHAR(191) NOT NULL,
    `hostname` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `logLevelId` INTEGER NOT NULL,
    `logLevelName` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `fileNameWithLine` VARCHAR(191) NOT NULL,
    `fileColumn` VARCHAR(191) NOT NULL,
    `fileLine` VARCHAR(191) NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `filePathWithLine` VARCHAR(191) NOT NULL,
    `method` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
