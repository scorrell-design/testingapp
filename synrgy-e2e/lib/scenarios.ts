export type Path = "core" | "path-a" | "path-b" | "path-c";

export type Check = {
  id: string;
  text: string;
};

export type Step = {
  title: string;
  platform: string;
  path: Path;
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
  // ─── SCENARIO 1: Admin creates & manages broker ───
  {
    id: "admin-broker",
    persona: "Admin",
    icon: "A",
    color: "#185FA5",
    bg: "#E6F1FB",
    title: "Create & manage a broker",
    summary:
      "Admin provisions a new broker account, verifies access, confirms portal login, and tests account management lifecycle.",
    steps: [
      {
        title: "Log into admin portal",
        platform: "Admin portal",
        path: "core",
        checks: [
          { id: "ab-1", text: "Admin credentials authenticate successfully" },
          { id: "ab-2", text: "Admin dashboard loads with broker management section visible" },
        ],
      },
      {
        title: "Create new broker account — happy path",
        platform: "Admin portal",
        path: "core",
        checks: [
          { id: "ab-3", text: "All required fields present: name, email, phone, agency name" },
          { id: "ab-4", text: "Product line assignment available (SYNRGY, CHAMP, QTM)" },
          { id: "ab-5", text: "Submitting valid info creates the broker with 'Active' status" },
        ],
      },
      {
        title: "Verify broker receives access",
        platform: "Email + Infinity portal",
        path: "core",
        checks: [
          { id: "ab-6", text: "Broker receives welcome email within 5 minutes" },
          { id: "ab-7", text: "Email contains working login link or temporary credentials" },
          { id: "ab-8", text: "Broker can log into Infinity Portal with provided credentials" },
          { id: "ab-9", text: "Broker only sees the product lines they were assigned" },
        ],
      },
      {
        title: "Duplicate & invalid broker creation",
        platform: "Admin portal",
        path: "path-a",
        checks: [
          { id: "ab-10", text: "Submitting with a duplicate email shows an error and blocks creation" },
          { id: "ab-11", text: "Submitting with missing required fields shows field-level validation errors" },
          { id: "ab-12", text: "Submitting with an invalid email format is rejected" },
        ],
      },
      {
        title: "Broker account lifecycle",
        platform: "Admin portal",
        path: "path-c",
        checks: [
          { id: "ab-13", text: "Admin can edit broker details (name, phone, agency)" },
          { id: "ab-14", text: "Admin can deactivate broker — broker can no longer log in" },
          { id: "ab-15", text: "Deactivated broker's prospects and groups remain intact and accessible by admin" },
          { id: "ab-16", text: "Admin can reactivate broker — broker regains portal access" },
          { id: "ab-17", text: "Reactivated broker sees all their previous prospects and groups" },
        ],
      },
    ],
  },

  // ─── SCENARIO 2: Broker creates prospect & proposal ───
  {
    id: "broker-prospect",
    persona: "Broker",
    icon: "B",
    color: "#534AB7",
    bg: "#EEEDFE",
    title: "Create prospect → proposal → RFC",
    summary:
      "Broker creates a new prospect, generates savings proposals through multiple analysis modes, then submits an RFC for coverage approval.",
    steps: [
      {
        title: "Create a new prospect",
        platform: "Infinity portal",
        path: "core",
        checks: [
          { id: "bp-1", text: "Broker can enter company name, employee count, industry, state, pay cycle" },
          { id: "bp-2", text: "Prospect appears in broker's prospect list with status 'New'" },
          { id: "bp-3", text: "Prospect is only visible to the broker who created it" },
        ],
      },
      {
        title: "Run Fission quick estimate",
        platform: "Infinity portal",
        path: "core",
        checks: [
          { id: "bp-4", text: "Selecting 'Quick estimate' opens Fission flow with group info pre-filled" },
          { id: "bp-5", text: "Loading screen shows progress animation with company name" },
          { id: "bp-6", text: "Proposal output renders with simulated employee profiles" },
          { id: "bp-7", text: "KPI cards, paycheck comparison, and savings breakdown display correctly" },
          { id: "bp-8", text: "Proposal clearly labeled as 'Estimated' (not precise)" },
        ],
      },
      {
        title: "Run Fusion precise analysis",
        platform: "Infinity portal",
        path: "core",
        checks: [
          { id: "bp-9", text: "Broker can upload .xlsx, .csv, or .pdf census file" },
          { id: "bp-10", text: "File detection preview shows: employee count, recognized fields, company name" },
          { id: "bp-11", text: "Proposal output uses real employee data — not simulated" },
          { id: "bp-12", text: "Per-employee savings breakdown is accurate (within 1% of manual calc)" },
          { id: "bp-13", text: "Employer savings totals match sum of individual employee savings" },
        ],
      },
      {
        title: "Save & send proposal",
        platform: "Infinity portal",
        path: "core",
        checks: [
          { id: "bp-14", text: "Save proposal stores it under the prospect record" },
          { id: "bp-15", text: "Download PDF renders a clean, branded document" },
          { id: "bp-16", text: "Send via email delivers proposal to entered email address" },
          { id: "bp-17", text: "Broker info card at bottom shows correct name, email, phone, company" },
        ],
      },
      {
        title: "Submit RFC — happy path",
        platform: "Infinity portal",
        path: "core",
        checks: [
          { id: "bp-18", text: "RFC form pre-fills plan details from the approved proposal" },
          { id: "bp-19", text: "Submitting RFC creates a record linked to prospect + proposal + broker" },
          { id: "bp-20", text: "RFC status shows as 'Pending' in broker's view" },
          { id: "bp-21", text: "Admin / underwriting receives notification of new RFC within 5 minutes" },
        ],
      },
      {
        title: "Fusion file rejection & errors",
        platform: "Infinity portal",
        path: "path-a",
        checks: [
          { id: "bp-22", text: "Uploading a malformed file shows clear error with specific issue identified" },
          { id: "bp-23", text: "File missing required columns (e.g., SSN) shows \"Missing required field: SSN\"" },
          { id: "bp-24", text: "File exceeding size limit (25MB) is rejected with size error" },
          { id: "bp-25", text: "File with invalid data types (e.g., non-numeric salary) flags specific rows" },
          { id: "bp-26", text: "After file rejection, broker can re-upload without losing prospect data" },
        ],
      },
      {
        title: "Fission-only path (no Fusion)",
        platform: "Infinity portal",
        path: "path-b",
        checks: [
          { id: "bp-27", text: "Broker generates Fission estimate and proceeds directly to RFC without Fusion" },
          { id: "bp-28", text: "Upgrade CTA to Fusion is visible but broker can skip it" },
          { id: "bp-29", text: "RFC submitted from a Fission-only proposal is accepted" },
          { id: "bp-30", text: "Fission-only proposal is clearly labeled as 'Estimated' through entire lifecycle" },
        ],
      },
      {
        title: "Fission → Fusion upgrade mid-flow",
        platform: "Infinity portal",
        path: "path-b",
        checks: [
          { id: "bp-31", text: "Broker clicks upgrade CTA on Fission proposal to switch to Fusion" },
          { id: "bp-32", text: "Fusion upload flow opens with group info already pre-filled" },
          { id: "bp-33", text: "After Fusion proposal generates, Fission estimate is preserved (not deleted)" },
          { id: "bp-34", text: "Broker can compare Fission vs Fusion proposals side by side (if applicable) or toggle between them" },
        ],
      },
    ],
  },

  // ─── SCENARIO 3: RFC review & prospect → group conversion ───
  {
    id: "prospect-to-group",
    persona: "Admin + Broker",
    icon: "G",
    color: "#854F0B",
    bg: "#FAEEDA",
    title: "Prospect converts to active group",
    summary:
      "Admin reviews and approves (or denies) the RFC, prospect becomes an active group, census maps to member records, and employer portal access is provisioned.",
    steps: [
      {
        title: "Approve RFC — happy path",
        platform: "Admin portal",
        path: "core",
        checks: [
          { id: "pg-1", text: "Admin can review RFC details (plan config, group info, broker)" },
          { id: "pg-2", text: "Approving RFC changes its status from 'Pending' to 'Approved'" },
          { id: "pg-3", text: "Status change reflects immediately in both admin and broker portal views" },
        ],
      },
      {
        title: "Verify prospect → group conversion",
        platform: "Admin + Infinity portal",
        path: "core",
        checks: [
          { id: "pg-4", text: "Prospect status changes to 'Active group' automatically after RFC approval" },
          { id: "pg-5", text: "Group record inherits all prospect data (company, plan, broker)" },
          { id: "pg-6", text: "Broker sees group under 'Active groups' — no longer in prospects list" },
          { id: "pg-7", text: "Broker receives confirmation notification of group activation" },
        ],
      },
      {
        title: "Census → member records",
        platform: "Admin portal",
        path: "core",
        checks: [
          { id: "pg-8", text: "Each census row creates an individual member record under the group" },
          { id: "pg-9", text: "Member records have correct name, DOB, tier, salary, and effective date" },
          { id: "pg-10", text: "Member count in group dashboard matches census row count" },
        ],
      },
      {
        title: "Employer portal provisioned",
        platform: "Client portal",
        path: "core",
        checks: [
          { id: "pg-11", text: "Employer contact can log into client portal" },
          { id: "pg-12", text: "Client dashboard shows correct group name, plan, and member count" },
          { id: "pg-13", text: "Effective dates and contribution amounts match group configuration" },
        ],
      },
      {
        title: "RFC denied",
        platform: "Admin + Infinity portal",
        path: "path-a",
        checks: [
          { id: "pg-14", text: "Admin can deny an RFC with a required denial reason" },
          { id: "pg-15", text: "RFC status changes to 'Denied' — visible to both admin and broker" },
          { id: "pg-16", text: "Broker receives notification with denial reason" },
          { id: "pg-17", text: "Prospect remains as a prospect (does NOT convert to group)" },
          { id: "pg-18", text: "Broker can revise and resubmit a new RFC from the same prospect" },
        ],
      },
      {
        title: "Census errors & duplicates",
        platform: "Admin portal",
        path: "path-a",
        checks: [
          { id: "pg-19", text: "Census row with missing required fields is flagged with specific error" },
          { id: "pg-20", text: "Duplicate members (matching name + DOB or SSN) are flagged for resolution" },
          { id: "pg-21", text: "Admin can resolve duplicates: merge, skip, or override" },
          { id: "pg-22", text: "Partially valid census processes valid rows and queues invalid rows for correction" },
        ],
      },
    ],
  },

  // ─── SCENARIO 4: CBS/TPA implementation & group onboarding ───
  {
    id: "cbs-implementation",
    persona: "CBS/TPA",
    icon: "C",
    color: "#0C447C",
    bg: "#E6F1FB",
    title: "CBS receives & implements new group",
    summary:
      "After the MSA is signed and the RFC is approved, the CBS/TPA team receives the group handoff, processes the final census, sets up plan administration, provisions BEEP enrollment, and manages ongoing member changes.",
    steps: [
      {
        title: "Receive group handoff",
        platform: "CBS/TPA system",
        path: "core",
        checks: [
          { id: "cb-1", text: "CBS receives notification of new group with all plan details from admin" },
          { id: "cb-2", text: "Group record in CBS matches RFC: company name, plan config, effective date, broker" },
          { id: "cb-3", text: "MSA status shows as 'Signed' — CBS can proceed with implementation" },
          { id: "cb-4", text: "CBS can view broker contact info for coordination questions" },
        ],
      },
      {
        title: "Process final census",
        platform: "CBS/TPA system",
        path: "core",
        checks: [
          { id: "cb-5", text: "CBS receives or uploads the final census file" },
          { id: "cb-6", text: "Census validates all required fields: Employee Name, State, Gross Pay, Tax Withholdings, Net Pay, DOB, SSN, Company Name, Pay Cycle" },
          { id: "cb-7", text: "Census is accepted with a confirmation receipt showing: employee count, field mapping, effective date" },
          { id: "cb-8", text: "Each census row creates a member record in the system linked to the group" },
        ],
      },
      {
        title: "Census rejection & correction",
        platform: "CBS/TPA system",
        path: "path-a",
        checks: [
          { id: "cb-9", text: "Census with non-numeric salary values is rejected with row-level error detail" },
          { id: "cb-10", text: "Census with invalid state codes is rejected with specific invalid values listed" },
          { id: "cb-11", text: "Census missing required SSN column shows \"Missing required field: SSN\"" },
          { id: "cb-12", text: "CBS can send correction request back to broker or employer with specific issues listed" },
          { id: "cb-13", text: "Corrected census can be re-uploaded and processes successfully" },
        ],
      },
      {
        title: "Plan administration setup",
        platform: "CBS/TPA system",
        path: "core",
        checks: [
          { id: "cb-14", text: "Section 125 plan document is configured for the group" },
          { id: "cb-15", text: "Contribution amounts match RFC plan configuration (employee + employer portions)" },
          { id: "cb-16", text: "Pay cycle deduction schedule aligns with employer's payroll frequency" },
          { id: "cb-17", text: "ACH payment routing is configured for benefit disbursements" },
        ],
      },
      {
        title: "Trigger BEEP enrollment",
        platform: "CBS/TPA → BEEP",
        path: "core",
        checks: [
          { id: "cb-18", text: "CBS triggers enrollment outreach window for the group" },
          { id: "cb-19", text: "BEEP receives the member list and begins outreach sequence" },
          { id: "cb-20", text: "CBS can verify BEEP delivery status (sent, delivered, opened) per member" },
          { id: "cb-21", text: "Enrollment window start and end dates are correctly enforced" },
        ],
      },
      {
        title: "Member changes & terminations",
        platform: "CBS/TPA system",
        path: "path-c",
        checks: [
          { id: "cb-22", text: "CBS can add a new member mid-cycle (new hire) with correct effective date" },
          { id: "cb-23", text: "CBS can terminate a member — member status changes to 'Terminated'" },
          { id: "cb-24", text: "Terminated member loses app access but historical data is preserved" },
          { id: "cb-25", text: "Once final census is sent to vendors, no mid-cycle termination within 30 days (per policy)" },
          { id: "cb-26", text: "CBS can process a qualifying life event (marriage, birth) that changes a member's tier" },
        ],
      },
    ],
  },

  // ─── SCENARIO 5: Employer/HR views client portal ───
  {
    id: "employer-portal",
    persona: "Employer / HR",
    icon: "H",
    color: "#3C3489",
    bg: "#EEEDFE",
    title: "Employer monitors enrollment & utilization",
    summary:
      "Employer/HR representative logs into the client portal to monitor employee enrollment, view aggregated utilization data, confirm payroll deductions, and ensure no individual PHI is exposed.",
    steps: [
      {
        title: "Employer login & dashboard",
        platform: "Client portal",
        path: "core",
        checks: [
          { id: "ep-1", text: "Employer can log in with valid credentials" },
          { id: "ep-2", text: "Dashboard shows correct company name, plan name, and enrollment period" },
          { id: "ep-3", text: "Summary metrics visible: total enrolled, total activated, total pending, total opted-out" },
        ],
      },
      {
        title: "Employee roster",
        platform: "Client portal",
        path: "core",
        checks: [
          { id: "ep-4", text: "Roster shows all employees in the group with enrollment status" },
          { id: "ep-5", text: "Each row shows: name, enrollment status, activation date" },
          { id: "ep-6", text: "No individual PHI or health data is visible anywhere on the roster (COMPLIANCE)" },
          { id: "ep-7", text: "Roster supports filtering by department or location if applicable" },
        ],
      },
      {
        title: "Utilization reporting",
        platform: "Client portal",
        path: "core",
        checks: [
          { id: "ep-8", text: "Aggregated utilization report shows: virtual care visits, HRA completions, screening completions, Rx savings usage" },
          { id: "ep-9", text: "All data is aggregated — no individual member data exposed (COMPLIANCE)" },
          { id: "ep-10", text: "Reports can be filtered by date range" },
        ],
      },
      {
        title: "Payroll confirmation",
        platform: "Client portal",
        path: "core",
        checks: [
          { id: "ep-11", text: "Section 125 deduction summary is visible with per-employee monthly amount" },
          { id: "ep-12", text: "Monthly benefit payment processing status is shown" },
          { id: "ep-13", text: "Any payroll integration errors are flagged and visible" },
          { id: "ep-14", text: "Employer administration fee is correctly calculated and displayed" },
        ],
      },
      {
        title: "Employer with restricted access",
        platform: "Client portal",
        path: "path-c",
        checks: [
          { id: "ep-15", text: "Employer cannot access other groups' data" },
          { id: "ep-16", text: "Employer cannot modify employee records directly (read-only)" },
          { id: "ep-17", text: "Employer cannot view, download, or export individual health data" },
          { id: "ep-18", text: "Session timeout enforced after inactivity period" },
        ],
      },
    ],
  },

  // ─── SCENARIO 6: BEEP enrollment & outreach ───
  {
    id: "member-enroll",
    persona: "Member",
    icon: "M",
    color: "#0F6E56",
    bg: "#E1F5EE",
    title: "BEEP enrollment journey",
    summary:
      "Member receives enrollment outreach, verifies identity, confirms enrollment, and receives app download instructions. Covers happy path, follow-up logic, and opt-out.",
    steps: [
      {
        title: "Receive initial outreach",
        platform: "SMS + email",
        path: "core",
        checks: [
          { id: "me-1", text: "Member receives SMS and/or email with enrollment link" },
          { id: "me-2", text: "Message delivered within the configured send window" },
          { id: "me-3", text: "Link opens enrollment landing page (not broken or expired)" },
        ],
      },
      {
        title: "Complete enrollment — happy path",
        platform: "BEEP landing page",
        path: "core",
        checks: [
          { id: "me-4", text: "Landing page shows correct company name, plan details, and branding" },
          { id: "me-5", text: "Identity verification works: correct name + DOB + last 4 SSN grants access" },
          { id: "me-6", text: "Completing enrollment changes member status from 'Invited' to 'Enrolled'" },
          { id: "me-7", text: "Member receives app download instructions and welcome message" },
        ],
      },
      {
        title: "Enrollment failure & retry",
        platform: "BEEP landing page",
        path: "path-a",
        checks: [
          { id: "me-8", text: "Incorrect identity info (wrong DOB or SSN) shows error and allows retry" },
          { id: "me-9", text: "After 3 failed attempts, member is locked out with support contact info" },
          { id: "me-10", text: "Enrollment link that has expired shows 'Enrollment closed' message" },
          { id: "me-11", text: "Expired link does not allow late enrollment" },
        ],
      },
      {
        title: "Follow-up & reminder logic",
        platform: "SMS + email",
        path: "core",
        checks: [
          { id: "me-12", text: "Non-responders receive reminder at configured interval (e.g., Day 3)" },
          { id: "me-13", text: "Second reminder fires at next interval (e.g., Day 7)" },
          { id: "me-14", text: "Reminders stop immediately once member enrolls" },
        ],
      },
      {
        title: "Opt-out flow",
        platform: "SMS + email",
        path: "path-b",
        checks: [
          { id: "me-15", text: "Member can opt out / unsubscribe from enrollment messages" },
          { id: "me-16", text: "Opt-out stops ALL future BEEP outreach for that member" },
          { id: "me-17", text: "Member record is flagged as 'Opted out' in admin portal" },
          { id: "me-18", text: "Opted-out member is NOT auto-enrolled or re-contacted in future cycles" },
        ],
      },
      {
        title: "BEEP metrics tracking",
        platform: "Admin portal",
        path: "core",
        checks: [
          { id: "me-19", text: "Outreach metrics (sent, delivered, opened, clicked, enrolled) tracked per group" },
          { id: "me-20", text: "Admin dashboard shows accurate funnel metrics matching actual member actions" },
        ],
      },
    ],
  },

  // ─── SCENARIO 7: Member app onboarding ───
  {
    id: "member-onboard",
    persona: "Member",
    icon: "O",
    color: "#993C1D",
    bg: "#FAECE7",
    title: "App onboarding & HRA",
    summary:
      "Member downloads the app, creates an account, completes the onboarding carousel, grants permissions, and finishes the Health Risk Assessment.",
    steps: [
      {
        title: "App download & account creation",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          { id: "mo-1", text: "App installs and launches without errors" },
          { id: "mo-2", text: "Account creation links member to correct group, plan, and coverage tier" },
          { id: "mo-3", text: "Verification screens use cream background (#F5EDE1), not white" },
          { id: "mo-4", text: "CTA buttons are brand orange (#C95A38) on all setup screens" },
          { id: "mo-5", text: "Typeface is Geist throughout; headline color is #005F78 dark teal" },
        ],
      },
      {
        title: "Permissions",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          { id: "mo-6", text: "Permission prompts fire in order: location → health data → notifications" },
          { id: "mo-7", text: "Granting all permissions proceeds to onboarding carousel" },
          { id: "mo-8", text: "Granted permissions persist across app restarts" },
        ],
      },
      {
        title: "Permissions denied",
        platform: "SYNRGY app",
        path: "path-b",
        checks: [
          { id: "mo-9", text: "Denying location permission: app continues but location-based features are disabled" },
          { id: "mo-10", text: "Denying health data permission: app continues but body vitals and behavioral insights are unavailable" },
          { id: "mo-11", text: "Denying notification permission: app continues but push nudges are not delivered" },
          { id: "mo-12", text: "Member can re-enable permissions later from app settings" },
          { id: "mo-13", text: "Re-enabling a permission activates the associated features immediately" },
        ],
      },
      {
        title: "Onboarding carousel",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          { id: "mo-14", text: "All 5 carousel screens render correctly" },
          { id: "mo-15", text: "Pagination dots stay fixed at bottom (don't scroll with content)" },
          { id: "mo-16", text: "AI Orb is a dimensional teal radial gradient sphere (not flat/purple/red)" },
          { id: "mo-17", text: "Suggestion bubble spacing is correct (not squished)" },
          { id: "mo-18", text: "All copy uses compliant language ('may correspond to covered events')" },
          { id: "mo-19", text: "No instance of 'qualify for benefits' or 'earn benefits' anywhere" },
        ],
      },
      {
        title: "Complete HRA — happy path",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          { id: "mo-20", text: "Tapping 'Complete Your Health Risk Assessment' opens HRA flow" },
          { id: "mo-21", text: "HRA intro screen explains what it is and why it matters" },
          { id: "mo-22", text: "Chat Q&A flow presents all questions and accepts answers" },
          { id: "mo-23", text: "Processing animation plays after final question" },
          { id: "mo-24", text: "Results screen shows personalized health profile" },
          { id: "mo-25", text: "HRA completion is recorded as a covered event" },
        ],
      },
      {
        title: "Skip HRA / delayed completion",
        platform: "SYNRGY app",
        path: "path-b",
        checks: [
          { id: "mo-26", text: "Member can skip HRA and proceed to the app dashboard" },
          { id: "mo-27", text: "HRA prompt remains accessible from the dashboard for later completion" },
          { id: "mo-28", text: "Member can complete HRA at any point after onboarding" },
          { id: "mo-29", text: "Nudge to complete HRA fires after configured delay (e.g., 24 hours)" },
        ],
      },
      {
        title: "AI Orb first interaction",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          { id: "mo-30", text: "First AI Orb interaction includes transparency disclaimer per Responsible AI Manifesto" },
          { id: "mo-31", text: "Orb greeting is personalized to the member's plan" },
          { id: "mo-32", text: "Orb never implies SYNRGY determines benefit eligibility" },
        ],
      },
    ],
  },

  // ─── SCENARIO 8: Member uses core app features ───
  {
    id: "member-features",
    persona: "Member",
    icon: "E",
    color: "#993556",
    bg: "#FBEAF0",
    title: "Daily app engagement & features",
    summary:
      "Member uses all core app features. Engagement actions are tracked, covered events log correctly, and compliance language is verified on every surface.",
    steps: [
      {
        title: "Virtual care",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          { id: "mf-1", text: "Member can search and browse available providers" },
          { id: "mf-2", text: "Booking a telemedicine appointment completes successfully" },
          { id: "mf-3", text: "Video session connects and functions" },
          { id: "mf-4", text: "Completed visit appears in member's visit history" },
          { id: "mf-5", text: "Visit is recorded as a covered event with correct event type" },
        ],
      },
      {
        title: "Monthly health screening",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          { id: "mf-6", text: "Screening prompt appears at correct monthly interval" },
          { id: "mf-7", text: "Member can complete the screening flow" },
          { id: "mf-8", text: "Completion is recorded as a covered event with timestamp" },
          { id: "mf-9", text: "Confirmation message uses compliant language" },
        ],
      },
      {
        title: "Body vitals",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          { id: "mf-10", text: "Health data syncs from connected device (steps, heart rate, sleep)" },
          { id: "mf-11", text: "Synced data appears on dashboard within 5 minutes" },
          { id: "mf-12", text: "Values on dashboard match source device readings" },
        ],
      },
      {
        title: "Behavioral health insights",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          { id: "mf-13", text: "Insights display as 'Health insights' only (SDK never named to user)" },
          { id: "mf-14", text: "Recommendations are personalized based on member's data" },
          { id: "mf-15", text: "No third-party SDK branding appears anywhere in the UI" },
        ],
      },
      {
        title: "Rx savings",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          { id: "mf-16", text: "Medication search returns results with pharmacy options and pricing" },
          { id: "mf-17", text: "At least 3 pharmacy options shown with savings calculated" },
          { id: "mf-18", text: "Pet medication search works through same engine" },
        ],
      },
      {
        title: "Food logging",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          { id: "mf-19", text: "Member can log food items and they persist" },
          { id: "mf-20", text: "Flagged items trigger toxicity alert with correct severity" },
          { id: "mf-21", text: "Logging activity tracked as engagement action" },
        ],
      },
      {
        title: "Pet care features",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          { id: "mf-22", text: "Virtual vet consultation can be booked and completed" },
          { id: "mf-23", text: "Pet visit appears in history" },
          { id: "mf-24", text: "Owner behavioral correlation insights surface when relevant" },
        ],
      },
      {
        title: "Engagement tracking verification",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          { id: "mf-25", text: "Every qualifying engagement action creates a covered event record" },
          { id: "mf-26", text: "Covered events include correct event type and timestamp" },
          { id: "mf-27", text: "App never describes itself as determining benefit eligibility" },
          { id: "mf-28", text: "All confirmation messages use compliant language throughout" },
        ],
      },
    ],
  },

  // ─── SCENARIO 9: Member disengagement & recovery ───
  {
    id: "member-recovery",
    persona: "Member",
    icon: "R",
    color: "#854F0B",
    bg: "#FAEEDA",
    title: "App deletion, re-engagement & recovery",
    summary:
      "Member deletes the app or revokes permissions. BEEP rescue journey activates. Member re-installs and recovers their data.",
    steps: [
      {
        title: "Member deletes app",
        platform: "SYNRGY app + backend",
        path: "path-c",
        checks: [
          { id: "mr-1", text: "After member deletes the app, their account and data are NOT deleted from the backend" },
          { id: "mr-2", text: "Member status changes to reflect inactivity (not terminated)" },
          { id: "mr-3", text: "Health data, HRA results, and covered event history are all preserved" },
          { id: "mr-4", text: "Admin portal shows member as 'Inactive' — not removed from the group" },
        ],
      },
      {
        title: "BEEP rescue journey activates",
        platform: "SMS + email",
        path: "path-c",
        checks: [
          { id: "mr-5", text: "Inactivity triggers BEEP rescue outreach after configured threshold" },
          { id: "mr-6", text: "Rescue message includes re-download link and reminder of available benefits" },
          { id: "mr-7", text: "Rescue messages follow the configured cadence (not immediately)" },
          { id: "mr-8", text: "If member has at least one permission still on, SMS/email nudges can still reach them" },
        ],
      },
      {
        title: "Member re-installs & recovers",
        platform: "SYNRGY app",
        path: "path-c",
        checks: [
          { id: "mr-9", text: "Re-downloading and logging in recovers the existing account (not a new one)" },
          { id: "mr-10", text: "All previous data is intact: HRA results, vitals history, covered events" },
          { id: "mr-11", text: "Member does NOT have to redo onboarding or HRA" },
          { id: "mr-12", text: "Permissions prompt fires again for any previously revoked permissions" },
        ],
      },
      {
        title: "Permission revocation (without app deletion)",
        platform: "SYNRGY app",
        path: "path-c",
        checks: [
          { id: "mr-13", text: "Revoking health data permission stops vitals sync and behavioral insights" },
          { id: "mr-14", text: "Revoking notification permission stops push nudges" },
          { id: "mr-15", text: "BEEP can still reach the member via SMS/email if those channels are still available" },
          { id: "mr-16", text: "Re-enabling permissions reactivates features immediately (no restart needed)" },
        ],
      },
    ],
  },

  // ─── SCENARIO 10: Data flows upstream — all dashboards ───
  {
    id: "data-upstream",
    persona: "All users",
    icon: "D",
    color: "#0F6E56",
    bg: "#E1F5EE",
    title: "Data flows back to all portals",
    summary:
      "Verify that member engagement data, covered events, enrollment metrics, and utilization data flow correctly upstream to every portal — broker, admin, employer, and CBS.",
    steps: [
      {
        title: "Admin portal data",
        platform: "Admin portal",
        path: "core",
        checks: [
          { id: "du-1", text: "Group-level engagement metrics show: active members, avg engagement score, feature usage breakdown" },
          { id: "du-2", text: "Member-level status is accurate: active, inactive, terminated, pending" },
          { id: "du-3", text: "Covered event log is complete with correct event types and timestamps" },
          { id: "du-4", text: "BEEP outreach funnel (sent → delivered → opened → clicked → enrolled) is accurate" },
        ],
      },
      {
        title: "Broker portal data",
        platform: "Infinity portal",
        path: "core",
        checks: [
          { id: "du-5", text: "Broker can view engagement trends for their groups" },
          { id: "du-6", text: "Enrollment rate and feature adoption metrics are accurate" },
          { id: "du-7", text: "Broker cannot see individual member PHI (COMPLIANCE)" },
        ],
      },
      {
        title: "Employer portal data",
        platform: "Client portal",
        path: "core",
        checks: [
          { id: "du-8", text: "Aggregated utilization data matches admin portal data" },
          { id: "du-9", text: "Enrollment counts (enrolled, pending, opted-out) match actual member statuses" },
          { id: "du-10", text: "Payroll deduction summary matches plan configuration" },
          { id: "du-11", text: "No individual PHI exposed in any report or export (COMPLIANCE)" },
        ],
      },
      {
        title: "CBS/TPA data",
        platform: "CBS/TPA system",
        path: "core",
        checks: [
          { id: "du-12", text: "CBS sees correct member roster with current statuses" },
          { id: "du-13", text: "Termination and tier change events from CBS are reflected in app and admin portal" },
          { id: "du-14", text: "ACH payment records match covered event totals" },
        ],
      },
      {
        title: "Cross-platform data consistency",
        platform: "All",
        path: "path-c",
        checks: [
          { id: "du-15", text: "Member count in admin portal = member count in CBS = roster count in employer portal" },
          { id: "du-16", text: "Covered event count in admin portal matches the member's in-app history" },
          { id: "du-17", text: "A change made in CBS (e.g., termination) propagates to admin, employer, and app" },
          { id: "du-18", text: "A status change in admin (e.g., deactivation) propagates to CBS and employer portal" },
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

export function getCheckCountByPath(scenario: Scenario, path: Path): number {
  return scenario.steps
    .filter((step) => step.path === path)
    .reduce((sum, step) => sum + step.checks.length, 0);
}

export function getScenarioPaths(scenario: Scenario): Path[] {
  const paths = new Set(scenario.steps.map((s) => s.path));
  return Array.from(paths);
}

export function getCheckIdsForPaths(scenario: Scenario, paths: Path[]): string[] {
  return scenario.steps
    .filter((step) => paths.includes(step.path))
    .flatMap((step) => step.checks.map((c) => c.id));
}
