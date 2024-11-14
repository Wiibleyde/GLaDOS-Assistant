-- CreateTable
CREATE TABLE `MpThreads` (
    `uuid` VARCHAR(191) NOT NULL,
    `guildId` VARCHAR(191) NOT NULL,
    `userUuid` VARCHAR(191) NOT NULL,
    `threadId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MpThreads_guildId_idx`(`guildId`),
    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MpThreads` ADD CONSTRAINT `MpThreads_userUuid_fkey` FOREIGN KEY (`userUuid`) REFERENCES `GlobalUserData`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;
