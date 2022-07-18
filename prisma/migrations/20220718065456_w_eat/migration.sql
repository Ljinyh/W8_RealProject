/*
  Warnings:

  - You are about to alter the column `nickname` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(20)`.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `customerId` VARCHAR(191) NULL,
    MODIFY `nickname` VARCHAR(20) NOT NULL;
