# LexAequitas — AI-Powered Indian Legal Tech Platform

LexAequitas is a full-stack legal technology platform that brings AI into the Indian courtroom. It lets legal professionals manage cases, analyse documents, search Indian case law precedents, and run live trial simulations powered by a large language model — all from a single web application.

---

## Features

| Feature | Description |
|---|---|
| **Trial Simulation** | Interactive courtroom simulation with AI-generated prosecution, defense, and judge responses styled for Indian Sessions Court proceedings |
| **Legal Precedent Search** | Retrieve relevant Indian case law by free-text query, argument, or uploaded legal document |
| **Document Analysis** | Upload PDF, DOCX, or image files; AI extracts key legal facts, IPC sections, dates, and parties |
| **Case Management** | Full CRUD for managing cases with fields for court, judge, opposing party, hearing dates, and status |
| **Compliance Alerts** | Track legal events and deadlines with configurable reminder scheduling |
| **JWT Authentication** | Secure register/login flow with token-based route protection |

---

## Architecture

```
┌──────────────────┐      REST       ┌──────────────────────┐      HTTP       ┌──────────────────────┐
│  React Frontend  │ ──────────────► │  Spring Boot Backend │ ──────────────► │  FastAPI AI Service  │
│  (port 3000)     │                 │  (port 10000)        │                 │  (port 8000)         │
└──────────────────┘                 └──────────────────────┘                 └──────────────────────┘
                                               │                                        │
                                               ▼                                        ▼
                                       PostgreSQL DB                          OpenRouter (GPT-4o-mini)
```

- **Frontend** sends all requests to the Spring backend.
- **Spring Boot** handles auth, case/event persistence, and orchestrates AI calls.
- **FastAPI** runs NLP pre-processing (spaCy, pdfplumber, pytesseract) and forwards prompts to the LLM via OpenRouter.

---

## Tech Stack

### Frontend
- React 18, React Router v6
- Tailwind CSS, Radix UI, shadcn/ui components
- Axios for HTTP, CRACO for build config

### Backend (Java)
- Java 17, Spring Boot 3.2.5
- Spring Security + JWT (filter-based, stateless)
- Spring Data JPA with PostgreSQL
- WebFlux `WebClient` for reactive calls to the AI service

### AI Service (Python)
- FastAPI + Uvicorn
- spaCy (`en_core_web_sm`) for NLP entity extraction
- pdfplumber, python-docx, pytesseract for document parsing
- OpenAI SDK pointed at OpenRouter (`openai/gpt-4o-mini`)

### Database
- PostgreSQL 14+
- JPA-managed schema (`ddl-auto=update`), with SQL scripts in [`docs/database/`](docs/database/)

---

## Project Structure

```
lexaequitas/
├── frontend/                        # React app
│   └── src/
│       ├── pages/                   # HomePage, TrialSimulationPage, CaseManagementPage,
│       │                            #   DocumentCenterPage, ComplianceAlertsPage, AuthPage
│       ├── components/              # Layout + full shadcn/ui component library
│       └── context/AuthContext.jsx  # JWT auth context
│
├── new_folder/
│   ├── backend-java/                # Spring Boot API
│   │   └── src/main/java/com/lexaequitas/
│   │       ├── controller/          # Auth, Case, Event, Document, Simulation, Precedence
│   │       ├── service/             # Business logic + WebClient AI calls
│   │       ├── model/               # JPA entities (User, Case, Event, Document)
│   │       ├── repository/          # Spring Data repositories
│   │       └── config/              # Security, JWT, CORS, WebClient
│   │
│   └── ai-service/                  # Python FastAPI AI backend
│       └── main.py                  # All AI endpoints in a single file
│
└── docs/                            # Full documentation pack (see below)
```

---

## API Overview

### Spring Backend (`/api`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET/POST/PUT/DELETE | `/api/cases` | Case management CRUD |
| GET/POST/PUT/DELETE | `/api/events` | Compliance event CRUD |
| POST | `/api/documents` | Upload document + trigger AI analysis |
| POST | `/api/simulation/argue` | Run one round of trial simulation |
| POST | `/api/simulation/case-summary` | Summarise a case with AI |
| POST | `/api/precedence/search` | Search precedents by query |
| POST | `/api/precedence/from-document` | Search precedents from uploaded doc |

### FastAPI AI Service
| Method | Endpoint | Description |
|---|---|---|
| POST | `/simulation/argument` | LLM courtroom simulation |
| POST | `/simulation/case-summary` | AI case summary |
| POST | `/precedence/search` | Indian case law lookup |
| POST | `/precedence/from-document` | Precedent search from document text |
| POST | `/analyse` | Document entity extraction |
| GET | `/health` | Service health check |

---

## Quick Start

### Prerequisites
- Node.js 18+, npm
- Java 17+, Maven
- Python 3.10+
- PostgreSQL 14+
- Tesseract OCR (for image document parsing)

### 1. Database
```bash
psql -U <user> -d <dbname> -f docs/database/schema.sql
# optional seed data:
psql -U <user> -d <dbname> -f docs/database/seed.sql
```

### 2. Spring Backend
Edit `new_folder/backend-java/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/<dbname>
spring.datasource.username=<user>
spring.datasource.password=<password>
```
```bash
cd new_folder/backend-java
mvn spring-boot:run
# runs on http://localhost:10000
```

### 3. AI Service
```bash
cd new_folder/ai-service
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
python -m spacy download en_core_web_sm
# create .env with: OPENROUTER_API_KEY=<your_key>
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 4. Frontend
```bash
cd frontend
npm install
npm start
# runs on http://localhost:3000
```

---

## Documentation

Extended documentation lives in [`docs/`](docs/):

| File | Contents |
|---|---|
| [`FULL_DOCUMENTATION.md`](docs/FULL_DOCUMENTATION.md) | Architecture, API reference, data model, config |
| [`USER_MANUAL.md`](docs/USER_MANUAL.md) | End-user guide for all features |
| [`DEPLOYMENT_INSTRUCTIONS.md`](docs/DEPLOYMENT_INSTRUCTIONS.md) | Step-by-step setup from scratch |
| [`RUN_PROJECT_MANUAL.md`](docs/RUN_PROJECT_MANUAL.md) | Local run order with troubleshooting |
| [`CODE_DIRECTORY_STRUCTURE.md`](docs/CODE_DIRECTORY_STRUCTURE.md) | Full file tree with descriptions |
| [`database/schema.sql`](docs/database/schema.sql) | PostgreSQL DDL |
| [`database/seed.sql`](docs/database/seed.sql) | Sample seed data |

---

## Deployment

The application is deployed across three services:

| Service | Platform |
|---|---|
| Frontend | Netlify (`https://lexaquitas.netlify.app`) |
| Spring Backend | Render (`https://mpj-backend-java.onrender.com`) |
| AI Service | Render (Python) |

---

## Academic Context

Built as a third-year engineering project. The name *LexAequitas* is Latin for "law and equity" — reflecting the platform's goal of making legal reasoning tools more accessible through AI.
