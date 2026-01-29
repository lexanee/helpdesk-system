/*
  Warnings:

  - You are about to drop the column `is_system` on the `roles` table. All the data in the column will be lost.
  - You are about to drop the column `sla_due_at` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `sla_status` on the `tickets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "priorities" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "is_system";

-- AlterTable
ALTER TABLE "tickets" DROP COLUMN "sla_due_at",
DROP COLUMN "sla_status";
