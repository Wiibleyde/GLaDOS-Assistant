/*
  Warnings:

  - The primary key for the `RadioFrequencies` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[frequency,radioDataUuid]` on the table `RadioFrequencies` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `RadioFrequencies` DROP PRIMARY KEY,
    ADD PRIMARY KEY (`uuid`);

-- CreateIndex
CREATE UNIQUE INDEX `RadioFrequencies_frequency_radioDataUuid_key` ON `RadioFrequencies`(`frequency`, `radioDataUuid`);
