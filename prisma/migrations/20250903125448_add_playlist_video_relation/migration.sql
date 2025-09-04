/*
  Warnings:

  - You are about to drop the column `description` on the `import_jobs` table. All the data in the column will be lost.
  - You are about to drop the column `errorItems` on the `import_jobs` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `import_jobs` table. All the data in the column will be lost.
  - You are about to drop the column `fileSize` on the `import_jobs` table. All the data in the column will be lost.
  - You are about to drop the column `format` on the `import_jobs` table. All the data in the column will be lost.
  - You are about to drop the column `mapping` on the `import_jobs` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `import_jobs` table. All the data in the column will be lost.
  - You are about to drop the column `processedItems` on the `import_jobs` table. All the data in the column will be lost.
  - You are about to drop the column `report` on the `import_jobs` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledAt` on the `import_jobs` table. All the data in the column will be lost.
  - You are about to drop the column `successItems` on the `import_jobs` table. All the data in the column will be lost.
  - You are about to drop the column `totalItems` on the `import_jobs` table. All the data in the column will be lost.
  - Added the required column `jobId` to the `import_jobs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobType` to the `import_jobs` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "PlaylistVideo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playlistId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlaylistVideo_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlaylistVideo_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_import_jobs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "jobType" TEXT NOT NULL,
    "overallProgress" REAL NOT NULL DEFAULT 0,
    "currentStep" TEXT,
    "videosImported" INTEGER NOT NULL DEFAULT 0,
    "playlistsImported" INTEGER NOT NULL DEFAULT 0,
    "tagsCreated" INTEGER NOT NULL DEFAULT 0,
    "categoriesCreated" INTEGER NOT NULL DEFAULT 0,
    "options" JSONB,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "expiresAt" DATETIME,
    "errors" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "import_jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_import_jobs" ("completedAt", "createdAt", "expiresAt", "id", "startedAt", "status", "updatedAt", "userId") SELECT "completedAt", "createdAt", "expiresAt", "id", coalesce("startedAt", CURRENT_TIMESTAMP) AS "startedAt", "status", "updatedAt", "userId" FROM "import_jobs";
DROP TABLE "import_jobs";
ALTER TABLE "new_import_jobs" RENAME TO "import_jobs";
CREATE UNIQUE INDEX "import_jobs_jobId_key" ON "import_jobs"("jobId");
CREATE INDEX "import_jobs_userId_idx" ON "import_jobs"("userId");
CREATE INDEX "import_jobs_status_idx" ON "import_jobs"("status");
CREATE INDEX "import_jobs_jobId_idx" ON "import_jobs"("jobId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "PlaylistVideo_playlistId_idx" ON "PlaylistVideo"("playlistId");

-- CreateIndex
CREATE INDEX "PlaylistVideo_videoId_idx" ON "PlaylistVideo"("videoId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistVideo_playlistId_videoId_key" ON "PlaylistVideo"("playlistId", "videoId");
