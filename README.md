<p align="center">
</p>

<h1 align="center">AI Code Review Agent</h1>
<p align="center">
  <em>Enterprise AI Code Review Platform powered by Large Language Models</em>
</p>

<p align="center">
  <a href="https://github.com/codesage-ai/AI-Code-Review-Agent/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"/></a>
  <a href="https://github.com/codesage-ai/AI-Code-Review-Agent/releases"><img src="https://img.shields.io/github/v/release/codesage-ai/codesage" alt="Release"/></a>
  <a href="https://github.com/codesage-ai/AI-Code-Review-Agent/actions"><img src="https://img.shields.io/github/actions/workflow/status/codesage-ai/AI-Code-Review-Agent/ci.yml" alt="CI"/></a>
  <a href="https://codecov.io/gh/codesage-ai/codesage"><img src="https://codecov.io/gh/codesage-ai/AI-Code-Review-Agent/branch/main/graph/badge.svg" alt="Coverage"/></a>
  <a href="https://codesage.ai"><img src="https://img.shields.io/badge/demo-live-brightgreen" alt="Demo"/></a>
</p>

---

## 🚀 Overview

**AI Code Review Agent** is an enterprise-grade, production-ready AI-powered code review platform that goes far beyond simple linting. It combines **static analysis**, **machine learning**, and **large language models** to provide comprehensive, context-aware code reviews that learn and adapt to your team's standards.

### Why AI Code Review Agent?

- **🔍 Deeper than Linters**: Catches logical bugs, security vulnerabilities, and architectural issues that traditional tools miss.
- **🧠 AI-Powered**: Uses state-of-the-art LLMs (Llama 3, Qwen) with RAG pipeline for context-aware reviews.
- **🏢 Enterprise-Ready**: Designed for teams with custom coding standards, multiple repositories, and CI/CD integration.
- **📊 Actionable Insights**: Not just issues — explains *why* it's a problem and suggests *how* to fix it.
- **🔄 Continuous Learning**: Improves over time by learning from accepted/rejected reviews.

---

## ✨ Features

### 🔐 Security Analysis
- SQL Injection, XSS, Command Injection detection
- Hardcoded secrets & credentials scanning
- Weak cryptography identification
- OWASP Top 10 vulnerability scanning
- Supply chain attack detection

### 📊 Code Quality
- Cyclomatic complexity analysis
- Maintainability index calculation
- Duplicate code detection
- Dead code elimination suggestions
- Technical debt quantification

### 🤖 AI-Powered Reviews
- Natural language explanations for every issue
- Automatic fix generation with code
- Impact assessment (Critical/Major/Minor)
- Confidence scoring with reasoning
- Style-aware reviews matching your team's conventions

### 🎯 Smart Features
- **RAG-Powered Knowledge Base**: Indexes your documentation, past PRs, and coding guidelines
- **Automatic Test Generation**: Creates pytest, JUnit, Jest, and Go tests
- **Code Explanation**: Explains any function with complexity analysis
- **AI Chat**: Natural language queries about your codebase
- **PR Summaries**: Executive summaries with risk scores and deployment insights

### 🔌 Integrations
- GitHub OAuth & App integration
- Slack & Microsoft Teams notifications
- VS Code & Browser extensions
- Webhooks & REST API
- Docker & Kubernetes support

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                     │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌────────────────┐  │
│  │ Dashboard│ │ Reviews │ │ Explorer │ │ AI Chat        │  │
│  └─────────┘ └─────────┘ └──────────┘ └────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS / WSS
┌──────────────────────▼──────────────────────────────────────┐
│                    Nginx Reverse Proxy                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    FastAPI Backend                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │ Auth API │ │ Review   │ │ Analysis │ │ Webhook       │  │
│  │          │ │ API      │ │ API      │ │ Handler       │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Service Layer                                        │  │
│  │  ┌────────┐┌──────────┐┌─────────┐┌───────────────┐  │  │
│  │  │ Git    ││ AST      ││ Security││ AI Orchestrator│  │  │
│  │  │ Service││ Analyzer ││ Scanner ││ (LangGraph)    │  │  │
│  │  └────────┘└──────────┘└─────────┘└───────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Message Queue (RabbitMQ)                  │
└──────┬──────────────────────┬───────────────────┬───────────┘
       │                      │                   │
┌──────▼──────┐ ┌─────────────▼───────────┐ ┌────▼──────────┐
│  Redis      │ │  Celery Workers         │ │  PostgreSQL   │
│  Cache/Sess │ │  ┌──────────────────┐   │ │  Primary DB   │
│  Rate Limit │ │  │ Review Worker    │   │ └───────────────┘
│  Pub/Sub    │ │  │ Analysis Worker  │   │ ┌──────────────┐
└─────────────┘ │  │ Test Gen Worker  │   │ │ Chroma/FAISS │
                │  │ Embedding Worker │   │ │ Vector DB    │
                │  └──────────────────┘   │ └──────────────┘
                └─────────────────────────┘
```

### 🧩 Components

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | React + TypeScript + Vite | User interface with Monaco Editor |
| **Backend** | FastAPI + Python 3.14 | REST API with OpenAPI docs |
| **Cache** | Redis | Session management, rate limiting, queues |
| **Database** | PostgreSQL | Primary data store |
| **Vector DB** | Chroma/FAISS | Semantic search & RAG pipeline |
| **Message Queue** | RabbitMQ | Async task distribution |
| **Workers** | Celery | Background processing |
| **AI/ML** | LangGraph + LangChain | AI orchestration & agents |
| **AST Parser** | Tree-sitter | Language-aware code parsing |

---

## 📋 Tech Stack

### Backend
- **Python 3.14+** with type hints
- **FastAPI** for REST API
- **SQLAlchemy 2.0** async ORM
- **Alembic** for migrations
- **Pydantic v2** for validation
- **Celery** for task queue
- **Redis** for caching
- **RabbitMQ** for message broker
- **Tree-sitter** for AST parsing
- **GitPython** for git operations

### AI/ML
- **LangGraph** for agent orchestration
- **LangChain** for LLM integration
- **Llama 3 / Qwen** models
- **Sentence Transformers** for embeddings
- **FAISS / Chroma** for vector storage
- **RAG Pipeline** for contextual retrieval

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Shadcn UI** for components
- **React Query** for data fetching
- **Framer Motion** for animations
- **Monaco Editor** for code display

### DevOps
- **Docker** & **Docker Compose**
- **Nginx** reverse proxy
- **GitHub Actions** CI/CD
- **Prometheus** monitoring
- **Grafana** dashboards

---

## 🚦 Getting Started

### Prerequisites
- Python 3.14+
- Node.js 22+
- Docker & Docker Compose
- PostgreSQL 16+
- Redis 7+
- RabbitMQ 4+

### Quick Start

```bash
# Clone the repository
git clone https://github.com/onirbandey2-dotcom/AI-Code-Review-Agent.git
cd AI-Code-Review-Agent

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Start with Docker
docker compose up -d

# Or manually:
# Backend
cd backend
poetry install
poetry run uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev

# Workers
cd workers
poetry install
poetry run celery -A app.worker worker -l info
```

### Access Points
- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:8000/docs
- **Redis Commander**: http://localhost:8081
- **RabbitMQ Management**: http://localhost:15672
- **Flower (Celery Monitor)**: http://localhost:5555

---

## 🏛 Project Structure

```
AI-Code-Review-Agent/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/               # Route handlers
│   │   ├── core/              # Config, security, dependencies
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   ├── repositories/      # Data access layer
│   │   ├── workers/           # Celery task definitions
│   │   └── main.py           # Application entry
│   ├── alembic/               # Database migrations
│   ├── tests/                 # Test suite
│   └── Dockerfile
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── hooks/             # Custom hooks
│   │   ├── pages/             # Route pages
│   │   ├── services/          # API client
│   │   ├── store/             # State management
│   │   ├── types/             # TypeScript types
│   │   └── App.tsx
│   └── Dockerfile
├── workers/                    # Celery workers
├── docker/                    # Docker configs
├── tests/                     # Integration tests
├── docs/                      # Documentation
├── scripts/                   # Utility scripts
├── .github/                   # GitHub Actions
├── docker-compose.yml         # Multi-container setup
└── README.md
```

---

## 📚 API Documentation

Detailed API documentation is available at `/docs` when running the server, or in our [API Reference](docs/api.md).

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/github` | GitHub OAuth login |
| `GET` | `/api/v1/repositories` | List connected repos |
| `POST` | `/api/v1/reviews` | Create pull request review |
| `GET` | `/api/v1/reviews/{id}` | Get review details |
| `POST` | `/api/v1/analysis/security` | Run security scan |
| `POST` | `/api/v1/analysis/quality` | Run quality analysis |
| `POST` | `/api/v1/ai/explain` | Explain code selected |
| `POST` | `/api/v1/ai/tests` | Generate unit tests |
| `GET` | `/api/v1/chat/{session_id}` | AI Chat session |

---

## 🧪 Testing

```bash
# Backend tests
cd backend
poetry run pytest --cov=app --cov-report=html

# Frontend tests
cd frontend
npm run test

# E2E tests
npm run test:e2e
```

---

## 🤝 Contributing

We welcome contributions! Please see our [GitHub Repository](CONTRIBUTING.md).

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📈 Performance

AI Code Review Agent is designed for scale:
- **500+ concurrent reviews** per instance
- **< 2 seconds** average review time for repos under 100K LOC
- **99.9% uptime** with proper deployment
- **Horizontal scaling** for workers and API servers

---

## 🛡 Security

- JWT with RSA-256 signatures
- OAuth 2.0 (GitHub)
- Rate limiting (1000 req/min per user)
- Input sanitization
- SQL injection prevention (ORM)
- CORS configured
- HTTPS enforced
- Secrets management via Vault

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🌟 Star History

[![](https://api.star-history.com/svg?repos=codesage-ai/codesage&type=Date)](https://star-history.com/#codesage-ai/codesage&Date)

---

<p align="center">
  Developed and maintained by **Onirban Dey**
  <br>
  <a href="https://codesage.ai">Website</a> •
  <a href="https://docs.codesage.ai">Documentation</a> •
  <a href="https://blog.codesage.ai">Blog</a>
</p>


---

## 👨‍💻 Author

Developed and maintained by **Onirban Dey**.

⭐ If you found this project useful, consider giving it a star!


