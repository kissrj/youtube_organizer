-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Video" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "youtubeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnailUrl" TEXT,
    "channelTitle" TEXT,
    "channelId" TEXT,
    "duration" TEXT,
    "viewCount" TEXT,
    "likeCount" TEXT,
    "commentCount" TEXT,
    "favoriteCount" TEXT,
    "publishedAt" DATETIME,
    "definition" TEXT,
    "dimension" TEXT,
    "projection" TEXT,
    "defaultAudioLanguage" TEXT,
    "categoryId" TEXT,
    "videoTags" TEXT,
    "searchContent" TEXT,
    "contentSummary" TEXT,
    "keywords" TEXT,
    "language" TEXT,
    "transcriptStatus" TEXT,
    "transcriptJson" TEXT,
    "transcriptText" TEXT,
    "transcriptSource" TEXT,
    "transcriptUpdatedAt" DATETIME,
    "isWatched" BOOLEAN NOT NULL DEFAULT false,
    "watchedAt" DATETIME,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Video_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Video" ("categoryId", "channelId", "channelTitle", "commentCount", "contentSummary", "createdAt", "defaultAudioLanguage", "definition", "description", "dimension", "duration", "favoriteCount", "id", "keywords", "language", "likeCount", "projection", "publishedAt", "searchContent", "thumbnailUrl", "title", "transcriptJson", "transcriptSource", "transcriptStatus", "transcriptText", "transcriptUpdatedAt", "updatedAt", "userId", "videoTags", "viewCount", "youtubeId") SELECT "categoryId", "channelId", "channelTitle", "commentCount", "contentSummary", "createdAt", "defaultAudioLanguage", "definition", "description", "dimension", "duration", "favoriteCount", "id", "keywords", "language", "likeCount", "projection", "publishedAt", "searchContent", "thumbnailUrl", "title", "transcriptJson", "transcriptSource", "transcriptStatus", "transcriptText", "transcriptUpdatedAt", "updatedAt", "userId", "videoTags", "viewCount", "youtubeId" FROM "Video";
DROP TABLE "Video";
ALTER TABLE "new_Video" RENAME TO "Video";
CREATE UNIQUE INDEX "Video_youtubeId_key" ON "Video"("youtubeId");
CREATE UNIQUE INDEX "Video_userId_youtubeId_key" ON "Video"("userId", "youtubeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
