-- DropForeignKey
ALTER TABLE `Quote` DROP FOREIGN KEY `Quote_authorUuid_fkey`;

-- AddForeignKey
ALTER TABLE `Quote` ADD CONSTRAINT `Quote_authorUuid_fkey` FOREIGN KEY (`authorUuid`) REFERENCES `GlobalUserData`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;
