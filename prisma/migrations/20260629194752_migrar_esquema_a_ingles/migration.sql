/*
  Warnings:

  - You are about to drop the `Aviso` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `Aviso`;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `desc` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dateGuaranty` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
