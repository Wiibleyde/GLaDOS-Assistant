/*
  Warnings:

  - You are about to drop the `Birthdays` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LogLevel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Logs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Logs` DROP FOREIGN KEY `Logs_levelId_fkey`;

-- DropTable
DROP TABLE `Birthdays`;

-- DropTable
DROP TABLE `LogLevel`;

-- DropTable
DROP TABLE `Logs`;

-- CreateTable
CREATE TABLE `logLevel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `logLevel_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `message` MEDIUMTEXT NOT NULL,
    `levelId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `birthdays` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,

    UNIQUE INDEX `birthdays_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `logs` ADD CONSTRAINT `logs_levelId_fkey` FOREIGN KEY (`levelId`) REFERENCES `logLevel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
