/*
  Warnings:

  - You are about to alter the column `title` on the `Board` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.
  - Added the required column `order` to the `Subtask` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Board` MODIFY `title` VARCHAR(100) NOT NULL DEFAULT 'Untitled';

-- AlterTable
ALTER TABLE `Subtask` ADD COLUMN `order` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `picture` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `UserOnBoard` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateIndex
CREATE INDEX `UserOnBoard_createdAt_idx` ON `UserOnBoard`(`createdAt`);
