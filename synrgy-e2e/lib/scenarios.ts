export type Check = {
  id: string;
  text: string;
};

export type Step = {
  title: string;
  platform: string;
  checks: Check[];
};

export type Scenario = {
  id: string;
  persona: string;
  icon: string;
  color: string;
  bg: string;
  title: string;
  summary: string;
  steps: Step[];
};

export const scenarios: Scenario[] = [
  {
    id: "admin-broker",
    persona: "Admin",
    icon: "A",
    color: "#185FA5",
    bg: "#E6F1FB",
    title: "Create & manage a broker",
    summary:
      "Admin provisions a new broker account, verifies access, and confirms the broker can log into Infinity Portal.",
    steps: [
      {
        title: "Log into admin portal",
        platform: "Admin portal",
        checks: [
          { id: "ab-1", text: "Admin credentials authenticate successfully" },
          {
            id: "ab-2",
            text: "Admin dashboard loads with broker management section visible",
          },
        ],
      },
      {
        title: "Create new broker account",
        platform: "Admin portal",
        checks: [
          {
            id: "ab-3",
            text: "All required fields present: name, email, phone, agency name",
          },
          {
            id: "ab-4",
            text: "Product line assignment available (SYNRGY, CHAMP, QTM)",
          },
          {
            id: "ab-5",
            text: "Submitting with a duplicate email shows an error and blocks creation",
          },
          {
            id: "ab-6",
            text: "Submitting valid info creates the broker with 'Active' status",
          },
        ],
      },
      {
        title: "Verify broker receives access",
        platform: "Email + Infinity portal",
        checks: [
          {
            id: "ab-7",
            text: "Broker receives welcome email within 5 minutes",
          },
          {
            id: "ab-8",
            text: "Email contains working login link or temporary credentials",
          },
          {
            id: "ab-9",
            text: "Broker can log into Infinity Portal with provided credentials",
          },
          {
            id: "ab-10",
            text: "Broker only sees the product lines they were assigned",
          },
        ],
      },
      {
        title: "Test broker account management",
        platform: "Admin portal",
        checks: [
          {
            id: "ab-11",
            text: "Admin can edit broker details (name, phone, agency)",
          },
          {
            id: "ab-12",
            text: "Admin can deactivate broker — broker can no longer log in",
          },
          {
            id: "ab-13",
            text: "Deactivated broker's prospects and groups remain intact",
          },
          {
            id: "ab-14",
            text: "Admin can reactivate broker — broker regains portal access",
          },
        ],
      },
    ],
  },
  {
    id: "broker-prospect",
    persona: "Broker",
    icon: "B",
    color: "#534AB7",
    bg: "#EEEDFE",
    title: "Create prospect → proposal → RFC",
    summary:
      "Broker creates a new prospect, generates a savings proposal (Fission and Fusion), then submits an RFC for coverage approval.",
    steps: [
      {
        title: "Create a new prospect",
        platform: "Infinity portal",
        checks: [
          {
            id: "bp-1",
            text: "Broker can enter company name, employee count, industry, state, pay cycle",
          },
          {
            id: "bp-2",
            text: "Prospect appears in broker's prospect list with status 'New'",
          },
          {
            id: "bp-3",
            text: "Prospect is only visible to the broker who created it",
          },
        ],
      },
      {
        title: "Run Fission quick estimate",
        platform: "Infinity portal",
        checks: [
          {
            id: "bp-4",
            text: "Selecting 'Quick estimate' opens Fission flow with group info pre-filled",
          },
          {
            id: "bp-5",
            text: "Loading screen shows progress animation with company name",
          },
          {
            id: "bp-6",
            text: "Proposal output renders with simulated employee profiles",
          },
          {
            id: "bp-7",
            text: "KPI cards, paycheck comparison, and savings breakdown display correctly",
          },
          {
            id: "bp-8",
            text: "Proposal clearly labeled as 'Estimated' (not precise)",
          },
          {
            id: "bp-9",
            text: "Upgrade CTA prompts broker to upload census for precise analysis",
          },
        ],
      },
      {
        title: "Run Fusion precise analysis",
        platform: "Infinity portal",
        checks: [
          {
            id: "bp-10",
            text: "Broker can upload .xlsx, .csv, or .pdf census file",
          },
          {
            id: "bp-11",
            text: "File detection preview shows: employee count, recognized fields, company name",
          },
          {
            id: "bp-12",
            text: "Invalid or malformed file shows clear error with specific issue",
          },
          {
            id: "bp-13",
            text: "Proposal output uses real employee data — not simulated",
          },
          {
            id: "bp-14",
            text: "Per-employee savings breakdown is accurate (within 1% of manual calc)",
          },
          {
            id: "bp-15",
            text: "Employer savings totals match sum of individual employee savings",
          },
        ],
      },
      {
        title: "Save & send proposal",
        platform: "Infinity portal",
        checks: [
          {
            id: "bp-16",
            text: "Save proposal stores it under the prospect record",
          },
          {
            id: "bp-17",
            text: "Download PDF renders a clean, branded document",
          },
          {
            id: "bp-18",
            text: "Send via email delivers proposal to entered email address",
          },
          {
            id: "bp-19",
            text: "Broker info card at bottom shows correct name, email, phone, company",
          },
        ],
      },
      {
        title: "Submit RFC",
        platform: "Infinity portal",
        checks: [
          {
            id: "bp-20",
            text: "RFC form pre-fills plan details from the approved proposal",
          },
          {
            id: "bp-21",
            text: "Submitting RFC creates a record linked to prospect + proposal + broker",
          },
          {
            id: "bp-22",
            text: "RFC status shows as 'Pending' in broker's view",
          },
          {
            id: "bp-23",
            text: "Admin / underwriting receives notification of new RFC within 5 minutes",
          },
        ],
      },
    ],
  },
  {
    id: "prospect-to-group",
    persona: "Admin + Broker",
    icon: "G",
    color: "#854F0B",
    bg: "#FAEEDA",
    title: "Prospect converts to active group",
    summary:
      "Admin approves the RFC, prospect becomes an active group, census maps to member records, and employer portal access is provisioned.",
    steps: [
      {
        title: "Approve RFC",
        platform: "Admin portal",
        checks: [
          {
            id: "pg-1",
            text: "Admin can review RFC details (plan config, group info, broker)",
          },
          {
            id: "pg-2",
            text: "Approving RFC changes its status from 'Pending' to 'Approved'",
          },
          {
            id: "pg-3",
            text: "Status change reflects immediately in both admin and broker portal views",
          },
        ],
      },
      {
        title: "Verify prospect → group conversion",
        platform: "Admin + Infinity portal",
        checks: [
          {
            id: "pg-4",
            text: "Prospect status changes to 'Active group' automatically after RFC approval",
          },
          {
            id: "pg-5",
            text: "Group record inherits all prospect data (company, plan, broker)",
          },
          {
            id: "pg-6",
            text: "Broker sees group under 'Active groups' — no longer in prospects list",
          },
          {
            id: "pg-7",
            text: "Broker receives confirmation notification of group activation",
          },
        ],
      },
      {
        title: "Census → member records",
        platform: "Admin portal",
        checks: [
          {
            id: "pg-8",
            text: "Each census row creates an individual member record under the group",
          },
          {
            id: "pg-9",
            text: "Member records have correct name, DOB, tier, salary, and effective date",
          },
          {
            id: "pg-10",
            text: "Duplicate members (same name + DOB or SSN) are flagged for resolution",
          },
          {
            id: "pg-11",
            text: "Member count in group dashboard matches census row count",
          },
        ],
      },
      {
        title: "Employer portal provisioned",
        platform: "Client portal",
        checks: [
          {
            id: "pg-12",
            text: "Employer contact can log into client portal",
          },
          {
            id: "pg-13",
            text: "Client dashboard shows correct group name, plan, and member count",
          },
          {
            id: "pg-14",
            text: "Effective dates and contribution amounts match group configuration",
          },
        ],
      },
    ],
  },
  {
    id: "member-enroll",
    persona: "Member",
    icon: "M",
    color: "#0F6E56",
    bg: "#E1F5EE",
    title: "BEEP enrollment → app onboarding",
    summary:
      "Member receives enrollment outreach, verifies identity, downloads the app, completes onboarding carousel, and finishes the HRA.",
    steps: [
      {
        title: "Receive BEEP outreach",
        platform: "SMS + email",
        checks: [
          {
            id: "me-1",
            text: "Member receives SMS and/or email with enrollment link",
          },
          {
            id: "me-2",
            text: "Message delivered within the configured send window",
          },
          {
            id: "me-3",
            text: "Link opens enrollment landing page (not broken or expired)",
          },
        ],
      },
      {
        title: "Complete enrollment",
        platform: "BEEP landing page",
        checks: [
          {
            id: "me-4",
            text: "Landing page shows correct company name, plan details, and branding",
          },
          {
            id: "me-5",
            text: "Identity verification works: correct name + DOB + last 4 SSN grants access",
          },
          {
            id: "me-6",
            text: "Incorrect identity info shows error and allows retry",
          },
          {
            id: "me-7",
            text: "Completing enrollment changes member status from 'Invited' to 'Enrolled'",
          },
          {
            id: "me-8",
            text: "Member receives app download instructions and welcome message",
          },
        ],
      },
      {
        title: "Test BEEP follow-up logic",
        platform: "SMS + email",
        checks: [
          {
            id: "me-9",
            text: "Non-responders receive reminder at configured interval (e.g., Day 3)",
          },
          {
            id: "me-10",
            text: "Second reminder fires at next interval (e.g., Day 7)",
          },
          { id: "me-11", text: "Reminders stop once member enrolls" },
          {
            id: "me-12",
            text: "Opt-out / unsubscribe stops ALL future outreach",
          },
          {
            id: "me-13",
            text: "Enrollment link deactivates after window closes",
          },
        ],
      },
      {
        title: "App download & account setup",
        platform: "SYNRGY app",
        checks: [
          {
            id: "me-14",
            text: "App installs and launches without errors",
          },
          {
            id: "me-15",
            text: "Account creation links member to correct group and plan",
          },
          {
            id: "me-16",
            text: "Verification screens use cream background (#F5EDE1), not white",
          },
          {
            id: "me-17",
            text: "CTA buttons are brand orange (#C95A38) on all setup screens",
          },
          {
            id: "me-18",
            text: "Permission prompts fire in order: location → health data → notifications",
          },
        ],
      },
      {
        title: "Onboarding carousel",
        platform: "SYNRGY app",
        checks: [
          { id: "me-19", text: "All 5 carousel screens render correctly" },
          {
            id: "me-20",
            text: "Pagination dots stay fixed at bottom (don't scroll with content)",
          },
          {
            id: "me-21",
            text: "AI Orb is a dimensional teal radial gradient sphere (not flat/purple/red)",
          },
          {
            id: "me-22",
            text: "Suggestion bubble spacing is correct (not squished)",
          },
          {
            id: "me-23",
            text: "All copy uses compliant language ('may correspond to covered events')",
          },
          {
            id: "me-24",
            text: "No instance of 'qualify for benefits' or 'earn benefits' anywhere",
          },
        ],
      },
      {
        title: "Complete HRA",
        platform: "SYNRGY app",
        checks: [
          {
            id: "me-25",
            text: "Tapping 'Complete Your Health Risk Assessment' opens HRA flow",
          },
          {
            id: "me-26",
            text: "HRA intro screen explains what it is and why it matters",
          },
          {
            id: "me-27",
            text: "Chat Q&A flow presents all questions and accepts answers",
          },
          {
            id: "me-28",
            text: "Processing animation plays after final question",
          },
          {
            id: "me-29",
            text: "Results screen shows personalized health profile",
          },
          {
            id: "me-30",
            text: "HRA completion is recorded as a covered event",
          },
        ],
      },
    ],
  },
  {
    id: "member-engage",
    persona: "Member",
    icon: "E",
    color: "#993C1D",
    bg: "#FAECE7",
    title: "Daily app engagement & features",
    summary:
      "Member uses all core app features, engagement actions are tracked, covered events log correctly, and data flows upstream to broker and admin dashboards.",
    steps: [
      {
        title: "AI Orb interaction",
        platform: "SYNRGY app",
        checks: [
          {
            id: "eg-1",
            text: "First interaction shows transparency disclaimer per Responsible AI Manifesto",
          },
          {
            id: "eg-2",
            text: "Orb responds contextually based on member's plan and health profile",
          },
          {
            id: "eg-3",
            text: "Orb never implies SYNRGY determines benefit eligibility",
          },
          {
            id: "eg-4",
            text: "Suggestion bubbles render with correct spacing and are tappable",
          },
        ],
      },
      {
        title: "Virtual care",
        platform: "SYNRGY app",
        checks: [
          {
            id: "eg-5",
            text: "Member can search and browse available providers",
          },
          {
            id: "eg-6",
            text: "Booking a telemedicine appointment completes successfully",
          },
          { id: "eg-7", text: "Video session connects and functions" },
          {
            id: "eg-8",
            text: "Completed visit appears in member's visit history",
          },
          {
            id: "eg-9",
            text: "Visit is recorded as a covered event with correct event type",
          },
        ],
      },
      {
        title: "Monthly health screening",
        platform: "SYNRGY app",
        checks: [
          {
            id: "eg-10",
            text: "Screening prompt appears at correct monthly interval",
          },
          {
            id: "eg-11",
            text: "Member can complete the screening flow",
          },
          {
            id: "eg-12",
            text: "Completion is recorded as a covered event with timestamp",
          },
          {
            id: "eg-13",
            text: "Confirmation message uses compliant language",
          },
        ],
      },
      {
        title: "Body vitals & health data",
        platform: "SYNRGY app",
        checks: [
          {
            id: "eg-14",
            text: "Health data syncs from connected device (steps, heart rate, sleep)",
          },
          {
            id: "eg-15",
            text: "Synced data appears on dashboard within 5 minutes",
          },
          {
            id: "eg-16",
            text: "Values on dashboard match source device readings",
          },
          {
            id: "eg-17",
            text: "Behavioral insights display as 'Health insights' (SDK never named)",
          },
        ],
      },
      {
        title: "Rx savings",
        platform: "SYNRGY app",
        checks: [
          {
            id: "eg-18",
            text: "Medication search returns results with pharmacy options and pricing",
          },
          {
            id: "eg-19",
            text: "At least 3 pharmacy options shown with savings calculated",
          },
          {
            id: "eg-20",
            text: "Pet medication search works through same engine",
          },
        ],
      },
      {
        title: "Food logging & alerts",
        platform: "SYNRGY app",
        checks: [
          {
            id: "eg-21",
            text: "Member can log food items and they persist",
          },
          {
            id: "eg-22",
            text: "Flagged items trigger toxicity alert with correct severity",
          },
          {
            id: "eg-23",
            text: "Logging activity tracked as engagement action",
          },
        ],
      },
      {
        title: "Pet care features",
        platform: "SYNRGY app",
        checks: [
          {
            id: "eg-24",
            text: "Virtual vet consultation can be booked and completed",
          },
          { id: "eg-25", text: "Pet visit appears in history" },
          {
            id: "eg-26",
            text: "Owner behavioral correlation insights surface when relevant",
          },
        ],
      },
      {
        title: "Notifications & nudges",
        platform: "SYNRGY app",
        checks: [
          {
            id: "eg-27",
            text: "Inactivity nudge fires after configured threshold (in-app, push, or email)",
          },
          {
            id: "eg-28",
            text: "Milestone congratulation message fires after achievement",
          },
          {
            id: "eg-29",
            text: "Opted-out member receives no push notifications",
          },
          {
            id: "eg-30",
            text: "Toggling notification preferences updates delivery immediately",
          },
        ],
      },
      {
        title: "Data flows back upstream",
        platform: "All portals",
        checks: [
          {
            id: "eg-31",
            text: "Admin portal shows group-level engagement metrics (active members, avg score)",
          },
          {
            id: "eg-32",
            text: "Client portal shows employer-facing engagement dashboard",
          },
          {
            id: "eg-33",
            text: "Broker sees engagement trends and feature adoption in Infinity Portal",
          },
          {
            id: "eg-34",
            text: "All covered events logged with correct event type and timestamp",
          },
          {
            id: "eg-35",
            text: "BEEP outreach metrics (sent, delivered, opened, clicked) are accurate",
          },
        ],
      },
    ],
  },
];

export function getAllCheckIds(): string[] {
  return scenarios.flatMap((s) =>
    s.steps.flatMap((step) => step.checks.map((c) => c.id))
  );
}

export function getTotalCheckCount(): number {
  return scenarios.reduce(
    (sum, s) => sum + s.steps.reduce((ss, step) => ss + step.checks.length, 0),
    0
  );
}

export function getScenarioCheckCount(scenario: Scenario): number {
  return scenario.steps.reduce((sum, step) => sum + step.checks.length, 0);
}
