/*
  Warnings:

  - You are about to drop the column `radioFrequency` on the `RadioData` table. All the data in the column will be lost.
  - Added the required column `radioDataUuid` to the `RadioData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `RadioData` DROP COLUMN `radioFrequency`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `radioDataUuid` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `RadioFrequencies` (
    `uuid` VARCHAR(191) NOT NULL,
    `frequency` VARCHAR(191) NOT NULL,
    `radioDataUuid` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RadioFrequencies` ADD CONSTRAINT `RadioFrequencies_radioDataUuid_fkey` FOREIGN KEY (`radioDataUuid`) REFERENCES `RadioData`(`uuid`) ON DELETE RESTRICT ON UPDATE CASCADE;
