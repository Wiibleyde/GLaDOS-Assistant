/*
  Warnings:

  - A unique constraint covering the columns `[key,guildId]` on the table `config` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `config_key_guildId_key` ON `config`(`key`, `guildId`);
