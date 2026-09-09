# KalaSetu — Where Craft Meets Intelligence

> AI-powered artisan marketplace connecting India's finest craftspeople with the world.

## 🏗️ Architecture

```
Frontend (Next.js 14) → REST API (FastAPI) → PostgreSQL / SQLite
                                           → FAISS (Vector Search)
                                           → AI Pipeline (CV + Gemini + Embeddings)
                                           → Cloudinary (Image CDN)
```

## 🚀 Quick Start

### Backend

```bash
cd backend
pip install -r requirements.txt   # Or: pip install fastapi uvicorn sqlalchemy aiosqlite pydantic pydantic-settings python-jose passlib bcrypt python-multipart python-slugify python-dotenv email-validator httpx numpy Pillow
cp .env.example .env              # Edit as needed (defaults to SQLite + mock AI)
python -m app.seed                # Seed sample data
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local        # Points to http://localhost:8000
npm run dev
```

Open http://localhost:3000

### Demo Credentials

| Role    | Email               | Password       |
|---------|---------------------|----------------|
| Admin   | admin@kalasetu.com  | admin123456    |
| Artisan | priya@kalasetu.com  | artisan123456  |
| Buyer   | amit@buyer.com      | buyer123456    |

## 🔑 Features

- **AI Cataloguing**: Upload craft photos → AI generates title, description, tags, pricing
- **Hybrid Search**: PostgreSQL keyword + FAISS semantic vector search
- **Three Dashboards**: Artisan, Buyer Marketplace, Admin
- **JWT Auth**: Access + refresh tokens, role-based guards
- **SEO**: SSR pages, meta tags, sitemap, robots.txt

## 🤖 AI Services (Mocked)

All AI services work out-of-the-box with mock implementations:

| Service | Mock Behavior | To Enable Real |
|---------|--------------|----------------|
| CLIP/YOLO (CV) | Returns realistic category/material/color data | Set `USE_MOCK_AI=false`, load models |
| Gemini | Template-based descriptions | Set `GEMINI_API_KEY=...` |
| Embeddings | Deterministic pseudo-random vectors | Install `sentence-transformers` |
| Cloudinary | Uses picsum.photos placeholders | Set `CLOUDINARY_*` env vars |
| Maps | Indian craft region coordinates | Set `MAPS_API_KEY=...` |

## 📁 Project Structure

```
SIH2026/
├── backend/           # FastAPI (Python 3.11+)
│   ├── app/
│   │   ├── models/    # SQLAlchemy ORM
│   │   ├── schemas/   # Pydantic v2
│   │   ├── routers/   # API endpoints
│   │   ├── services/  # Business logic + AI
│   │   ├── middleware/ # JWT auth
│   │   └── utils/     # Security, slugs
│   └── tests/         # Pytest suite
├── frontend/          # Next.js 14 (TypeScript)
│   └── src/
│       ├── app/       # App Router pages
│       ├── components/# UI components
│       ├── lib/       # API client
│       ├── store/     # Zustand auth
│       └── types/     # TypeScript types
└── docker-compose.yml
```
