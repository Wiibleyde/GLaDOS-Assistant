/*
  Warnings:

  - A unique constraint covering the columns `[guildId]` on the table `GuildData` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `GuildData_guildId_key` ON `GuildData`(`guildId`);
