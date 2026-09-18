# PhysioMind — Intelligence Beyond Reading

AI-powered study platform for physiotherapy students: upload PDFs, get summaries, generate quizzes, flashcards, notes, timed mock exams and study plans, chat with your documents, and track your exam readiness with gamification.

## Features

- **Document intelligence** — upload PDF / MD / TXT / DOCX, get page-level parsing, summaries and AI annotations.
- **AI Tutor chat** — ask questions grounded in your uploaded material, with cited page sources and quick actions.
- **Quiz & Exam Mode** — generate MCQs, take timed mock exams with auto-grading and per-question explanations.
- **Flashcards** — spaced-repetition review with mastery levels.
- **Study Planner** — AI-generated weekly plans with task checklists and progress tracking.
- **Knowledge Graph** — visual concept maps extracted from your documents.
- **Analytics & Exam Readiness** — weighted readiness score, performance trends, topic mastery and recommendations.
- **Gamification** — XP, levels, badges and a global leaderboard.
- **Global Search** — instant search across documents, notes, flashcards, quizzes and chats.
- **Realtime** — in-app notifications and progress tracking.
- **Works without AI keys** — a deterministic mock provider powers every AI feature out of the box.

## Architecture

```
                    ┌────────────────────────────┐
                    │        Presentation        │
                    │     React + Tailwind UI    │
                    └──────────────┬─────────────┘
                                   │
                    Redux Toolkit / TanStack Query
                                   │
                    ┌──────────────▼─────────────┐
                    │      Application Layer     │
                    │ Business Logic & Services  │
                    └──────────────┬─────────────┘
                                   │
                         Express REST APIs
                                   │
                    ┌──────────────▼─────────────┐
                    │       Domain Layer         │
                    │ AI • PDF • Quiz • Notes    │
                    └──────────────┬─────────────┘
                                   │
                     MongoDB + S3 + Vector DB
                                   │
                    ┌──────────────▼─────────────┐
                    │     Infrastructure Layer   │
                    │ Database • Storage • AI    │
                    └────────────────────────────┘
```

## Project Structure

```
PhysioMind/
├── .github/workflows/ci.yml   GitHub Actions CI (typecheck, lint, tests, build)
├── docker-compose.yml         Mongo + API + web
├── client/                    React 19 + Vite + Redux Toolkit + TanStack Query + Tailwind
│   ├── src/pages/             Dashboard, Documents, Chat, Quiz, Exams, Plans, Analytics, …
│   └── src/services/          Typed API client modules
└── server/                    Express + MongoDB (controller / service / repository / model)
    ├── docs/swagger.ts        OpenAPI 3.0 spec (served at /api-docs)
    ├── tests/api.test.ts      Vitest + Supertest integration tests
    ├── config/env.ts          Zod-validated environment
    └── ai/                    Pluggable LLM provider (openai | anthropic | mock)
```

## Prerequisites

- **Node.js >= 20** and npm
- **MongoDB** (optional) — the server auto-falls back to an in-memory MongoDB when none is reachable, so it runs out of the box. For persistence use a local `mongod` or MongoDB Atlas.
- Optional AI keys for real (non-mock) summaries, quizzes, chat, exams and plans.

## Quick Start (local)

```bash
npm install

cp server/.env.example server/.env
cp client/.env.example client/.env

npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:5001/health
- API docs: http://localhost:5001/api-docs

### Demo accounts

Seed all three roles with:

```bash
npm run seed -w server
```

| Role    | Email                     | Password     |
| ------- | ------------------------- | ------------ |
| Student | student@physiomind.dev    | `Student@123`|
| Faculty | faculty@physiomind.dev    | `Faculty@123`|
| Admin   | admin@physiomind.dev      | `Admin@123`  |

## Docker

Build and run the whole stack (MongoDB + API + Nginx web):

```bash
docker compose up --build
```

- Web app: http://localhost:8080
- API: http://localhost:5001/api/v1
- API docs: http://localhost:5001/api-docs

Stop with `docker compose down` (add `-v` to wipe the Mongo volume).

## Scripts

| Command                   | Description                                |
| ------------------------- | ------------------------------------------ |
| `npm run dev`             | Run server + client concurrently           |
| `npm run dev:server`      | Run Express with tsx watch                 |
| `npm run dev:client`      | Run Vite dev server                        |
| `npm run build`           | Production build of the client             |
| `npm start`               | Start production server (serves client)    |
| `npm run seed -w server`  | Seed demo accounts                         |
| `npm test -w server`      | Run integration tests (Vitest + Supertest) |
| `npm run lint`            | Lint client + server                       |
| `npm run typecheck -w client` | Client TypeScript check                |

## Environment Variables

See `server/.env.example` and `client/.env.example`. Key variables:

| Variable             | Default                              | Description                              |
| -------------------- | ------------------------------------ | ---------------------------------------- |
| `PORT`               | `5001`                               | API port                                 |
| `MONGODB_URI`        | `mongodb://127.0.0.1:27017/physiomind` | Mongo connection string (falls back to in-memory) |
| `AI_PROVIDER`        | `mock`                               | `openai` \| `anthropic` \| `mock`        |
| `JWT_ACCESS_SECRET`  | `change-me-access-secret`            | Signing secret for access tokens         |
| `JWT_REFRESH_SECRET` | `change-me-refresh-secret`           | Signing secret for refresh tokens        |
| `CLIENT_URL`         | `http://localhost:5173`              | CORS origin(s), comma-separated          |
| `USE_S3` / `S3_*`    | `false`                              | Optional S3-compatible object storage    |

> **Security:** change the JWT secrets before any public deployment.

## API

Interactive OpenAPI docs are served at `/api-docs` (Swagger UI). Summary of routes under `/api/v1`:

`auth`, `documents`, `chat`, `quiz`, `flashcards`, `notes`, `plans`, `exams`, `analytics`, `graph`, `gamification`, `search`, `tutor`, `notifications`, `progress`, `users`, `admin`, `realtime`.

## CI

`.github/workflows/ci.yml` runs on every push/PR to `main`:

- Server: build (tsc), lint, integration tests against a Mongo service container.
- Client: typecheck, lint, production build.
