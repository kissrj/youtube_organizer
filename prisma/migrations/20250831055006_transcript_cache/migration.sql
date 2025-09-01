-- AlterTable
ALTER TABLE "Video" ADD COLUMN "transcriptJson" TEXT;
ALTER TABLE "Video" ADD COLUMN "transcriptSource" TEXT;
ALTER TABLE "Video" ADD COLUMN "transcriptText" TEXT;
ALTER TABLE "Video" ADD COLUMN "transcriptUpdatedAt" DATETIME;
