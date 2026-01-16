# DevDose REST API

A RESTful API for the DevDose micro-learning platform, providing access to curated code snippets with comprehensive Swagger documentation.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase account with database configured
- Environment variables configured

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file with the following variables:

```bash
# API Configuration
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running the API

```bash
# Development mode with auto-reload
npm run api:dev

# Production mode
npm run api
```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

Interactive Swagger UI documentation is available at:

- **Local**: http://localhost:3000/api-docs
- **Production**: https://api.devdose.app/api-docs

## 🔗 Endpoints

### Posts

- `GET /api/posts` - List posts with pagination and filtering
- `GET /api/posts/:id` - Get single post by ID
- `GET /api/posts/random` - Get random post(s)
- `GET /api/posts/search` - Search posts by keyword

### Tags & Filters

- `GET /api/tags` - List all unique tags
- `GET /api/languages` - List all programming languages
- `GET /api/difficulties` - List difficulty levels

### Statistics

- `GET /api/stats` - Get platform statistics
- `GET /api/health` - Health check endpoint

## 📖 Usage Examples

### Get Posts

```bash
# Get first page of posts
curl http://localhost:3000/api/posts

# Filter by language and difficulty
curl "http://localhost:3000/api/posts?language=javascript&difficulty=beginner&limit=10"

# Filter by tags
curl "http://localhost:3000/api/posts?tags=react,hooks"

# Sort by quality score
curl "http://localhost:3000/api/posts?sort=quality_score&order=desc"
```

### Get Single Post

```bash
curl http://localhost:3000/api/posts/{post-id}
```

### Get Random Posts

```bash
# Get 3 random JavaScript posts
curl "http://localhost:3000/api/posts/random?count=3&language=javascript"
```

### Search Posts

```bash
curl "http://localhost:3000/api/posts/search?q=async"
```

### Get Tags

```bash
curl http://localhost:3000/api/tags
```

### Get Statistics

```bash
curl http://localhost:3000/api/stats
```

## 🔒 Security Features

- **CORS**: Configurable origin restrictions
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: All query parameters validated
- **Error Handling**: Secure error messages (no sensitive data exposed)

## 🏗️ Project Structure

```
src/api/
├── server.ts                 # Express server setup
├── routes/
│   ├── posts.ts             # Posts endpoints
│   ├── tags.ts              # Tags endpoints
│   └── stats.ts             # Statistics endpoints
├── controllers/
│   ├── posts.controller.ts  # Posts logic
│   ├── tags.controller.ts   # Tags logic
│   └── stats.controller.ts  # Statistics logic
├── services/
│   └── supabase.service.ts  # Database queries
├── middleware/
│   └── error-handler.ts     # Error handling
└── swagger/
    └── openapi.yaml         # OpenAPI specification
```

## 🧪 Testing

Test endpoints using curl, Postman, or the Swagger UI:

```bash
# Health check
curl http://localhost:3000/api/health

# Get stats
curl http://localhost:3000/api/stats

# List posts
curl http://localhost:3000/api/posts?limit=5
```

## 📊 Response Format

### Success Response

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

### Error Response

```json
{
  "error": "Bad Request",
  "message": "Invalid query parameters"
}
```

## 🚢 Deployment

### Environment Variables (Production)

```bash
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://devdose.app
SUPABASE_URL=your_production_url
SUPABASE_ANON_KEY=your_production_key
```

### Build

```bash
npm run build:api
node dist/api/server.js
```

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build:api
EXPOSE 3000
CMD ["node", "dist/api/server.js"]
```

## 📈 Performance

- Response times: < 200ms for most queries
- Rate limiting: 100 req/15min per IP
- Database: Optimized Supabase queries with indexes

## 🔄 API Versioning

Current version: `v1.0.0`

Future versions will be available at `/api/v2/...`

## 📝 License

MIT
