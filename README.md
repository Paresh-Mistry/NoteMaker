# NoteMaker 🎙️

> AI-powered meeting notes — pull transcripts from Fathom, generate structured notes via Google Gemini, orchestrated through n8n.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)
![React Query](https://img.shields.io/badge/React_Query-5.0-ff4154?style=flat-square&logo=reactquery)
![Gemini](https://img.shields.io/badge/Gemini-2.0_Flash-4285F4?style=flat-square&logo=google)
![n8n](https://img.shields.io/badge/n8n-Workflow-EA4B71?style=flat-square)

---

## What is NoteMaker?

NoteMaker connects to your [Fathom](https://fathom.video) account, automatically pulls your meeting recordings and transcripts, then uses **Google Gemini AI** (via an **n8n** workflow) to generate structured, actionable notes — summaries, key points, action items, decisions, and follow-ups.

It also supports a **manual mode** where you can paste any transcript or upload a `.txt`, `.pdf`, or `.docx` file and get the same AI-powered notes instantly.

---

## ✨ Features

- **🎙️ Fathom Integration** — Auto-pulls all your recorded meetings with full transcripts and speaker attribution
- **📋 Manual Input** — Paste text or upload `.txt`, `.pdf`, `.docx` files for any transcript source
- **🤖 Gemini AI Notes** — Structured output: Summary, Key Points, Action Items, Decisions, Follow-ups
- **▶️ Video Player** — Watch Fathom recordings embedded directly in the app
- **📄 Transcript Viewer** — Timestamped, colour-coded by speaker with copy support
- **♾️ Infinite Scroll** — Load meetings progressively with cursor-based pagination
- **🔄 React Query** — Smart caching, prefetch on hover, notes persist across tab switches
- **📁 Meeting Routes** — `/meetings` list, `/meetings/[id]` detail, `/meetings/player` queue player
- **📤 Export** — Copy notes as formatted Markdown with one click
- **🌙 Dark Theme** — Cinematic editorial dark UI with grain texture and ambient lighting

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Next.js App (14)                   │
│                                                     │
│  🎙️ Fathom Mode          📋 Manual Mode             │
│  ├─ /api/fathom-meetings   ├─ Paste text            │
│  └─ /api/fathom-transcript └─ Upload file           │
│                │                   │                │
│                └────────┬──────────┘                │
│                         │                           │
│              /api/transcribe                        │
└─────────────────────────┼───────────────────────────┘
                          │
              ┌───────────▼───────────┐
              │    n8n Webhook        │
              │  localhost:5678       │
              └───────────┬───────────┘
                          │
              ┌───────────▼───────────┐
              │  Google Gemini 2.0    │
              │  Flash (Free tier)    │
              └───────────┬───────────┘
                          │
              ┌───────────▼───────────┐
              │  Structured JSON      │
              │  Notes Response       │
              └───────────────────────┘

```

<img width="1225" height="543" alt="image" src="https://github.com/user-attachments/assets/b875c654-0a61-46b0-9d24-5f1325c4f922" />
<img width="1596" height="575" alt="image" src="https://github.com/user-attachments/assets/2a57849f-173a-47e0-8f84-fcb6e2e4ed31" />
<img width="501" height="591" alt="image" src="https://github.com/user-attachments/assets/fa48240d-03ad-40d8-ba1c-87fc2b9d8bb2" />



### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Data Fetching | TanStack React Query v5 |
| AI Model | Google Gemini 2.0 Flash |
| AI Orchestration | n8n (self-hosted) |
| Meeting Source | Fathom Video API |
| Fonts | Instrument Serif + Geist Mono |

---

## 📁 Project Structure

```
notemaker/
├── app/
│   ├── page.tsx                    # Landing / Home page
│   ├── layout.tsx                  # Root layout with React Query provider
│   ├── globals.css
│   │
│   ├── app/
│   │   └── page.tsx                # Main app (Fathom + Manual mode switcher)
│   │
│   ├── meetings/
│   │   ├── page.tsx                # /meetings  — All meetings list
│   │   ├── [id]/
│   │   │   └── page.tsx            # /meetings/[id] — Detail + Video + Notes
│   │   └── player/
│   │       └── page.tsx            # /meetings/player — Sequential player
│   │
│   └── api/
│       ├── meeting/
│       │   └── route.ts            # GET — proxy Fathom meetings API
│       ├── transcript/
│       │   └── route.ts            # GET — proxy Fathom transcript API
│       └── n8n/
│           └── route.ts            # POST — forward to n8n / Gemini
│
├── src/
│   ├── types/
│   │   └── index.ts                # All TypeScript interfaces
│   ├── services/
│   │   └── index.ts                # Raw fetch functions + query keys
│   ├── hooks/
│   │   └── index.ts                # React Query hooks
│   └── providers/
│       └── ReactQueryProvider.tsx  # QueryClient setup
│
├── n8n-workflow.json               # Import into n8n
├── .env.local                      # API keys
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Fathom](https://fathom.video) account with at least one recorded meeting
- A [Google AI Studio](https://aistudio.google.com) account (free Gemini API key)
- n8n installed globally: `npm install -g n8n`

---

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/notemaker.git
cd notemaker
npm install
```

---

### 2. Environment Variables

Create `.env.local` in the project root:

```env
# Fathom API key
# Get from: fathom.video → Settings → API Access → Generate Key
FATHOM_API_KEY=your_fathom_api_key_here

# n8n webhook URL (change to /webhook/ when workflow is activated)
N8N_WEBHOOK_URL=http://localhost:5678/webhook-test/notemaker

# Gemini API key (free tier — 1500 requests/day)
# Get from: aistudio.google.com → Get API Key
GEMINI_API_KEY=your_gemini_api_key_here
```

---

### 3. Set Up n8n

```bash
# Start n8n (keep this terminal open)
npx n8n
```

1. Open **http://localhost:5678** and create an account
2. Go to **Workflows → New → ⋯ → Import from File**
3. Select `n8n-workflow.json` from this repo
4. Open the **Gemini AI** (HTTP Request) node and paste your Gemini API key into the URL:
   ```
   https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_KEY_HERE
   ```
5. Click **"Execute Workflow"** (▶ button) to register the test webhook
6. Or **Activate** the workflow for a permanent production webhook

---

### 4. Set Up Fathom

1. Sign up at [fathom.video](https://fathom.video)
2. Install the Fathom Chrome extension
3. Record a meeting — Fathom auto-joins Zoom / Google Meet / Teams
4. After the meeting ends (wait ~2 min for processing)
5. Go to **Settings → API Access → Generate Key**

---

### 5. Run the App

```bash
npm run dev
```

Open **http://localhost:3000**

> ⚠️ You need **two terminals** running simultaneously:
> - Terminal 1: `npx n8n`
> - Terminal 2: `npm run dev`

---

## 🔌 API Routes

### `GET /api/meeting`

Fetches paginated list of Fathom meetings.

| Query Param | Type | Description |
|-------------|------|-------------|
| `cursor` | `string` | Pagination cursor from previous response |
| `limit` | `number` | Results per page (default: 20) |

**Response:**
```json
{
  "meetings": [
    {
      "recording_id": 126171360,
      "title": "Q4 Planning",
      "share_url": "https://fathom.video/share/abc123",
      "recording_start_time": "2026-02-28T10:00:00Z",
      "calendar_invitees": [{ "name": "Sarah", "email": "sarah@co.com" }]
    }
  ],
  "next_cursor": "cursor_abc123"
}
```

---

### `GET /api/transcript?recording_id=126171360`

Fetches timestamped transcript for a specific recording.

**Response:**
```json
{
  "transcript": [
    {
      "timestamp": "00:00:12",
      "speaker": { "display_name": "Sarah" },
      "text": "Let's kick off the Q4 review."
    }
  ]
}
```

---

### `POST /api/n8n`

Sends transcript to n8n → Gemini AI → returns structured notes.

**Request body:**
```json
{
  "transcript": "[00:00:12] Sarah: Let's ship by Friday.",
  "meeting_title": "Q4 Planning",
  "meeting_date": "2026-02-28T10:00:00Z"
}
```

**Response:**
```json
{
  "notes": {
    "summary": "The team agreed to accelerate the Q4 launch...",
    "key_points": ["Launch moved to December 1st"],
    "action_items": ["Sarah: Finalize component library by Nov 18"],
    "decisions": ["Budget approved for contractor hiring"],
    "follow_ups": ["Revisit budget allocations next week"],
    "meeting_title": "Q4 Planning",
    "meeting_date": "2026-02-28T10:00:00Z"
  }
}
```

---

## 🧩 React Query Architecture

The data layer uses a clean 3-tier separation:

```
types/      → TypeScript interfaces only
services/   → Raw fetch functions, no React (testable anywhere)
hooks/      → React Query wrappers for components
```

### Available Hooks

```tsx
// Paginated meetings list with infinite scroll
const { meetings, fetchNextPage, hasNextPage } = useMeetingsList()

// Single meeting (cache-first, then API)
const { data: meeting } = useMeeting(recordingId)

// Transcript with formatted text + speaker list
const { lines, formattedText, speakers } = useTranscript(recordingId)

// AI note generation (cached by recordingId)
const { generate, notes, isPending } = useGenerateNotes(recordingId)

// Prefetch transcript on hover
const prefetch = usePrefetchTranscript()
<div onMouseEnter={() => prefetch(meeting.recording_id)}>

// Force refresh meetings list
const refresh = useInvalidateMeetings()
```

### Caching Strategy

| Data | staleTime | gcTime | Notes |
|------|-----------|--------|-------|
| Meetings list | 2 min | 10 min | Invalidated on manual refresh |
| Transcript | 5 min | 30 min | Transcripts are immutable |
| AI Notes | Session | Session | Stored via `setQueryData` after generation |

---

## 🗺️ Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with live demo preview |
| `/app` | Main app — Fathom mode + Manual mode |
| `/meetings` | All meetings list with search, sort, filter |
| `/meetings/[id]` | Meeting detail — video player, transcript, AI notes |
| `/meetings/player` | Sequential player — move through all meetings in a queue |

---

## 🎬 n8n Workflow

The `n8n-workflow.json` contains a 5-node workflow:

```
Webhook (POST /notemaker)
    ↓
Validate & Extract (Code node)
    ↓
Gemini AI (HTTP Request → Google Generative Language API)
    ↓
Parse & Format Response (Code node)
    ↓
Respond to Webhook (JSON response)
```

The Gemini prompt instructs the model to return **only valid JSON** in a fixed schema — no markdown fences, no explanation. The Parse node strips any fences the model adds anyway and validates the structure before responding.

---

## 🔧 Extending with n8n

Since notes flow through n8n, you can add nodes to extend without touching the Next.js code:

| What | How |
|------|-----|
| Save to Notion | Add Notion node after Format Response |
| Post to Slack | Add Slack node — send action items to a channel |
| Google Docs | Create a doc per meeting automatically |
| Email summary | Send notes to all attendees via Gmail node |
| Switch AI model | Replace HTTP Request with OpenAI / Claude node |
| Vector search | Store embeddings in Pinecone for semantic search |

---

## 🐛 Troubleshooting

### `404 — webhook not registered`
- The n8n workflow isn't active. Either click **"Execute Workflow"** for test URL, or **Activate** for production URL.

### `Transcript not available`
- Fathom takes 1–2 minutes to process recordings after a meeting ends. Wait and refresh.

### `Gemini 403 Forbidden`
- Your API key isn't in the HTTP Request node URL. Paste it directly: `...?key=YOUR_KEY_HERE`

### `502 n8n agent failed`
- n8n isn't running. Open a terminal and run `npx n8n`.

### `Invalid JSON from Gemini`
- The Format Response code node strips markdown fences and re-parses. If it still fails, the transcript may be too short or malformed.

---

## 📦 Key Dependencies

```json
{
  "next": "^14.0.0",
  "@tanstack/react-query": "^5.0.0",
  "@tanstack/react-query-devtools": "^5.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.4.0"
}
```

---

## 📄 License

MIT — free to use, modify, and distribute.

---

## 🙏 Built With

- [Fathom Video](https://fathom.video) — meeting recording and transcription
- [Google Gemini](https://aistudio.google.com) — AI note generation (free tier)
- [n8n](https://n8n.io) — workflow automation and AI orchestration
- [Next.js](https://nextjs.org) — React framework
- [TanStack Query](https://tanstack.com/query) — async state management
- [Tailwind CSS](https://tailwindcss.com) — utility-first styling
