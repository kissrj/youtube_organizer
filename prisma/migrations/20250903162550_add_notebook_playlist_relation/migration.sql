-- CreateTable
CREATE TABLE "NotebookPlaylist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "notebookId" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NotebookPlaylist_notebookId_fkey" FOREIGN KEY ("notebookId") REFERENCES "Notebook" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "NotebookPlaylist_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Notebook" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "category" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Notebook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Notebook" ("color", "createdAt", "description", "id", "name", "updatedAt", "userId") SELECT "color", "createdAt", "description", "id", "name", "updatedAt", "userId" FROM "Notebook";
DROP TABLE "Notebook";
ALTER TABLE "new_Notebook" RENAME TO "Notebook";
CREATE INDEX "Notebook_userId_idx" ON "Notebook"("userId");
CREATE INDEX "Notebook_isDefault_idx" ON "Notebook"("isDefault");
CREATE UNIQUE INDEX "Notebook_userId_name_key" ON "Notebook"("userId", "name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "NotebookPlaylist_notebookId_idx" ON "NotebookPlaylist"("notebookId");

-- CreateIndex
CREATE INDEX "NotebookPlaylist_playlistId_idx" ON "NotebookPlaylist"("playlistId");

-- CreateIndex
CREATE UNIQUE INDEX "NotebookPlaylist_notebookId_playlistId_key" ON "NotebookPlaylist"("notebookId", "playlistId");
