'use client';

import { useState } from 'react';
import { AutoTagRules } from '@/components/autoTags/AutoTagRules';
import { VideoAnalysis } from '@/components/autoTags/VideoAnalysis';
import { AutoTagStats } from '@/components/autoTags/AutoTagStats';

export default function AutoTagsPage() {
  const [activeTab, setActiveTab] = useState<'rules' | 'analysis' | 'stats'>('rules');
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Auto Tags</h1>
        <p className="text-muted-foreground">
          Intelligent system for video analysis and automatic tag suggestions
        </p>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-2 px-1 font-medium ${
              activeTab === 'rules'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Rules
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`py-2 px-1 font-medium ${
              activeTab === 'analysis'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Analysis
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-2 px-1 font-medium ${
              activeTab === 'stats'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Statistics
          </button>
        </nav>
      </div>

      <div className="space-y-6">
        {/* Rules Section */}
        {activeTab === 'rules' && (
          <div>
            <AutoTagRules />
          </div>
        )}

        {/* Analysis Section */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Video Analysis</h2>
              <p className="text-gray-600 mb-4">
                Select a video to analyze and get automatic tag suggestions
              </p>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video ID
                </label>
                <input
                  type="text"
                  placeholder="Enter the YouTube video ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setSelectedVideoId(e.target.value)}
                  value={selectedVideoId || ''}
                />
              </div>
            </div>

            {selectedVideoId && (
              <VideoAnalysis
                videoId={selectedVideoId}
                onAnalysisComplete={(analysis) => {
                  console.log('Analysis complete:', analysis);
                }}
              />
            )}
          </div>
        )}

        {/* Statistics Section */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Auto Tags Statistics</h2>
              <p className="text-gray-600">
                Metrics and performance of the automatic tagging system
              </p>
            </div>

            <AutoTagStats />
          </div>
        )}
      </div>
    </div>
  );
}
