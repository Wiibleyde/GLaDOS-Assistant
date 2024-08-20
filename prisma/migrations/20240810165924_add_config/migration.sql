/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Birthdays` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE `Config` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `guildId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Birthdays_userId_key` ON `Birthdays`(`userId`);
