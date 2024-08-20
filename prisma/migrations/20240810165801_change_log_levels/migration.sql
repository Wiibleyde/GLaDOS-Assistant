-- AlterTable
ALTER TABLE `Logs` MODIFY `message` MEDIUMTEXT NOT NULL;

-- CreateTable
CREATE TABLE `Birthdays` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
