-- AlterTable
ALTER TABLE "MaintenanceTicket" ADD COLUMN     "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[];

