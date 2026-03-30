# Discogs Insights (Vinyl Pulse)

A progressive web application (PWA) built to analyze, visualize, and explore your Discogs record collection.

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/) (Release Candidate)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Data Source**: [Discogs API](https://www.discogs.com/developers)
- **Tooling**: ESLint, PostCSS

## 📂 Project Structure

The project follows a standard Next.js App Router structure with customized component and lib directories:

```text
├── design/                 # Design documentation and specifications (Excluded from Git)
├── public/                 # Static assets (fonts, icons, external files)
└── src/
    ├── app/                # Next.js App Router pages and layouts
    │   ├── api/            # Serverless API routes (e.g., Discogs Sync)
    │   ├── decades/        # "Decade Heatmap" visualization page
    │   ├── genre/          # "Genre Matrix" drill-down page
    │   ├── fonts/          # Custom local fonts
    │   ├── globals.css     # Global styles and tailwind directives
    │   ├── layout.tsx      # Root application layout
    │   └── page.tsx        # Application homepage / dashboard
    │
    ├── components/         # Reusable React components
    │   ├── layout/         # Layout components (Navigation, AppBars)
    │   ├── ui/             # Interactive elements (Overlays, Cards, Grids)
    │   └── visualizations/ # Data visualizations (Heatmaps, Genre Matrices)
    │
    ├── context/            # Global state management
    │   └── DiscogsSyncContext.tsx # The "Pulse Sync" engine logic
    │
    └── lib/                # Core utilities and data fetching
        └── discogs.ts      # Discogs API wrapper and data processing logic
```

## 🛠️ Features overview

- **Pulse Sync Engine**: A custom background synchronization engine that fetches your Discogs collection in real-time with progress tracking.
- **Infinite Scroll Collection**: Seamlessly browse your entire record crate with automatic pagination.
- **Interactive Overlays**: 
  - **Record Detail Overlay**: In-depth information for every release.
  - **Crate Digging Overlay**: An immersive 3D flip-card experience to browse records by decade.
- **Visualizations**: 
  - **Decade Heatmap**: A tactile, art-focused view of your collection's distribution over the years.
  - **Genre Matrix**: A deep-drill visualization to explore styles within your favorite genres.
- **Mobile-First Design**: A premium, responsive interface optimized for both desktop and PWA mobile usage.

## 💻 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file in the root directory and add your Discogs API credentials. You can obtain a Personal Access Token (PAT) from your [Discogs Settings](https://www.discogs.com/settings/developers).

   ```env
   DISCOGS_PAT=your_personal_access_token_here
   DISCOGS_USERNAME=your_discogs_username
   DEV_LIMIT=500 # Optional: limits the total number of records fetched during sync
   ```

3. **Run the Development Server**
   ```bash
   npm run dev
   ```

4. **View the App**
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the results.

## 🚢 Deployment (Vercel)

When deploying to Vercel, make sure to add the following environment variables in your project settings:

- `DISCOGS_PAT`: Your Discogs Personal Access Token.
- `DISCOGS_USERNAME`: The Discogs username whose collection you want to display (e.g., for a "Demo Mode").
- `DEV_LIMIT`: (Optional) A number to cap the collection size if needed for performance testing.

All Discogs API calls are performed server-side (via SSR or internal API routes), so your `DISCOGS_PAT` remains secure and is never exposed to the client.
