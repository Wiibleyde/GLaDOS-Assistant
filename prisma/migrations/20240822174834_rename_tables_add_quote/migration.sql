/*
  Warnings:

  - You are about to drop the `birthdays` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `config` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `logLevel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `logs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `logs` DROP FOREIGN KEY `logs_levelId_fkey`;

-- DropTable
DROP TABLE `birthdays`;

-- DropTable
DROP TABLE `config`;

-- DropTable
DROP TABLE `logLevel`;

-- DropTable
DROP TABLE `logs`;

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
CREATE TABLE `Birthdays` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` BIGINT NOT NULL,
    `date` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Birthdays_userId_key`(`userId`),
    INDEX `Birthdays_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Config` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `guildId` BIGINT NOT NULL,

    INDEX `Config_guildId_idx`(`guildId`),
    UNIQUE INDEX `Config_key_guildId_key`(`key`, `guildId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Quote` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `guildId` BIGINT NOT NULL,
    `authorId` BIGINT NOT NULL,
    `quote` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Logs` ADD CONSTRAINT `Logs_levelId_fkey` FOREIGN KEY (`levelId`) REFERENCES `LogLevel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
