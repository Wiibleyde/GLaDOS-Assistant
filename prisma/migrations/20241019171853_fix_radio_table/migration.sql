/*
  Warnings:

  - You are about to drop the column `radioDataUuid` on the `RadioData` table. All the data in the column will be lost.
  - The primary key for the `RadioFrequencies` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `uuid` on the `RadioFrequencies` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `RadioData` DROP COLUMN `radioDataUuid`;

-- AlterTable
ALTER TABLE `RadioFrequencies` DROP PRIMARY KEY,
    DROP COLUMN `uuid`,
    ADD PRIMARY KEY (`frequency`, `radioDataUuid`);
