-- CreateTable
CREATE TABLE `GuildData` (
    `uuid` VARCHAR(191) NOT NULL,
    `guildId` VARCHAR(191) NOT NULL,
    `debugRoleId` VARCHAR(191) NULL,

    INDEX `GuildData_guildId_idx`(`guildId`),
    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
