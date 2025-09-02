// src/lib/data/default-notebooks.ts
export interface DefaultNotebook {
  id: string
  name: string
  description: string
  icon: string
  color: string
  category: string
  isDefault: boolean
}

export const defaultNotebooks: DefaultNotebook[] = [
  {
    id: 'personal-growth',
    name: 'Personal Growth',
    description: 'Notes, reflections, and resources to help you evolve mentally and emotionally.',
    icon: 'User',
    color: 'from-purple-500 to-indigo-600',
    category: 'Personal',
    isDefault: true
  },
  {
    id: 'favorites',
    name: 'Favorites',
    description: 'Your go-to content: videos, articles, quotes, or anything you love revisiting.',
    icon: 'Heart',
    color: 'from-pink-500 to-rose-600',
    category: 'Personal',
    isDefault: true
  },
  {
    id: 'watch-later',
    name: 'Watch Later',
    description: 'A curated list of things you want to watch when you have time to dive in.',
    icon: 'Clock',
    color: 'from-blue-500 to-cyan-600',
    category: 'Media',
    isDefault: true
  },
  {
    id: 'creative-inspiration',
    name: 'Creative Inspiration',
    description: 'Sparks of creativity — ideas, visuals, and concepts that fuel your imagination.',
    icon: 'Sparkles',
    color: 'from-orange-500 to-red-600',
    category: 'Creative',
    isDefault: true
  },
  {
    id: 'learning-hub',
    name: 'Learning Hub',
    description: 'A central place for tutorials, courses, and educational content.',
    icon: 'GraduationCap',
    color: 'from-green-500 to-emerald-600',
    category: 'Education',
    isDefault: true
  },
  {
    id: 'mindset-motivation',
    name: 'Mindset & Motivation',
    description: 'Uplifting thoughts, affirmations, and strategies to stay focused and inspired.',
    icon: 'Target',
    color: 'from-yellow-500 to-orange-600',
    category: 'Personal',
    isDefault: true
  },
  {
    id: 'health-wellness',
    name: 'Health & Wellness',
    description: 'Tips, routines, and info to support your physical and mental well-being.',
    icon: 'Heart',
    color: 'from-teal-500 to-green-600',
    category: 'Health',
    isDefault: true
  },
  {
    id: 'documentaries-real-stories',
    name: 'Documentaries & Real Stories',
    description: 'Thought-provoking content that explores real-life events and perspectives.',
    icon: 'Film',
    color: 'from-slate-600 to-gray-700',
    category: 'Media',
    isDefault: true
  },
  {
    id: 'language-learning',
    name: 'Language Learning',
    description: 'Vocabulary, grammar tips, and practice materials for mastering new languages.',
    icon: 'Languages',
    color: 'from-violet-500 to-purple-600',
    category: 'Education',
    isDefault: true
  },
  {
    id: 'science-curiosity',
    name: 'Science & Curiosity',
    description: 'Fascinating facts, discoveries, and theories that expand your understanding.',
    icon: 'Microscope',
    color: 'from-blue-600 to-indigo-700',
    category: 'Science',
    isDefault: true
  },
  {
    id: 'business-entrepreneurship',
    name: 'Business & Entrepreneurship',
    description: 'Insights, strategies, and case studies for building and growing ventures.',
    icon: 'Briefcase',
    color: 'from-emerald-600 to-teal-700',
    category: 'Business',
    isDefault: true
  },
  {
    id: 'art-culture',
    name: 'Art & Culture',
    description: 'A celebration of creativity, history, and global artistic expression.',
    icon: 'Palette',
    color: 'from-rose-500 to-pink-600',
    category: 'Creative',
    isDefault: true
  },
  {
    id: 'spirituality-philosophy',
    name: 'Spirituality & Philosophy',
    description: 'Deep thoughts, beliefs, and questions about existence and meaning.',
    icon: 'Brain',
    color: 'from-indigo-600 to-purple-700',
    category: 'Philosophy',
    isDefault: true
  },
  {
    id: 'practical-skills',
    name: 'Practical Skills',
    description: 'How-to guides and resources for everyday tasks and lifelong skills.',
    icon: 'Wrench',
    color: 'from-amber-600 to-orange-700',
    category: 'Skills',
    isDefault: true
  },
  {
    id: 'world-current-events',
    name: 'World & Current Events',
    description: 'News, analysis, and reflections on what\'s happening around the globe.',
    icon: 'Globe',
    color: 'from-cyan-600 to-blue-700',
    category: 'News',
    isDefault: true
  },
  {
    id: 'history-society',
    name: 'History & Society',
    description: 'Stories and lessons from the past that shape our present and future.',
    icon: 'BookOpen',
    color: 'from-stone-600 to-slate-700',
    category: 'History',
    isDefault: true
  },
  {
    id: 'design-aesthetics',
    name: 'Design & Aesthetics',
    description: 'Visual inspiration, trends, and design principles that catch your eye.',
    icon: 'Eye',
    color: 'from-fuchsia-500 to-pink-600',
    category: 'Design',
    isDefault: true
  },
  {
    id: 'humor-entertainment',
    name: 'Humor & Entertainment',
    description: 'Light-hearted content to make you laugh and unwind.',
    icon: 'Laugh',
    color: 'from-yellow-400 to-orange-500',
    category: 'Entertainment',
    isDefault: true
  },
  {
    id: 'my-ideas',
    name: 'My Ideas',
    description: 'Your personal brainstorm space — raw thoughts, sketches, and wild concepts.',
    icon: 'Lightbulb',
    color: 'from-lime-500 to-green-600',
    category: 'Personal',
    isDefault: true
  },
  {
    id: 'knowledge-journal',
    name: 'Knowledge Journal',
    description: 'A daily log of what you\'ve learned, discovered, or want to remember.',
    icon: 'BookMarked',
    color: 'from-sky-500 to-blue-600',
    category: 'Personal',
    isDefault: true
  }
]

// Helper function to get notebook by ID
export function getDefaultNotebookById(id: string): DefaultNotebook | undefined {
  return defaultNotebooks.find(notebook => notebook.id === id)
}

// Helper function to get notebooks by category
export function getNotebooksByCategory(category: string): DefaultNotebook[] {
  return defaultNotebooks.filter(notebook => notebook.category === category)
}

// Helper function to get all categories
export function getAllCategories(): string[] {
  return [...new Set(defaultNotebooks.map(notebook => notebook.category))]
}