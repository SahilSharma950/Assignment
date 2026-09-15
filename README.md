# Mini SaaS Collaboration Platform

> A production-grade collaboration platform inspired by Notion, Trello, and Slack — built with React 19, Node.js, MongoDB, Redis, and Socket.io.

[![CI](https://github.com/your-org/mini-saas-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/mini-saas-platform/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)

---

## 📁 Project Structure

```
mini-saas-platform/
├── .github/
│   └── workflows/            # GitHub Actions CI/CD pipelines
├── .husky/
│   ├── pre-commit            # Runs lint-staged before every commit
│   └── commit-msg            # Enforces Conventional Commits format
├── architecture/
│   └── README.md             # System design & architecture decisions
├── docs/
│   ├── README.md             # Documentation index
│   └── api.md                # API reference overview
├── frontend/                 # React 19 + Vite SPA
│   ├── public/
│   │   └── icons/            # PWA app icons
│   ├── src/
│   │   ├── assets/           # Static assets (images, fonts, svgs)
│   │   ├── components/
│   │   │   ├── common/       # Shared reusable components
│   │   │   ├── layout/       # Page layout components
│   │   │   └── ui/           # Base UI primitives
│   │   ├── config/           # App-level configuration constants
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/
│   │   │   ├── auth/         # Login, Register, Reset Password
│   │   │   ├── dashboard/    # Main dashboard
│   │   │   ├── workspace/    # Workspace views (boards, docs, chat)
│   │   │   └── error/        # 404, 500 error pages
│   │   ├── services/         # Axios API client & service functions
│   │   ├── store/
│   │   │   ├── slices/       # Redux Toolkit slices
│   │   │   ├── index.ts      # Store configuration
│   │   │   └── hooks.ts      # Typed useAppSelector / useAppDispatch
│   │   ├── styles/           # Global CSS & Tailwind base
│   │   ├── types/            # Shared TypeScript interfaces
│   │   └── utils/            # Helper functions
│   └── tests/
│       ├── unit/             # Component & hook unit tests
│       └── integration/      # Page-level integration tests
├── backend/                  # Node.js + Express API Server
│   ├── src/
│   │   ├── config/           # DB, Redis, env, Swagger config
│   │   ├── controllers/      # Request handlers (thin layer)
│   │   ├── middleware/        # Auth, error, rate-limit, upload middleware
│   │   ├── models/           # Mongoose ODM models
│   │   ├── queues/           # BullMQ job queues & processors
│   │   ├── repositories/     # Data access layer (all DB queries here)
│   │   ├── routes/
│   │   │   └── v1/           # Versioned API routes
│   │   ├── services/         # Business logic layer
│   │   ├── sockets/          # Socket.io event handlers
│   │   ├── types/            # Shared backend TypeScript types
│   │   ├── utils/            # Logger, crypto, pagination helpers
│   │   ├── app.ts            # Express app factory
│   │   └── index.ts          # Server bootstrap & startup
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── services/     # Service layer unit tests
│   │   │   └── repositories/ # Repository layer unit tests
│   │   └── integration/
│   │       ├── routes/       # API route integration tests (Supertest)
│   │       └── sockets/      # Socket.io integration tests
│   ├── logs/                 # Winston log files (gitignored)
│   └── uploads/              # Multer file uploads (gitignored)
├── docker-compose.yml        # Local dev stack (MongoDB, Redis, app)
├── .eslintrc.cjs             # Root ESLint config (extended by packages)
├── .prettierrc               # Shared Prettier config
├── .gitignore
├── package.json              # Monorepo root (npm workspaces)
├── tsconfig.json             # Base TypeScript config (extended by packages)
└── README.md
```

---

## 🚀 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 5 | Build tool & dev server |
| TypeScript 5 | Type safety |
| Redux Toolkit | Global state management |
| React Router v6 | Client-side routing |
| React Query v5 | Server state & caching |
| React Hook Form | Form management |
| Tailwind CSS v3 | Utility-first styling |
| Dnd Kit | Drag-and-drop |
| Socket.io Client | Real-time communication |
| Axios | HTTP client |
| Vite PWA | Progressive Web App |

### Backend
| Technology | Purpose |
|---|---|
| Node.js 20+ | Runtime |
| Express.js 4 | HTTP framework |
| TypeScript 5 | Type safety |
| MongoDB + Mongoose | Primary database |
| Redis (ioredis) | Caching & sessions |
| BullMQ | Background job queues |
| Socket.io | Real-time events |
| JWT + Refresh Tokens | Authentication |
| Multer | File uploads |
| Swagger / OpenAPI | API documentation |
| Winston | Structured logging |
| Helmet | Security headers |
| express-rate-limit | Rate limiting |

### Testing
| Technology | Purpose |
|---|---|
| Jest 29 | Test runner |
| React Testing Library | Component testing |
| Supertest | HTTP integration testing |

### DevOps
| Technology | Purpose |
|---|---|
| Docker | Containerization |
| Docker Compose | Local dev orchestration |
| GitHub Actions | CI/CD pipelines |

---

## ⚡ Quick Start

### Prerequisites
- Node.js >= 20
- npm >= 10
- Docker & Docker Compose

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

### 3. Start infrastructure
```bash
docker-compose up -d mongodb redis
```

### 4. Run development servers
```bash
npm run dev
```

Frontend → http://localhost:3000  
Backend API → http://localhost:5000  
Swagger UI → http://localhost:5000/api/docs  

---

## 📋 Git Conventions

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

Types: feat | fix | docs | style | refactor | perf | test | chore | ci | build | revert
```

Examples:
```
feat(auth): add JWT refresh token rotation
fix(boards): resolve drag-and-drop ordering bug
docs(api): update swagger schema for workspace routes
```

---

## 📄 License

MIT © 2024 Mini SaaS Platform
