-- DropForeignKey
ALTER TABLE `Task` DROP FOREIGN KEY `Task_boardId_fkey`;

-- DropForeignKey
ALTER TABLE `UserOnBoard` DROP FOREIGN KEY `UserOnBoard_boardId_fkey`;

-- DropForeignKey
ALTER TABLE `UserOnTask` DROP FOREIGN KEY `UserOnTask_taskId_fkey`;

-- AddForeignKey
ALTER TABLE `UserOnBoard` ADD CONSTRAINT `UserOnBoard_boardId_fkey` FOREIGN KEY (`boardId`) REFERENCES `Board`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_boardId_fkey` FOREIGN KEY (`boardId`) REFERENCES `Board`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserOnTask` ADD CONSTRAINT `UserOnTask_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `Task`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
