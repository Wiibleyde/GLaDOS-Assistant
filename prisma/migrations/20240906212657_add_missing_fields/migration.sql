/*
  Warnings:

  - Added the required column `category` to the `QuizQuestions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `difficulty` to the `QuizQuestions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `QuizQuestions` ADD COLUMN `category` VARCHAR(191) NOT NULL,
    ADD COLUMN `difficulty` VARCHAR(191) NOT NULL;
