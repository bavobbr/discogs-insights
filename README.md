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
├── design/                 # Design documentation and specifications
├── public/                 # Static assets (fonts, icons, external files)
└── src/
    ├── app/                # Next.js App Router pages and layouts
    │   ├── decades/        # "Decades" statistics page
    │   ├── fonts/          # Custom local fonts
    │   ├── pulse/          # "Pulse" visualization page
    │   ├── globals.css     # Global styles and tailwind directives
    │   ├── layout.tsx      # Root application layout
    │   └── page.tsx        # Application homepage / dashboard
    │
    ├── components/         # Reusable React components
    │   ├── layout/         # Layout components (e.g., Navigation)
    │   ├── ui/             # Generic UI elements (e.g., CrateCard, RecentGrid)
    │   └── visualizations/ # Data visualization components (DecadeHeatmap, GenreSunburst)
    │
    └── lib/                # Core utilities and data fetching
        └── discogs.ts      # Discogs API wrapper and data processing logic
```

## 🛠️ Features overview

- **Authentication & API Layer**: Integrates directly with Discogs API (`lib/discogs.ts`) to fetch your collection data.
- **Visualizations**: 
  - Dynamic **Decade Heatmap** using album cover artwork.
  - Interactive **Genre Sunburst** chart for exploring collection composition.
- **Pages**:
  - `Dashboard`: Latest additions and overview.
  - `Pulse`: Deep dive into specific statistics and "Top Vibrations".
  - `Decades`: Distribution of music by release decade and finding the "Golden Era".

## 💻 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Make sure to configure your `.env.local` with the necessary Discogs API keys.

3. **Run the Development Server**
   ```bash
   npm run dev
   ```

4. **View the App**
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the results.
