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
| **Tooling** | ESLint, PostCSS |

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
- Built-in per-user API rate limiting ensures smooth background enrichment without hitting Discogs' rate caps.

### 🗄️ The Vault
A dedicated analytics page for deep-diving into the most significant records in your collection:
- **The Grails** — Your highest-value records by market price, ranked in a premium pedestal layout.
- **Most Coveted** — Records with the highest want/have community ratio.
- **Hidden Gems** — Personal 5-star favorites that are rare in the wild (low "have" count).
- **Archive Integrity Meter** — Live progress bar tracking how many records have been deep-scanned.

### 🏷️ The Imprint (Label Analytics)
- A visualization of your collection's **record label distribution** and **geographical pressing origins**.
- Surfaces the top pressing countries in your collection with a geographic breakdown.
- Embedded within the Vault page as a dedicated analytics section.

### 📊 Visualizations

| Page | Description |
|------|-------------|
| **Decade Heatmap** | A tactile, art-focused view of your collection's distribution across decades. Uses original release years where available. |
| **Genre Matrix** | A deep-drill visualization to explore styles within your favorite genres via an interactive sunburst-style matrix. |

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
    │   │   └── discogs/
    │   │       ├── master/         # Master release year lookup
    │   │       ├── release/[id]/   # Single release detail
    │   │       ├── price-suggestions/ # Marketplace price data
    │   │       └── sync/           # Collection sync endpoint
    │   ├── decades/        # "Decade Heatmap" visualization page
    │   ├── genre/          # "Genre Matrix" drill-down page
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
        ├── discogs.ts      # Discogs API wrapper and data processing
        ├── oauth.ts        # OAuth 1.0a helpers (request/access token, identity)
        └── rateLimiter.ts  # Per-user API request queue (~50 req/min)
```

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
| `DEV_LIMIT` | *(Optional)* Cap collection size for performance testing |

> **Important**: Remember to add your production callback URL (`https://your-app.vercel.app/api/auth/callback`) to your Discogs application's allowed callback URLs in the developer settings.

---

## 🎨 Design Philosophy

Vinyl Pulse is built around a **premium, tactile, and immersive** aesthetic — the "Pulse" vibe. Key principles:

- **Mobile-First**: Designed for a phone-in-hand record browsing experience, scales elegantly to desktop.
- **Capacitor/Android Ready**: UI avoids browser-only hacks, making it straightforward to wrap as a native Android app.
- **Dark & Alive**: Rich dark palettes with glowing accents (primary orange `#FF4F00`), micro-animations, and glassmorphism surfaces.
- **Data-Driven but Expressive**: Every visualization is built to feel like an art piece, not a dashboard widget.
