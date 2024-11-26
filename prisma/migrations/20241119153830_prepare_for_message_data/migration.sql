-- AlterTable
ALTER TABLE `GuildData` ADD COLUMN `CalendarMessageDatauuid` VARCHAR(191) NULL,
    ADD COLUMN `calendarMessageId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `GuildData` ADD CONSTRAINT `GuildData_CalendarMessageDatauuid_fkey` FOREIGN KEY (`CalendarMessageDatauuid`) REFERENCES `BotMessageData`(`uuid`) ON DELETE SET NULL ON UPDATE CASCADE;
