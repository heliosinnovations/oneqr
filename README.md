# The QR Spot

Simple, honest QR code generator with no limits, no expiring codes, and no tricks. Free to generate, pay once to edit forever.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Fonts:** DM Serif Display + Inter (via `next/font`)

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm 9 or later

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/heliosinnovations/theqrspot.git
   cd theqrspot
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command            | Description                              |
| ------------------ | ---------------------------------------- |
| `npm run dev`      | Start development server                 |
| `npm run build`    | Create production build                  |
| `npm run start`    | Start production server                  |
| `npm run lint`     | Run ESLint                               |
| `npm run format`   | Format code with Prettier                |
| `npm run format:check` | Check code formatting              |

## Project Structure

```
theqrspot/
├── src/
│   ├── app/
│   │   ├── globals.css    # Global styles + design tokens
│   │   ├── layout.tsx     # Root layout with fonts
│   │   └── page.tsx       # Homepage
│   ├── components/        # Reusable components
│   └── lib/               # Utilities and helpers
├── drafts/                # Design mockups
├── PRD.md                 # Product Requirements Document
├── tailwind.config.ts     # Tailwind configuration
└── package.json
```

## Design System

### Colors (CSS Variables)

| Variable        | Value     | Usage                |
| --------------- | --------- | -------------------- |
| `--bg`          | `#fffef9` | Background           |
| `--fg`          | `#1a1a1a` | Foreground/text      |
| `--accent`      | `#ff4d00` | Accent/CTA           |
| `--accent-light`| `#fff0e6` | Light accent         |
| `--muted`       | `#666`    | Secondary text       |
| `--border`      | `#e5e5e0` | Borders              |
| `--surface`     | `#f7f6f1` | Surface/cards        |

### Typography

- **Headlines:** DM Serif Display
- **Body:** Inter

## Deployment

Deploy to Vercel:

```bash
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## License

Copyright 2026 Helios Innovations. All rights reserved.
# Trigger deployment
