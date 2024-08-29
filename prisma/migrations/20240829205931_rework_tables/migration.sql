-- CreateTable
CREATE TABLE `GlobalUserData` (
    `uuid` VARCHAR(191) NOT NULL,
    `userId` BIGINT NOT NULL,
    `birthDate` DATETIME(3) NOT NULL,
    `quizGoodAnswers` INTEGER NOT NULL DEFAULT 0,
    `quizBadAnswers` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `GlobalUserData_userId_key`(`userId`),
    INDEX `GlobalUserData_userId_idx`(`userId`),
    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LogLevel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `LogLevel_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `message` MEDIUMTEXT NOT NULL,
    `levelId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Config` (
    `uuid` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `guildId` BIGINT NOT NULL,

    INDEX `Config_guildId_idx`(`guildId`),
    UNIQUE INDEX `Config_key_guildId_key`(`key`, `guildId`),
    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Quote` (
    `uuid` VARCHAR(191) NOT NULL,
    `guildId` BIGINT NOT NULL,
    `authorUuid` VARCHAR(191) NOT NULL,
    `quote` VARCHAR(191) NOT NULL,
    `context` VARCHAR(191) NOT NULL DEFAULT '',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Logs` ADD CONSTRAINT `Logs_levelId_fkey` FOREIGN KEY (`levelId`) REFERENCES `LogLevel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quote` ADD CONSTRAINT `Quote_authorUuid_fkey` FOREIGN KEY (`authorUuid`) REFERENCES `GlobalUserData`(`uuid`) ON DELETE RESTRICT ON UPDATE CASCADE;
