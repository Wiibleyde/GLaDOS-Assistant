/*
  Warnings:

  - You are about to drop the column `guildId` on the `MpThreads` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `MpThreads_guildId_idx` ON `MpThreads`;

-- AlterTable
ALTER TABLE `MpThreads` DROP COLUMN `guildId`;
