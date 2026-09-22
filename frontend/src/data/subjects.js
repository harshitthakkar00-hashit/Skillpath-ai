// All supported subjects/languages
export const ALL_SUBJECTS = [
  {
    id: 'python',
    name: 'Python',
    fullName: 'Python Programming',
    description: 'Variables, loops, functions, OOP, file handling.',
    icon: '🐍',
    color: '#3b82f6',
    level: 'Beginner → Advanced',
    topics: ['Python Basics', 'Loops', 'Functions', 'OOP', 'File Handling']
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    fullName: 'JavaScript Programming',
    description: 'DOM, ES6+, async/await, closures, and modern JS.',
    icon: '⚡',
    color: '#f59e0b',
    level: 'Beginner → Advanced',
    topics: ['JS Basics', 'Functions & Scope', 'DOM Manipulation', 'Async JS', 'ES6+ Features']
  },
  {
    id: 'java',
    name: 'Java',
    fullName: 'Java Programming',
    description: 'OOP, collections, exception handling, and core Java.',
    icon: '☕',
    color: '#ef4444',
    level: 'Beginner → Advanced',
    topics: ['Java Basics', 'OOP in Java', 'Collections', 'Exception Handling', 'Generics']
  },
  {
    id: 'cpp',
    name: 'C++',
    fullName: 'C++ Programming',
    description: 'Pointers, memory management, STL, and OOP.',
    icon: '⚙️',
    color: '#8b5cf6',
    level: 'Beginner → Advanced',
    topics: ['C++ Basics', 'Pointers & Memory', 'OOP in C++', 'STL', 'Templates']
  },
  {
    id: 'c',
    name: 'C',
    fullName: 'C Programming',
    description: 'Fundamentals, arrays, pointers, structs, and memory.',
    icon: '🔧',
    color: '#6b7280',
    level: 'Beginner → Intermediate',
    topics: ['C Basics', 'Arrays & Strings', 'Pointers', 'Structs', 'Memory Management']
  },
  {
    id: 'sql',
    name: 'SQL',
    fullName: 'SQL & Databases',
    description: 'Queries, joins, aggregations, indexing, and design.',
    icon: '🗄️',
    color: '#10b981',
    level: 'Beginner → Advanced',
    topics: ['SQL Basics', 'Joins', 'Aggregations', 'Subqueries', 'Database Design']
  },
  {
    id: 'html_css',
    name: 'HTML & CSS',
    fullName: 'HTML & CSS',
    description: 'Semantic HTML, flexbox, grid, responsive design.',
    icon: '🌐',
    color: '#f97316',
    level: 'Beginner → Intermediate',
    topics: ['HTML Basics', 'CSS Styling', 'Flexbox & Grid', 'Responsive Design', 'Animations']
  },
  {
    id: 'react',
    name: 'React',
    fullName: 'React.js',
    description: 'Components, hooks, state management, and routing.',
    icon: '⚛️',
    color: '#06b6d4',
    level: 'Intermediate → Advanced',
    topics: ['React Basics', 'Hooks', 'State Management', 'React Router', 'Performance']
  },
  {
    id: 'dsa',
    name: 'DSA',
    fullName: 'Data Structures & Algorithms',
    description: 'Arrays, linked lists, trees, sorting, and complexity.',
    icon: '🌲',
    color: '#84cc16',
    level: 'Intermediate → Advanced',
    topics: ['Arrays & Strings', 'Linked Lists', 'Trees & Graphs', 'Sorting & Searching', 'Dynamic Programming']
  },
  {
    id: 'git',
    name: 'Git & GitHub',
    fullName: 'Git & GitHub',
    description: 'Version control, branching, merging, and collaboration.',
    icon: '🔀',
    color: '#ec4899',
    level: 'Beginner → Intermediate',
    topics: ['Git Basics', 'Branching & Merging', 'Remote Repos', 'Collaboration', 'Advanced Git']
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    fullName: 'TypeScript',
    description: 'Types, interfaces, generics, and TS patterns.',
    icon: '🔷',
    color: '#3b82f6',
    level: 'Intermediate',
    topics: ['TS Basics', 'Types & Interfaces', 'Generics', 'Enums & Decorators', 'TS + React']
  },
  {
    id: 'dart',
    name: 'Dart / Flutter',
    fullName: 'Dart & Flutter',
    description: 'Dart language, widgets, state, and app building.',
    icon: '🎯',
    color: '#0ea5e9',
    level: 'Beginner → Advanced',
    topics: ['Dart Basics', 'Flutter Widgets', 'State Management', 'Navigation', 'API Integration']
  },
]

export function getSubjectById(id) {
  return ALL_SUBJECTS.find(s => s.id === id) || null
}

export function getSubjectByName(name) {
  return ALL_SUBJECTS.find(s => s.name === name || s.fullName === name) || null
}
