/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `LogLevel` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `LogLevel_name_key` ON `LogLevel`(`name`);
