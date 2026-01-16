# DevDose - Micro-Learning Platform for Developers

> **Replace mindless scrolling with purposeful learning**  
> Bite-sized code snippets and developer tips in an Instagram-style feed.

**Tagline:** Transforming scrolling time into continuous professional development  
**Target:** Frontend developers looking to stay current with modern web technologies

---

## 🎯 What is DevDose?

DevDose is a micro-learning platform that delivers bite-sized coding lessons, tips, and best practices through an engaging, Instagram-style vertical feed. Each post is designed for ~30-second consumption, featuring:

- 🎨 Syntax-highlighted code snippets
- 📝 Concise explanations
- 🏷️ Technology tags (React, TypeScript, CSS, etc.)
- 🔗 Source attribution with repository links
- 📊 Difficulty indicators (Beginner/Intermediate/Advanced)

Perfect for learning during commutes, coffee breaks, or replacing mindless social media scrolling.

---

## 📁 Project Structure (Monorepo)

```
DevDose/
├── apps/
│   ├── backend/              # Backend API + Content Pipeline
│   │   ├── src/
│   │   │   ├── api/         # REST API endpoints
│   │   │   ├── pipeline/    # 6-stage content pipeline
│   │   │   ├── scripts/     # Utility scripts
│   │   │   └── cli.ts       # CLI interface
│   │   ├── tests/           # Test files
│   │   └── package.json     # @devdose/backend
│   │
│   └── frontend/            # React Frontend (Vite)
│       ├── src/
│       ├── public/
│       └── package.json     # @devdose/frontend
│
├── packages/
│   └── shared/              # Shared types & utilities
│
├── docs/                    # All documentation
│   ├── setup/              # Setup & configuration guides
│   ├── api/                # API documentation
│   ├── pipeline/           # Pipeline stage guides
│   └── guides/             # How-to guides
│
├── data/                    # Pipeline data & results
│   ├── sources/            # Source configurations
│   ├── discovery/          # Discovery results
│   └── temp/               # Temporary files
│
└── scripts/                 # Build & deployment scripts
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Supabase** account for database
- **GitHub Personal Access Token** for content sourcing
- **Google Gemini API** or **Ollama** for AI processing

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/devdose.git
cd devdose

# Install dependencies for all workspaces
npm install
cd apps/backend && npm install
cd ../frontend && npm install
```

### Configuration

1. **Backend Environment** (`apps/backend/.env`):

```bash
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key

# GitHub API
GITHUB_TOKEN=your_github_token

# AI (choose one)
GEMINI_API_KEY=your_gemini_key    # or
OLLAMA_HOST=http://localhost:11434

# API
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

2. **Initialize Database**:

```bash
cd apps/backend
# Run the Supabase setup script
bash ../../scripts/setup-supabase.sh
```

### Development

```bash
# Start backend API server
cd apps/backend
npm run api               # Starts on http://localhost:3000

# Start frontend dev server (in another terminal)
cd apps/frontend
npm run dev               # Starts on http://localhost:5173

# Or run both concurrently from root
npm run dev
```

### Build

```bash
# Build all workspaces
npm run build:all

# Or build individually
npm run backend:build
npm run frontend:build
```

---

## 🎯 Core Features

### Content Feed

- Instagram-style vertical scrolling
- Syntax-highlighted code snippets (10-20 lines)
- Swipe gestures for seamless navigation
- Pull-to-refresh for new content
- Infinite scroll with pagination

### Content Discovery

- Filter by technology (React, TypeScript, CSS, etc.)
- Filter by difficulty level
- Tag-based organization
- Search functionality
- Bookmark/save posts

### User Experience

- Dark mode support
- Keyboard shortcuts
- Copy code with one click
- Source attribution with GitHub links
- Reading time indicators (~30 seconds/post)

---

## 🔧 Tech Stack

### Frontend

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS + shadcn/ui components
- **Routing**: React Router
- **State**: React Query (TanStack Query)
- **Syntax Highlighting**: react-syntax-highlighter

### Backend

- **Runtime**: Node.js + TypeScript
- **API**: Express.js with REST endpoints
- **Database**: Supabase (PostgreSQL)
- **AI/LLM**: Google Gemini AI / Ollama
- **Content Sourcing**: GitHub API (Octokit)
- **Documentation**: Swagger/OpenAPI

### Content Pipeline (6 Stages)

1. **Discovery**: Find quality sources (GitHub trending, docs)
2. **Extraction**: Extract code snippets from repositories
3. **Processing**: Generate titles & explanations with AI
4. **Quality Scoring**: Filter and rank content
5. **Enrichment**: Add tags, difficulty, metadata
6. **Publishing**: Insert into Supabase database

---

## 📖 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory:

### Setup Guides

- [**General Setup**](./docs/setup/setup.md) - Project setup instructions
- [**Supabase Setup**](./docs/setup/supabase-setup.md) - Database configuration
- [**Ollama Setup**](./docs/setup/ollama-setup.md) - Local AI model setup

### API Documentation

- [**API Reference**](./docs/api/api-readme.md) - REST API endpoints & usage

### Pipeline Documentation

- [**Pipeline Overview**](./docs/pipeline/overview.md) - Architecture & workflow
- [**1. Discovery**](./docs/pipeline/1-discovery.md) - Source discovery
- [**2. Extraction**](./docs/pipeline/2-extraction.md) - Code extraction
- [**3. Processing**](./docs/pipeline/3-processing.md) - AI content generation
- [**4. Quality Scoring**](./docs/pipeline/4-quality-scoring.md) - Quality filtering
- [**5. Enrichment**](./docs/pipeline/5-enrichment.md) - Metadata enrichment
- [**6. Publishing**](./docs/pipeline/6-publishing.md) - Database publishing

### Guides

- [**Bite-Sized Content**](./docs/guides/bite-sized-content.md) - Content creation guidelines
- [**Manual Sources**](./docs/guides/manual-sources.md) - Manual curation guide
- [**Pipeline Status**](./docs/guides/pipeline-status.md) - Pipeline monitoring
- [**Repository Verification**](./docs/guides/repo-verification.md) - Source verification

---

## 🎨 Design Patterns & Architecture

This project follows industry best practices:

### Backend Patterns

- **MVC + Service Layer**: Clean separation of concerns
- **Repository Pattern**: Data access abstraction
- **Pipeline Pattern**: Sequential content processing
- **Dependency Injection**: Testable, maintainable code

### Frontend Patterns

- **Component Composition**: Reusable UI components
- **Custom Hooks**: Reusable state logic
- **Container/Presentational**: Logic/UI separation

### Naming Conventions

- **Files**: `kebab-case.ts` (backend), `PascalCase.tsx` (components)
- **Directories**: `kebab-case`
- **Packages**: `@devdose/*` scope
- **Classes**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`

For detailed patterns, see [Design Patterns Guide](./docs/design-patterns-guide.md).

---

## 🔥 Content Pipeline

The automated content pipeline sources, processes, and publishes learning content:

### How It Works

```
GitHub Repos → Discovery → Extraction → Processing → Quality → Enrichment → Database
   Docs Sites ↗                ↓           ↓          ↓         ↓            ↓
                           Find Code   AI Title   Validate   Add Tags    Supabase
                           Snippets    + Explain   Syntax    Difficulty
```

### Running the Pipeline

```bash
cd apps/backend

# Run full pipeline
npm run pipeline

# Run individual stages
npm run discovery      # Find sources
npm run extraction     # Extract code
npm run processing     # Generate content
npm run quality        # Score quality
npm run enrichment     # Add metadata
npm run publishing     # Publish to DB

# Test with single source
npm run single-source
```

### Customization

Edit source configurations in [`data/sources/`](./data/sources/):

- `best-practices-source.json` - Curated repositories
- `example-sources.json` - Example configurations

---

## 🧪 Testing & Scripts

```bash
# Backend tests
cd apps/backend
npm run test-supabase      # Test database connection
npm run test-gemini        # Test AI model
npm run test-pipeline      # Test full pipeline

# Utility scripts
npm run verify-source      # Verify a source URL
npm run add-source         # Add new source interactively
npm run import-sources     # Bulk import sources
npm run clean-slate        # Reset pipeline data
```

---

## 📊 API Endpoints

The backend provides a REST API for the frontend:

### Posts

- `GET /api/posts` - List posts (paginated, filtered)
- `GET /api/posts/:id` - Get single post
- `GET /api/posts/random` - Get random posts
- `GET /api/posts/search?q=query` - Search posts
- `POST /api/posts/:id/report` - Report incorrect post

### Statistics

- `GET /api/tags` - Get all tags with counts
- `GET /api/languages` - Get programming languages
- `GET /api/stats` - Platform statistics

Full API documentation available at `http://localhost:3000/api-docs` (Swagger UI)

---

## 🎯 Product Vision

DevDose aims to transform idle scrolling time into continuous professional development. Our goals:

### For Developers

- **Stay Current**: Learn modern techniques without dedicated time blocks
- **Practical Knowledge**: Real code examples from production repos
- **Just-in-Time Learning**: Discover solutions when you need them
- **Zero Friction**: No courses, no commitments - just scroll and learn

### For the Platform

- **High Quality**: Only syntactically correct, tested code
- **Curated Sources**: Trusted repositories and documentation
- **Fresh Content**: Regular updates from active projects
- **Developer-First**: Built by developers, for developers

Read the complete [Product Requirements Document](./prd-devdose.md) for detailed specifications.

---

## 🛠️ Workspace Management

This is a monorepo managed with npm workspaces:

### Workspace Scripts (from root)

```bash
# Install dependencies
npm run install:all

# Development
npm run backend:api        # Start backend API
npm run frontend:dev        # Start frontend dev
npm run dev                # Run both concurrently

# Build
npm run backend:build      # Build backend
npm run frontend:build     # Build frontend
npm run build:all          # Build all workspaces
```

### Individual Workspaces

Each workspace has its own `package.json` and can be worked on independently:

```bash
# Backend
cd apps/backend
npm install
npm run api

# Frontend
cd apps/frontend
npm install
npm run dev
```

---

## 📈 Roadmap

### Phase 1: MVP ✅ (Completed)

- ✅ Vertical scrolling feed
- ✅ Syntax highlighting
- ✅ Bookmark functionality
- ✅ Technology filtering
- ✅ Dark mode
- ✅ Local persistence

### Phase 2: Content Pipeline ✅ (Completed)

- ✅ Automated content sourcing
- ✅ AI-powered content generation
- ✅ Quality filtering
- ✅ Multi-source support

### Phase 3: Enhancement (Current)

- [ ] Advanced personalization
- [ ] Collections/folders
- [ ] Search improvements
- [ ] Performance optimization

### Phase 4: Open Source (Planned)

- [ ] Public repository
- [ ] Contribution guidelines
- [ ] Community features
- [ ] Demo deployment

---

## 🤝 Contributing

This is currently a personal project. After MVP completion, it will be open-sourced under the MIT license.

Planned contribution areas:

- Content suggestions
- Bug reports
- Feature requests
- Code improvements
- Documentation updates

---

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details

---

## 👤 Author

**Vasu Vallabh**  
Personal Project - DevDose Micro-Learning Platform

---

## 🙏 Acknowledgments

Content sourced from:

- GitHub open-source repositories
- MDN Web Docs
- Official framework documentation (React, Vue, Angular)
- TypeScript Handbook
- Community contributions

---

**Built with ❤️ for developers who love to learn**
