# OfferOS

AI-powered candidate offer portal built around Box as the source of truth.

OfferOS has two working surfaces:

- HR dashboard for common documents, candidate records, and escalations.
- Candidate chat portal for offer questions with document citations.

The app runs locally with mock providers, then switches to real APIs when environment variables are provided.

## Run Locally

```bash
cp .env.example .env
node server.mjs
```

Open:

```text
http://127.0.0.1:5173
```

## Backend API

- `GET /api/health` checks provider configuration.
- `GET /api/bootstrap` loads dashboard/chat state.
- `POST /api/documents/common` creates a common document metadata record.
- `POST /api/candidates` creates a candidate and candidate folder mapping.
- `GET /api/candidates/:id` loads a candidate.
- `POST /api/candidates/:id/intelligence` refreshes Apify intelligence.
- `POST /api/chat` classifies, retrieves sources, answers, audits, and escalates if needed.
- `GET /api/escalations` lists HR escalations.
- `POST /api/escalations/:id/respond` resolves an escalation and adds a recruiter message.

## Integrations

### OpenAI

Set:

```bash
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4.1-mini
```

OfferOS calls the Responses API for green offer questions. Yellow questions are escalated to HR. Red questions are rejected as out of scope.

### Box

Set:

```bash
BOX_DEVELOPER_TOKEN=...
BOX_COMMON_FOLDER_ID=...
BOX_CANDIDATES_FOLDER_ID=...
```

The local adapter can list common documents from Box and create candidate folders under the configured candidates folder.

### Apify

Set:

```bash
APIFY_TOKEN=...
APIFY_ACTOR_ID=...
```

`POST /api/candidates/:id/intelligence` runs the configured actor with the candidate object and stores returned signals.

### Notifications

Set:

```bash
NOTIFY_WEBHOOK_URL=...
```

Yellow escalations are posted to the webhook as JSON.

## Data

Seed data lives in `data/seed.json`.

Runtime state is written to `data/offeros-db.json`, which is ignored by Git. Delete it to reset the app back to seed data.
