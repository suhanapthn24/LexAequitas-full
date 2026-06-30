# LexAequitas — AI Service

FastAPI-based AI backend for the LexAequitas Indian Legal Trial Simulator. Provides trial simulation, precedence research, and document analysis via OpenRouter LLMs and spaCy NLP.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/simulation/argument` | Simulate a live courtroom exchange (prosecution, defense, judge) |
| `POST` | `/simulation/case-summary` | Generate charges, strategies, and conviction likelihood from case text |
| `POST` | `/precedence/search` | Find relevant Indian case law (SC/HC) by text query |
| `POST` | `/precedence/from-document` | Upload a legal document and get matching precedents |
| `POST` | `/analyse` | Full document analysis — parties, dates, clauses, AI legal review |
| `GET`  | `/health` | Health check |

## Setup

**Requirements:** Python 3.10, Tesseract OCR installed on the system.

```bash
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

Create a `.env` file:

```
OPENROUTER_API_KEY=your_key_here
```

Run the server:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Accepted Document Formats

`/analyse` and `/precedence/from-document` accept:
- PDF (`.pdf`)
- Word (`.docx`, `.doc`)
- Images (`.png`, `.jpg`, `.jpeg`, `.tiff`, `.bmp`) — via OCR

## Key Dependencies

- **FastAPI** + **Uvicorn** — HTTP server
- **OpenAI SDK** → **OpenRouter** — LLM calls (`openrouter/auto` model)
- **spaCy** (`en_core_web_sm`) — NER for parties and dates
- **pdfplumber** — PDF text extraction
- **python-docx** — Word document parsing
- **pytesseract** + **Pillow** — OCR for images
- **dateparser** — Normalise extracted date strings

## CORS

Allowed origins: `https://lexaquitas.netlify.app`, `http://localhost:3000`, `http://localhost:5173`
