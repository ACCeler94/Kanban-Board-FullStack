-- DropForeignKey
ALTER TABLE `Board` DROP FOREIGN KEY `Board_authorId_fkey`;

-- AlterTable
ALTER TABLE `Board` MODIFY `title` VARCHAR(255) NOT NULL DEFAULT 'Untitled';

-- AlterTable
ALTER TABLE `Task` MODIFY `title` VARCHAR(255) NOT NULL DEFAULT 'Untitled';

-- AddForeignKey
ALTER TABLE `Board` ADD CONSTRAINT `Board_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
