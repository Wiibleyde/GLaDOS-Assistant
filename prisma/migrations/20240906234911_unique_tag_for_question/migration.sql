/*
  Warnings:

  - A unique constraint covering the columns `[question]` on the table `QuizQuestions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `QuizQuestions_question_key` ON `QuizQuestions`(`question`);
