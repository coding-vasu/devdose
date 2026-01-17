# DevDose

A modern, interactive web application for developers to discover, learn, and share coding tips, tricks, and best practices through an engaging TikTok-style scrolling experience.

![DevDose](https://img.shields.io/badge/Built%20with-React-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 📖 Overview

DevDose transforms the way developers consume educational content by presenting coding tips, common mistakes, and best practices in bite-sized, scrollable cards. Each card features syntax-highlighted code snippets, clear explanations, and interactive elements designed to enhance learning and retention.

## ✨ Features

- **📱 Infinite Scroll Experience**: Smooth, mobile-optimized scrolling interface
- **🎨 Beautiful UI**: Premium design with glassmorphism, gradients, and micro-animations
- **💡 Content Categories**:
  - Quick Tips - Fast, actionable coding insights
  - Common Mistakes - Learn from typical pitfalls
  - Did You Know - Discover lesser-known features
  - Quick Wins - Productivity boosters
  - Under the Hood - Deep dives into how things work
- **🎯 Syntax Highlighting**: Code snippets with proper syntax highlighting using react-syntax-highlighter
- **🏷️ Smart Tagging**: Filter and discover content by technology tags
- **📊 Engagement Metrics**: View counts and save counts for popular content
- **🌙 Dark Mode**: Eye-friendly dark theme optimized for developers
- **♿ Accessibility**: WCAG compliant with keyboard navigation and screen reader support
- **📱 Responsive Design**: Optimized for mobile, tablet, and desktop

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher) - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** or **bun** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd devdose
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Build for development environment
npm run build:dev

# Preview production build locally
npm run preview

# Run ESLint
npm run lint
```

## 🛠️ Tech Stack

### Core Technologies
- **[React 18](https://react.dev/)** - UI library with modern hooks
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Vite](https://vitejs.dev/)** - Lightning-fast build tool
- **[React Router](https://reactrouter.com/)** - Client-side routing

### UI & Styling
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality React components
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library

### Code Highlighting
- **[react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)** - Syntax highlighting for code snippets

### Additional Libraries
- **[TanStack Query](https://tanstack.com/query)** - Powerful data fetching and caching
- **[React Hook Form](https://react-hook-form.com/)** - Performant form validation
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation
- **[date-fns](https://date-fns.org/)** - Modern date utility library
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications

## 📁 Project Structure

```
devdose/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── Header.tsx      # App header with branding
│   │   ├── ContentCard.tsx # Main content card component
│   │   └── ...
│   ├── pages/              # Route pages
│   │   ├── Index.tsx       # Home page
│   │   └── NotFound.tsx    # 404 page
│   ├── data/               # Static data and content
│   │   └── sampleContent.ts # Sample coding tips and snippets
│   ├── types/              # TypeScript type definitions
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── App.tsx             # Root application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles and design tokens
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── vite.config.ts          # Vite configuration
└── README.md               # This file
```

## 🎨 Design System

The application uses a carefully crafted design system with:

- **Color Palette**: Vibrant gradients with cyan, blue, and purple accents
- **Typography**: Modern, readable font hierarchy
- **Spacing**: Consistent spacing scale
- **Animations**: Smooth transitions and micro-interactions
- **Glassmorphism**: Frosted glass effects with backdrop blur
- **Shadows**: Multi-layered shadows with colored glows

## 🌐 Deployment


### Other Deployment Options

This is a standard Vite + React application and can be deployed to:
- **Vercel**: `vercel deploy`
- **Netlify**: Drag and drop the `dist` folder
- **GitHub Pages**: Use `gh-pages` package
- **Any static hosting**: Build with `npm run build` and serve the `dist` folder



## 📝 Content Structure

Each content card includes:
- **Type**: Category (quick-tip, common-mistake, did-you-know, quick-win, under-the-hood)
- **Title**: Catchy, descriptive headline
- **Code Snippet**: Syntax-highlighted code example
- **Explanation**: Clear, concise explanation
- **Tags**: Technology/topic tags for filtering
- **Difficulty**: Beginner, Intermediate, or Advanced
- **Source**: Attribution with link to original source
- **Metrics**: View count and save count

## 🔧 Customization

### Adding New Content

Edit `src/data/sampleContent.ts` to add new coding tips:

```typescript
import { ContentCard } from '@/types/content';

export const sampleCards: ContentCard[] = [
  // Add your new content card
  {
    id: 'unique-id',
    type: 'quick-tip', // 'quick-tip' | 'common-mistake' | 'did-you-know' | 'quick-win' | 'under-the-hood'
    title: 'Optional chaining in React props',
    codeSnippet: `// ✅ Safe property access in React
const UserProfile = ({ user }: { user?: User }) => {
  return <div>{user?.profile?.name ?? 'Guest'}</div>
}`,
    explanation: 'Use optional chaining with nullish coalescing for safe prop access in React components.',
    tags: ['React', 'TypeScript'],
    difficulty: 'beginner', // 'beginner' | 'intermediate' | 'advanced'
    sourceName: 'React TypeScript Cheatsheet',
    sourceUrl: 'https://react-typescript-cheatsheet.netlify.app/',
    viewCount: 0,
    saveCount: 0,
  },
  // ... other cards
];
```

### Modifying Styles

- **Global styles**: Edit `src/index.css`
- **Tailwind config**: Edit `tailwind.config.ts`
- **Component styles**: Use Tailwind utility classes



---

**Made with ❤️ for developers, by developers**
