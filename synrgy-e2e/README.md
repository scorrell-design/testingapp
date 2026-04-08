# SYNRGY E2E Testing Walkthrough

A web-based, scenario-driven QA testing tool for manually testing the SYNRGY platform end-to-end. Testers walk through five scenarios covering the complete user journey — from admin creating brokers through member app engagement — marking each checkpoint as Pass, Fail, Blocked, or Skip.

Results sync in real time to a shared Google Sheet where each tester gets their own tab plus a Summary tab showing everyone's progress at a glance.

## Tech Stack

- **Next.js 14+** (App Router)
- **Supabase** (Postgres)
- **Google Sheets API** (real-time sync)
- **Tailwind CSS**

## Setup

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) and create a free project.

### 2. Run the database schema

Open the SQL Editor in your Supabase dashboard and run the contents of `schema.sql`.

### 3. Set up Google Sheets sync (one-time)

#### a. Create a Google Cloud project

- Go to [console.cloud.google.com](https://console.cloud.google.com)
- Create a new project (e.g., "SYNRGY QA Testing")

#### b. Enable the Google Sheets API

- In the project, go to **APIs & Services → Library**
- Search for "Google Sheets API" and enable it

#### c. Create a service account

- Go to **APIs & Services → Credentials**
- Click **Create Credentials → Service Account**
- Name it (e.g., `synrgy-qa-sheets`)
- No additional permissions needed
- Click into the service account → **Keys** tab → **Add Key → JSON**
- Download the JSON key file

#### d. Create the Google Sheet

- Create a new Google Sheet manually (e.g., "SYNRGY E2E Test Results")
- Copy the spreadsheet ID from the URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
- Share the sheet with the service account email (found in the JSON key file, looks like `synrgy-qa-sheets@your-project.iam.gserviceaccount.com`) — give it **Editor** access

### 4. Configure environment variables

Create `.env.local` with all credentials:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google Sheets
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=synrgy-qa-sheets@your-project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour key here\n-----END PRIVATE KEY-----\n"
```

The private key comes from the downloaded JSON file (the `private_key` field). In `.env.local`, wrap it in double quotes and keep the `\n` characters as-is.

### 5. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Google Sheets — What the team sees

When you open the shared Google Sheet:

- **Summary tab** — Bird's-eye view of every scenario, how many checkpoints each tester has completed, and where failures are. Updated in real time.
- **{Tester name} tabs** — One per tester (created on first login). Every checkpoint listed in scenario/step order with color-coded PASS/FAIL/BLOCKED/SKIP status and timestamps.

Anyone with the link can see live testing progress without logging into the app.

### Manual recovery sync

If the sheet gets out of sync (e.g., someone accidentally deletes sheet data), hit `POST /api/sync-sheets` to rebuild all tabs and the Summary from the database.

## Deploy to Vercel

1. Push to GitHub
2. Import in Vercel
3. Add all five env variables in Vercel project settings
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
