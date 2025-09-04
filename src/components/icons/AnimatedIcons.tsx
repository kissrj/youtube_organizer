'use client'

import React from 'react'

export const AnimatedNotebook: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      {/* Animated notebook icon */}
      <svg 
        className="w-8 h-8 text-white animate-bounce"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        style={{
          animation: 'notebook-pulse 2s ease-in-out infinite'
        }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
      {/* Animated pages */}
      <div className="absolute top-1 right-1 w-2 h-2 bg-white/30 rounded animate-ping" 
           style={{ animationDelay: '0.5s' }} />
      
      <style jsx>{`
        @keyframes notebook-pulse {
          0%, 100% { 
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
          25% {
            transform: scale(1.05) rotate(2deg);
            opacity: 0.9;
          }
          50% { 
            transform: scale(1.1) rotate(-1deg);
            opacity: 0.8;
          }
          75% {
            transform: scale(1.05) rotate(1deg);
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  )
}

export const AnimatedTag: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      {/* Animated tag icon */}
      <svg 
        className="w-8 h-8 text-white"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        style={{
          animation: 'tag-wiggle 1.5s ease-in-out infinite'
        }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
      {/* Animated sparkles */}
      <div className="absolute -top-1 -right-1 w-1 h-1 bg-white rounded-full animate-ping" 
           style={{ animationDelay: '0s' }} />
      <div className="absolute -top-2 left-1 w-1 h-1 bg-white rounded-full animate-ping" 
           style={{ animationDelay: '0.7s' }} />
      <div className="absolute top-0 -left-1 w-1 h-1 bg-white rounded-full animate-ping" 
           style={{ animationDelay: '1.4s' }} />
      
      <style jsx>{`
        @keyframes tag-wiggle {
          0%, 100% { 
            transform: rotate(0deg) scale(1);
          }
          25% {
            transform: rotate(5deg) scale(1.02);
          }
          50% { 
            transform: rotate(-3deg) scale(1.05);
          }
          75% {
            transform: rotate(2deg) scale(1.02);
          }
        }
      `}</style>
    </div>
  )
}

export const AnimatedTrash: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      {/* Animated trash icon */}
      <svg 
        className="w-8 h-8 text-white"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        style={{
          animation: 'trash-shake 2s ease-in-out infinite'
        }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      {/* Animated warning lines */}
      <div className="absolute inset-0 flex flex-col justify-center items-center space-y-1">
        <div className="w-4 h-0.5 bg-red-300 animate-pulse" 
             style={{ animationDelay: '0.3s' }} />
        <div className="w-4 h-0.5 bg-red-300 animate-pulse" 
             style={{ animationDelay: '0.6s' }} />
        <div className="w-4 h-0.5 bg-red-300 animate-pulse" 
             style={{ animationDelay: '0.9s' }} />
      </div>
      
      <style jsx>{`
        @keyframes trash-shake {
          0%, 100% { 
            transform: translateX(0) rotate(0deg);
          }
          20% {
            transform: translateX(-2px) rotate(-1deg);
          }
          40% { 
            transform: translateX(2px) rotate(1deg);
          }
          60% {
            transform: translateX(-1px) rotate(-0.5deg);
          }
          80% {
            transform: translateX(1px) rotate(0.5deg);
          }
        }
      `}</style>
    </div>
  )
}