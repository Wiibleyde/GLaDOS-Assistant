/*
  Warnings:

  - You are about to drop the `RadioData` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RadioFrequencies` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `RadioData` DROP FOREIGN KEY `RadioData_botMessageDataUuid_fkey`;

-- DropForeignKey
ALTER TABLE `RadioFrequencies` DROP FOREIGN KEY `RadioFrequencies_radioDataUuid_fkey`;

-- DropTable
DROP TABLE `RadioData`;

-- DropTable
DROP TABLE `RadioFrequencies`;
