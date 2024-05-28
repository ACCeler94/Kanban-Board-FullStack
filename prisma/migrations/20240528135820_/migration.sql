/*
  Warnings:

  - A unique constraint covering the columns `[auth0Sub]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `auth0Sub` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `auth0Sub` VARCHAR(191) NOT NULL,
    MODIFY `name` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_auth0Sub_key` ON `User`(`auth0Sub`);
