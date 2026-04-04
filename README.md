# Vinyl Pulse (Discogs Insights)

A progressive web application (PWA) built to analyze, visualize, and explore your Discogs vinyl collection with a premium, data-driven aesthetic.

🌐 **Live Demo**: [discogs-insights.vercel.app](https://discogs-insights.vercel.app)

---

## 🚀 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) |
| **Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Data Source** | [Discogs API](https://www.discogs.com/developers) |
| **Auth** | Discogs OAuth 1.0a |
| **Deployment** | [Vercel](https://vercel.com) |
| **Analytics** | [Vercel Analytics](https://vercel.com/analytics) |
| **Tooling** | ESLint, PostCSS |
| **Generative AI** | [Google Gemini 2.5 Flash / gemini-3.1-flash-image-preview](https://ai.google.dev/) (Text & Images) |
| **Storage** | [Vercel KV](https://vercel.com/storage/kv) (personas) · [Vercel Blob](https://vercel.com/storage/blob) (images) |

---

## ✨ Features

### 🔐 Multi-User Authentication (OAuth 1.0a)
- Users can **Connect their own Discogs account** via OAuth 1.0a to view personalized collection insights.
- A **Guest / Demo Mode** (backed by a pre-configured Personal Access Token) is available immediately without login.
- Auth sessions are stored in secure **HTTP-only cookies** — tokens never reach the client.
- The nav bar shows the authenticated username and allows one-click logout.

### ⚡ Pulse Sync Engine
- A custom background synchronization engine that **batch-fetches** your Discogs collection in real-time with live progress tracking in the nav bar.
- Force-refresh support to bypass cache and pull latest collection data.
- A **lean data-scrubbing strategy** prevents `localStorage` quota overflows for large collections.

### 📅 Original Release Year Enrichment
- Fetches **Discogs Master Records** to resolve the original release year for re-issues.
- Stores enriched year data in sync context so visualizations reflect when music was *created*, not when your pressing was manufactured.
- Rate limiting is handled by the client-side request queue (`clientRateLimiter.ts`), which paces all Discogs API calls across collection sync, master lookups, and vault enrichment.

### 🗄️ The Vault
A dedicated analytics page for deep-diving into the most significant records in your collection:
- **The Grails** — Your highest-value records by market price, ranked in a premium pedestal layout.
- **Most Coveted** — Records with the highest want/have community ratio.
- **Hidden Gems** — Personal 5-star favorites that are rare in the wild (low "have" count).
- **Archive Integrity Meter** — Live progress bar tracking how many records have been deep-scanned.

### 🎨 Sonic Persona (AI Insights)
An immersive, AI-driven analysis of your musical "soul" based on your latest record acquisitions:
- **Incisive Critique** — Uses **Gemini 2.5 Flash** to generate a sharp, poetic, and professional-critic-toned musical persona (e.g., *"The Belgian Post-Punk Architect"*). The prompt style is modeled on Pitchfork/The Wire editorial voice — no conversational filler.
- **Dynamic Avatars** — Generates unique masculine and feminine avatars matching your persona's vibe using **gemini-3.1-flash-image-preview**. Image generation includes automatic retry with a minimal safe fallback prompt if the primary AI-generated prompt is refused.
- **Micro-Scenes** — Identifies 3 hyper-specific sub-genres or "scenes" in your collection, each with a signature record.
- **Two-Phase Generation** — Text analysis (fast, returned immediately) and image generation (parallel, separate request) are decoupled so the UI can render persona text while avatars load.
- **Cloud Persistence** — In production, persona JSON is stored in **Vercel KV** (7-day TTL) and avatar images in **Vercel Blob** (public CDN URLs). In local development the same data falls back to `data/persona/*.json` and `public/images/persona/cache/`.
- **1-Hour Cooldown** — Built-in rate limiting ensures the AI doesn't over-analyze your soul too frequently.

### 🏷️ The Imprint (Label Analytics)
- A visualization of your collection's **record label distribution** and **geographical pressing origins**.
- Surfaces the top pressing countries in your collection with a geographic breakdown and label-specific heatmaps.
- Optimized via **data scrubbing** to maintain rich insights within `localStorage` limits.
- Embedded within the Vault page as a dedicated analytics section.

### 📊 Visualizations

| Page | Description |
|------|-------------|
| **Decade Heatmap** | A tactile, art-focused view of your collection's distribution across decades. Uses original release years where available. |
| **Genre Matrix** | A deep-drill visualization to explore styles within your favorite genres via an interactive sunburst-style matrix. Features seamless navigation across genres and sub-styles. |

### 📦 Infinite Scroll Collection
- Seamlessly browse your entire record crate with automatic pagination.
- Smooth scroll-to-load, no "load more" button needed.

### 🎛️ Interactive Overlays
- **Record Detail Overlay**: In-depth release information, community stats, and pricing.
- **Crate Digging Overlay**: An immersive 3D flip-card experience to browse records by decade.

---

## 📂 Project Structure

```text
├── design/                 # Design documentation and specs (excluded from Git)
├── public/                 # Static assets (fonts, icons, manifest)
└── src/
    ├── app/                # Next.js App Router pages and layouts
    │   ├── api/
    │   │   ├── auth/       # OAuth 1.0a routes (login, callback, logout, me)
    │   │   ├── discogs/
    │   │   │   ├── master/             # Master release year lookup
    │   │   │   ├── release/[id]/       # Single release detail
    │   │   │   ├── price-suggestions/  # Marketplace price data (rate-limited)
    │   │   │   ├── collection-value/   # Collection value aggregation
    │   │   │   └── sync/               # Collection sync endpoint
    │   │   └── persona/
    │   │       ├── route.ts            # AI text persona generation (Gemini 2.5 Flash)
    │   │       └── images/             # AI avatar image generation (gemini-3.1-flash-image-preview)
    │   ├── decades/        # "Decade Heatmap" visualization page
    │   ├── genre/          # "Genre Matrix" drill-down page
    │   ├── persona/        # "Sonic Persona" AI dashboard
    │   ├── vault/          # "The Vault" private archive page
    │   ├── globals.css     # Global styles and Tailwind directives
    │   ├── layout.tsx      # Root application layout
    │   └── page.tsx        # Homepage / Collection dashboard
    │
    ├── components/         # Reusable React components
    │   ├── analytics/      # Analytics sections (ImprintAnalytics)
    │   ├── layout/         # Navigation (TopAppBar, BottomNavBar)
    │   ├── ui/             # Interactive elements (Overlays, Cards, Grids)
    │   └── visualizations/ # Data viz (DecadeHeatmap, GenreStyleMatrix, VaultPedestal)
    │
    ├── context/
    │   └── DiscogsSyncContext.tsx  # Global sync engine, OAuth user state, vault metadata
    │
    └── lib/
        ├── discogs.ts            # Discogs API wrapper and data processing
        ├── oauth.ts              # OAuth 1.0a helpers (request/access token, identity)
        ├── rateLimiter.ts        # Server-side fast-fail rate limit guard (Vercel KV in prod, in-memory in dev)
        ├── clientRateLimiter.ts  # Client-side request queue — paces all Discogs API calls at ~50 req/min
        └── personaStorage.ts     # Persona persistence abstraction (Vercel KV + Blob in prod, filesystem in dev)
```

---

## 🏗️ Architecture Notes

### Discogs Rate Limiting (Two-Layer Design)

Discogs enforces a hard limit of ~60 requests/minute per user. The app handles this with two cooperating layers:

| Layer | Location | Mechanism |
|-------|----------|-----------|
| **Client queue** (`clientRateLimiter.ts`) | Browser | A tab-scoped FIFO queue. Every Discogs fetch call goes through `enqueueDiscogsRequest`, which spaces requests at a minimum 1200ms interval. This is the primary pacing mechanism. |
| **Server guard** (`rateLimiter.ts`) | API routes | A fast-fail check — never sleeps. If a request arrives before the interval has elapsed, it throws `RateLimitError` and the route returns HTTP 429 with a `retryAfterMs` body. The client queue catches this and retries after the suggested delay. |

In production the server guard persists last-request timestamps in **Vercel KV** so the state is shared across serverless function instances. In local dev it falls back to a `globalThis` Map.

Gemini and OAuth calls are **not** routed through the Discogs rate limiter.

### Persona Storage Abstraction

`personaStorage.ts` provides a unified API (`readPersonaData`, `writePersonaData`, `writePersonaImage`) that routes to different backends depending on the environment:

| Asset | Production | Local dev |
|-------|-----------|-----------|
| Persona JSON | Vercel KV (`persona:<username>`, 7-day TTL) | `data/persona/<username>.json` |
| Avatar images | Vercel Blob (`persona/<filename>.png`, public CDN) | `public/images/persona/cache/<filename>.png` |

Route handlers import only from `personaStorage.ts` — no direct `fs`, `kv`, or `blob` calls in route files.

### Sonic Persona Generation Pipeline

1. **POST `/api/persona`** — sends a shuffled 500-record snapshot to **Gemini 2.5 Flash** with a `thinkingBudget` of 1500 tokens. Returns the text persona (title, description, micro-scenes, signature record) immediately and saves a partial result to storage.
2. **POST `/api/persona/images`** — reads the saved `malePrompt`/`femalePrompt` from storage and calls **gemini-3.1-flash-image-preview** in parallel for both avatars. Each generation gets two attempts: first with the AI-generated prompt, then with a minimal safe fallback prompt if the first is refused. Images are stored via `writePersonaImage` and the final record is updated in storage.

---

## 💻 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# --- Demo / Guest Mode (Personal Access Token) ---
DISCOGS_PAT=your_personal_access_token_here
DISCOGS_USERNAME=your_discogs_username

# --- Multi-User OAuth (required for "Connect Discogs" feature) ---
DISCOGS_CONSUMER_KEY=your_app_consumer_key
DISCOGS_CONSUMER_SECRET=your_app_consumer_secret
DISCOGS_CALLBACK_URL=http://localhost:3000/api/auth/callback

# --- AI Insights (Google AI Studio) ---
GEMINI_KEY=your_google_ai_studio_api_key

# --- Vercel Storage (production only — omit in local dev to use filesystem fallbacks) ---
# Persona JSON + rate-limit state → Vercel KV
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token
# Persona avatar images → Vercel Blob
BLOB_READ_WRITE_TOKEN=your_blob_read_write_token

# --- Optional ---
DEV_LIMIT=500  # Cap the number of records fetched during sync (useful for development)
```

- **PAT**: Obtain from [Discogs Developer Settings](https://www.discogs.com/settings/developers).
- **OAuth credentials**: Register an application at [discogs.com/settings/developers](https://www.discogs.com/settings/developers) to get a Consumer Key/Secret.

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Deployment (Vercel)

All API calls are performed server-side (SSR / API routes), so secrets are never exposed to the client.

Set the following environment variables in your **Vercel project settings**:

| Variable | Description |
|----------|-------------|
| `DISCOGS_PAT` | Personal Access Token for the demo/guest account |
| `DISCOGS_USERNAME` | Discogs username for the demo/guest account |
| `DISCOGS_CONSUMER_KEY` | OAuth app consumer key |
| `DISCOGS_CONSUMER_SECRET` | OAuth app consumer secret |
| `DISCOGS_CALLBACK_URL` | Production callback URL, e.g. `https://discogs-insights.vercel.app/api/auth/callback` |
| `GEMINI_KEY` | Google AI Studio API key (for Sonic Persona text + image generation) |
| `KV_REST_API_URL` | Vercel KV REST endpoint — used for rate limiting state and persona JSON storage |
| `KV_REST_API_TOKEN` | Vercel KV auth token (provisioned automatically when you add a KV store to your project) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token — used to store persona avatar images on the CDN |
| `DEV_LIMIT` | *(Optional)* Cap collection size for performance testing |

> **Important**: Remember to add your production callback URL (`https://your-app.vercel.app/api/auth/callback`) to your Discogs application's allowed callback URLs in the developer settings.

---

## 🎨 Design Philosophy

Vinyl Pulse is built around a **premium, tactile, and immersive** aesthetic — the "Pulse" vibe. Key principles:

- **Mobile-First**: Designed for a phone-in-hand record browsing experience, scales elegantly to desktop.
- **Capacitor/Android Ready**: UI avoids browser-only hacks, making it straightforward to wrap as a native Android app.
- **Dark & Alive**: Rich dark palettes with glowing accents (primary orange `#FF4F00`), micro-animations, and glassmorphism surfaces.
- **Data-Driven but Expressive**: Every visualization is built to feel like an art piece, not a dashboard widget.
