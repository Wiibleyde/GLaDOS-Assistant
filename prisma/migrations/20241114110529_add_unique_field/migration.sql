/*
  Warnings:

  - A unique constraint covering the columns `[threadId]` on the table `MpThreads` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `MpThreads_threadId_key` ON `MpThreads`(`threadId`);
