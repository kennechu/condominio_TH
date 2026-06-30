/*
  Warnings:

  - You are about to drop the `AreaComun` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Departamento` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Pago` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reserva` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Usuario` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Departamento` DROP FOREIGN KEY `Departamento_usuarioId_fkey`;

-- DropForeignKey
ALTER TABLE `Pago` DROP FOREIGN KEY `Pago_departamentoId_fkey`;

-- DropForeignKey
ALTER TABLE `Reserva` DROP FOREIGN KEY `Reserva_areaComunId_fkey`;

-- DropForeignKey
ALTER TABLE `Reserva` DROP FOREIGN KEY `Reserva_departamentoId_fkey`;

-- DropTable
DROP TABLE `AreaComun`;

-- DropTable
DROP TABLE `Departamento`;

-- DropTable
DROP TABLE `Pago`;

-- DropTable
DROP TABLE `Reserva`;

-- DropTable
DROP TABLE `Usuario`;

-- CreateTable
CREATE TABLE `Resident` (
    `id` VARCHAR(191) NOT NULL,
    `first_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `correo` VARCHAR(191) NOT NULL,
    `user_name` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMINISTRADOR', 'RESIDENTE') NOT NULL DEFAULT 'RESIDENTE',
    `tagId` VARCHAR(191) NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Resident_correo_key`(`correo`),
    UNIQUE INDEX `Resident_tagId_key`(`tagId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Department` (
    `id` VARCHAR(191) NOT NULL,
    `deptNum` INTEGER NOT NULL,
    `tower` VARCHAR(191) NOT NULL,
    `residentId` VARCHAR(191) NULL,

    INDEX `Dept_residentId_fkey`(`residentId`),
    UNIQUE INDEX `Department_tower_deptNum_key`(`tower`, `deptNum`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payments` (
    `id` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `status` ENUM('PENDIENTE', 'REVISION', 'APROBADO', 'RECHAZADO') NOT NULL DEFAULT 'PENDIENTE',
    `invoiceUrl` VARCHAR(191) NULL,
    `comment` VARCHAR(191) NULL,
    `paymentDate` DATETIME(3) NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `departamentId` VARCHAR(191) NOT NULL,

    INDEX `Payment_departamentId_fkey`(`departamentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CommonArea` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `capacity` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reserve` (
    `id` VARCHAR(191) NOT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `horaInicio` DATETIME(3) NOT NULL,
    `horaFin` DATETIME(3) NOT NULL,
    `estatus` ENUM('PENDIENTE', 'APROBADA', 'CANCELADA') NOT NULL DEFAULT 'PENDIENTE',
    `fechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `departamentId` VARCHAR(191) NOT NULL,
    `commonAreaId` VARCHAR(191) NOT NULL,

    INDEX `Reserve_commonAreaId_fkey`(`commonAreaId`),
    INDEX `Reserve_departamentId_fkey`(`departamentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Department` ADD CONSTRAINT `Department_residentId_fkey` FOREIGN KEY (`residentId`) REFERENCES `Resident`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payments` ADD CONSTRAINT `Payments_departamentId_fkey` FOREIGN KEY (`departamentId`) REFERENCES `Department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reserve` ADD CONSTRAINT `Reserve_commonAreaId_fkey` FOREIGN KEY (`commonAreaId`) REFERENCES `CommonArea`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reserve` ADD CONSTRAINT `Reserve_departamentId_fkey` FOREIGN KEY (`departamentId`) REFERENCES `Department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
