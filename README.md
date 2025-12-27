# ApplyOS

AI-powered job application operating system.

## Setup

1. Copy `.env.example` to `.env.local` (create it if missing)
2. Add your Supabase credentials:
   ```
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=ey... (Required for Privileged Operations)
   N8N_WEBHOOK_URL=https://... (Required for Resume Extraction)
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Architecture

- **Framework**: Next.js 15 (App Router)
- **Language**: JavaScript
- **Styling**: Tailwind CSS (Dark Mode default)
- **Auth**: Supabase (Magic Link)
- **Icons**: Lucide React

## Structure

- `src/app`: Page routes
  - `(public)`: Marketing pages (Landing, Pricing)
  - `(auth)`: Authentication flows (Login, Callback)
  - `(dashboard)`: Protected user area
- `src/components`: Reusable UI components
  - `ui`: Primitive components (Button, etc.)
  - `layout`: Structural components (Navbar, Footer)
- `src/lib`: Utilities (Supabase client)
