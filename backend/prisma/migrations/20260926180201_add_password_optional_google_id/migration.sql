-- AlterTable
ALTER TABLE `user` ADD COLUMN `password` VARCHAR(191) NULL,
    MODIFY `googleId` VARCHAR(191) NULL;
