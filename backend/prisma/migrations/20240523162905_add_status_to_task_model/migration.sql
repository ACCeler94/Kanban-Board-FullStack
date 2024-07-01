-- AlterTable
ALTER TABLE `Task` ADD COLUMN `status` ENUM('In Progress', 'Done', 'To Do') NOT NULL DEFAULT 'To Do';
