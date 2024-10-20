-- CreateTable
CREATE TABLE `RadioData` (
    `uuid` VARCHAR(191) NOT NULL,
    `botMessageDataUuid` VARCHAR(191) NOT NULL,
    `internalName` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `radioFrequency` VARCHAR(191) NOT NULL,

    INDEX `RadioData_botMessageDataUuid_fkey`(`botMessageDataUuid`),
    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RadioData` ADD CONSTRAINT `RadioData_botMessageDataUuid_fkey` FOREIGN KEY (`botMessageDataUuid`) REFERENCES `BotMessageData`(`uuid`) ON DELETE RESTRICT ON UPDATE CASCADE;
