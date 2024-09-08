-- CreateTable
CREATE TABLE `QuizQuestions` (
    `uuid` VARCHAR(191) NOT NULL,
    `question` VARCHAR(191) NOT NULL,
    `answer` VARCHAR(191) NOT NULL,
    `badAnswer1` VARCHAR(191) NOT NULL,
    `badAnswer2` VARCHAR(191) NOT NULL,
    `badAnswer3` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `authorUuid` VARCHAR(191) NULL,
    `guildId` VARCHAR(191) NOT NULL,
    `lastTimeUsed` DATETIME(3) NULL,

    INDEX `QuizQuestions_guildId_idx`(`guildId`),
    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `QuizQuestions` ADD CONSTRAINT `QuizQuestions_authorUuid_fkey` FOREIGN KEY (`authorUuid`) REFERENCES `GlobalUserData`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;
