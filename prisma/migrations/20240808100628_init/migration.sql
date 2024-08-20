/*
  Warnings:

  - You are about to drop the column `date` on the `Logs` table. All the data in the column will be lost.
  - You are about to drop the column `fileColumn` on the `Logs` table. All the data in the column will be lost.
  - You are about to drop the column `fileLine` on the `Logs` table. All the data in the column will be lost.
  - You are about to drop the column `fileName` on the `Logs` table. All the data in the column will be lost.
  - You are about to drop the column `fileNameWithLine` on the `Logs` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `Logs` table. All the data in the column will be lost.
  - You are about to drop the column `filePathWithLine` on the `Logs` table. All the data in the column will be lost.
  - You are about to drop the column `hostname` on the `Logs` table. All the data in the column will be lost.
  - You are about to drop the column `logLevelId` on the `Logs` table. All the data in the column will be lost.
  - You are about to drop the column `logLevelName` on the `Logs` table. All the data in the column will be lost.
  - You are about to drop the column `method` on the `Logs` table. All the data in the column will be lost.
  - You are about to drop the column `path` on the `Logs` table. All the data in the column will be lost.
  - You are about to drop the column `runtime` on the `Logs` table. All the data in the column will be lost.
  - You are about to drop the column `runtimeVersion` on the `Logs` table. All the data in the column will be lost.
  - Added the required column `levelId` to the `Logs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Logs` DROP COLUMN `date`,
    DROP COLUMN `fileColumn`,
    DROP COLUMN `fileLine`,
    DROP COLUMN `fileName`,
    DROP COLUMN `fileNameWithLine`,
    DROP COLUMN `filePath`,
    DROP COLUMN `filePathWithLine`,
    DROP COLUMN `hostname`,
    DROP COLUMN `logLevelId`,
    DROP COLUMN `logLevelName`,
    DROP COLUMN `method`,
    DROP COLUMN `path`,
    DROP COLUMN `runtime`,
    DROP COLUMN `runtimeVersion`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `levelId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `LogLevel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Logs` ADD CONSTRAINT `Logs_levelId_fkey` FOREIGN KEY (`levelId`) REFERENCES `LogLevel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
