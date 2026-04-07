# SYNRGY E2E Testing Walkthrough

A web-based, scenario-driven QA testing tool for manually testing the SYNRGY platform end-to-end. Testers walk through five scenarios covering the complete user journey — from admin creating brokers through member app engagement — marking each checkpoint as Pass, Fail, Blocked, or Skip.

## Tech Stack

- **Next.js 14+** (App Router)
- **Supabase** (Postgres)
- **Tailwind CSS**

## Setup

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) and create a free project.

### 2. Run the database schema

Open the SQL Editor in your Supabase dashboard and run the contents of `schema.sql`.

### 3. Configure environment variables

Copy `.env.local` and fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push to GitHub
2. Import in Vercel
3. Add the two env variables in Vercel project settings
4. Deploy

## Deploy anywhere else

```bash
npm run build
npm start
```

Set the env variables in your host platform.

## Scenarios

1. **Admin creates broker** — Admin provisions a broker account and verifies portal access
2. **Broker creates prospect → proposal → RFC** — Broker runs Fission/Fusion analysis and submits an RFC
3. **Prospect converts to active group** — RFC approval, census mapping, employer portal provisioning
4. **BEEP enrollment → app onboarding** — Member enrollment, identity verification, app setup, HRA
5. **Daily app engagement & features** — All app features, covered events, upstream data flows
