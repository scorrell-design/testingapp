export type Path = "core" | "path-a" | "path-b" | "path-c";

export type Check = {
  id: string;
  text: string;
  expected: string;
  preReqs?: string;
  successCriteria?: string[];
  whereToLook?: string;
  howToGetThere?: string;
  failureGuidance?: string;
  dependsOn?: string[];
  estimatedMinutes?: number;
  notes?: string;
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
          {
            id: "ab-1",
            text: "Admin credentials authenticate successfully",
            expected: "After entering valid admin credentials, the dashboard loads within 5 seconds showing the broker management section in the left sidebar.",
            preReqs: "Valid admin account with broker management permissions.",
          },
          {
            id: "ab-2",
            text: "Admin dashboard loads with broker management section visible",
            expected: "Dashboard displays a left sidebar with 'Broker Management' as a menu item. Clicking it shows a list of existing brokers (or empty state if none). Top nav shows admin name and logout option.",
            preReqs: "Successfully logged in as admin.",
          },
        ],
      },
      {
        title: "Create new broker account — happy path",
        platform: "Admin portal",
        path: "core",
        checks: [
          {
            id: "ab-3",
            text: "All required fields present: name, email, phone, agency name",
            expected: "The 'Create Broker' form shows labeled fields for: First Name, Last Name, Email, Phone Number, and Agency Name. All fields have asterisks or 'Required' indicators.",
            preReqs: "On the Broker Management page, clicked 'Create Broker' or equivalent button.",
          },
          {
            id: "ab-4",
            text: "Product line assignment available (SYNRGY, CHAMP, QTM)",
            expected: "Below the contact fields, a 'Product Lines' section shows checkboxes or multi-select for SYNRGY, CHAMP, and QTM. At least one must be selected before submission.",
            preReqs: "On the Create Broker form.",
          },
          {
            id: "ab-5",
            text: "Submitting valid info creates the broker with 'Active' status",
            expected: "After filling all fields and clicking 'Create' / 'Submit', a success message appears. The new broker appears in the broker list with status badge showing 'Active' in green.",
            preReqs: "All required fields filled with valid data, at least one product line selected.",
          },
        ],
      },
      {
        title: "Verify broker receives access",
        platform: "Email + Infinity portal",
        path: "core",
        checks: [
          {
            id: "ab-6",
            text: "Broker receives welcome email within 5 minutes",
            expected: "Check the broker's email inbox. A welcome email from the system arrives within 5 minutes of account creation. Email subject includes the broker's name or 'Welcome'.",
            preReqs: "Broker account just created with a valid, accessible email address.",
          },
          {
            id: "ab-7",
            text: "Email contains working login link or temporary credentials",
            expected: "The welcome email body contains either: (a) a direct login link that opens the Infinity Portal login page, or (b) temporary username/password credentials. The link is not expired or broken.",
            preReqs: "Welcome email received.",
          },
          {
            id: "ab-8",
            text: "Broker can log into Infinity Portal with provided credentials",
            expected: "Using the credentials from the email, the broker can successfully log into the Infinity Portal. The portal dashboard loads with the broker's name displayed.",
            preReqs: "Have the credentials from the welcome email. Infinity Portal is accessible.",
          },
          {
            id: "ab-9",
            text: "Broker only sees the product lines they were assigned",
            expected: "In the Infinity Portal, the broker's navigation or product selector only shows the product lines assigned during creation. If only SYNRGY was assigned, CHAMP and QTM should NOT appear.",
            preReqs: "Broker logged into Infinity Portal.",
          },
        ],
      },
      {
        title: "Duplicate & invalid broker creation",
        platform: "Admin portal",
        path: "path-a",
        checks: [
          {
            id: "ab-10",
            text: "Submitting with a duplicate email shows an error and blocks creation",
            expected: "Enter the same email as an existing broker. On submit, an error message appears near the email field: 'A broker with this email already exists' or similar. The form does NOT create a duplicate record.",
            preReqs: "At least one broker already exists. On the Create Broker form.",
          },
          {
            id: "ab-11",
            text: "Submitting with missing required fields shows field-level validation errors",
            expected: "Leave one or more required fields blank and click submit. Each empty required field displays a red validation message below it (e.g., 'Name is required'). Form does not submit.",
            preReqs: "On the Create Broker form.",
          },
          {
            id: "ab-12",
            text: "Submitting with an invalid email format is rejected",
            expected: "Enter a malformed email (e.g., 'notanemail', 'test@', '@domain.com'). On submit, the email field shows a validation error: 'Please enter a valid email address' or similar.",
            preReqs: "On the Create Broker form.",
          },
        ],
      },
      {
        title: "Broker account lifecycle",
        platform: "Admin portal",
        path: "path-c",
        checks: [
          {
            id: "ab-13",
            text: "Admin can edit broker details (name, phone, agency)",
            expected: "Click on an existing broker to open their profile. Click 'Edit'. Modify name, phone, and agency fields. Save. The updated values persist and display correctly on the broker's profile.",
            preReqs: "At least one active broker exists.",
          },
          {
            id: "ab-14",
            text: "Admin can deactivate broker — broker can no longer log in",
            expected: "On the broker profile, click 'Deactivate' (or toggle status). Confirm the action. Broker status changes to 'Inactive'. Attempt to log in as that broker — login is rejected with an appropriate message.",
            preReqs: "An active broker exists that you can deactivate.",
          },
          {
            id: "ab-15",
            text: "Deactivated broker's prospects and groups remain intact and accessible by admin",
            expected: "After deactivating a broker, navigate to their prospects and groups in the admin portal. All data is still visible and accessible. No data was deleted by the deactivation.",
            preReqs: "Broker was deactivated and had existing prospects/groups.",
          },
          {
            id: "ab-16",
            text: "Admin can reactivate broker — broker regains portal access",
            expected: "On the deactivated broker's profile, click 'Reactivate' (or toggle status back). Broker status changes to 'Active'. The broker can now log in again successfully.",
            preReqs: "A deactivated broker exists.",
          },
          {
            id: "ab-17",
            text: "Reactivated broker sees all their previous prospects and groups",
            expected: "After reactivation, log in as the broker. All previously created prospects and groups are visible in their dashboard. No data was lost during the deactivation/reactivation cycle.",
            preReqs: "Broker has been reactivated after deactivation.",
          },
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
          {
            id: "bp-1",
            text: "Broker can enter company name, employee count, industry, state, pay cycle",
            expected: "On the 'New Prospect' form, fields are present for: Company Name, Employee Count, Industry (dropdown), State (dropdown), and Pay Cycle (dropdown: weekly/bi-weekly/semi-monthly/monthly). All fields accept input.",
            preReqs: "Logged into Infinity Portal as a broker. Clicked 'New Prospect'.",
          },
          {
            id: "bp-2",
            text: "Prospect appears in broker's prospect list with status 'New'",
            expected: "After saving, navigate to the prospect list. The new prospect appears with company name, creation date, and a 'New' status badge. List is sorted with most recent first.",
            preReqs: "Just created a new prospect with valid data.",
          },
          {
            id: "bp-3",
            text: "Prospect is only visible to the broker who created it",
            expected: "Log in as a different broker. The prospect created by the first broker does NOT appear in the second broker's prospect list. Each broker only sees their own prospects.",
            preReqs: "Two broker accounts exist. One broker has created a prospect.",
          },
        ],
      },
      {
        title: "Run Fission quick estimate",
        platform: "Infinity portal",
        path: "core",
        checks: [
          {
            id: "bp-4",
            text: "Selecting 'Quick estimate' opens Fission flow with group info pre-filled",
            expected: "From the prospect detail page, click 'Quick Estimate' or 'Fission'. The Fission flow opens with the company name, employee count, state, and pay cycle pre-filled from the prospect data.",
            preReqs: "A prospect has been created. On the prospect detail page.",
          },
          {
            id: "bp-5",
            text: "Loading screen shows progress animation with company name",
            expected: "After initiating the estimate, a loading screen appears with an animated progress indicator and the company name displayed (e.g., 'Generating estimate for Acme Corp...').",
            preReqs: "Clicked 'Generate' or 'Run Estimate' in the Fission flow.",
          },
          {
            id: "bp-6",
            text: "Proposal output renders with simulated employee profiles",
            expected: "After loading completes, the proposal page displays simulated employee profiles with names, tiers, and savings amounts. The data is clearly generated/simulated, not real.",
            preReqs: "Fission estimate has completed processing.",
          },
          {
            id: "bp-7",
            text: "KPI cards, paycheck comparison, and savings breakdown display correctly",
            expected: "The proposal shows KPI summary cards (total savings, per-employee average, etc.), a paycheck comparison (before vs. after), and a detailed savings breakdown table. All numbers are formatted correctly with dollar signs and commas.",
            preReqs: "On the Fission proposal output page.",
          },
          {
            id: "bp-8",
            text: "Proposal clearly labeled as 'Estimated' (not precise)",
            expected: "The proposal page has a visible label, badge, or banner indicating this is an 'Estimate' or 'Quick Estimate'. It does NOT say 'Precise' or 'Final'. The distinction from Fusion is clear.",
            preReqs: "On the Fission proposal output page.",
          },
        ],
      },
      {
        title: "Run Fusion precise analysis",
        platform: "Infinity portal",
        path: "core",
        checks: [
          {
            id: "bp-9",
            text: "Broker can upload .xlsx, .csv, or .pdf census file",
            expected: "The Fusion upload area accepts drag-and-drop or file picker. Supported formats (.xlsx, .csv, .pdf) are listed. Selecting a valid file shows the file name and a preview or confirmation.",
            preReqs: "On the Fusion analysis page for a prospect. Have a test census file ready.",
          },
          {
            id: "bp-10",
            text: "File detection preview shows: employee count, recognized fields, company name",
            expected: "After upload, a preview screen shows: detected employee count, list of recognized column fields (Name, SSN, Salary, etc.), and the company name. User can confirm or re-upload.",
            preReqs: "A valid census file has been uploaded.",
          },
          {
            id: "bp-11",
            text: "Proposal output uses real employee data — not simulated",
            expected: "The Fusion proposal shows actual employee names, tiers, and savings from the uploaded census. Data matches the census file contents (spot-check a few rows).",
            preReqs: "Fusion analysis has completed processing.",
          },
          {
            id: "bp-12",
            text: "Per-employee savings breakdown is accurate (within 1% of manual calc)",
            expected: "Select 2-3 employees and manually verify their savings calculation matches the expected formula. Results should be within 1% of manual calculation.",
            preReqs: "On the Fusion proposal output with real employee data.",
          },
          {
            id: "bp-13",
            text: "Employer savings totals match sum of individual employee savings",
            expected: "Sum the individual employee savings amounts. The total should match the 'Total Employer Savings' KPI card. Any discrepancy greater than rounding ($1) is a defect.",
            preReqs: "On the Fusion proposal output page.",
          },
        ],
      },
      {
        title: "Save & send proposal",
        platform: "Infinity portal",
        path: "core",
        checks: [
          {
            id: "bp-14",
            text: "Save proposal stores it under the prospect record",
            expected: "Click 'Save Proposal'. Navigate back to the prospect detail page. The saved proposal appears in a 'Proposals' section with date, type (Fission/Fusion), and status.",
            preReqs: "On a generated proposal page (Fission or Fusion).",
          },
          {
            id: "bp-15",
            text: "Download PDF renders a clean, branded document",
            expected: "Click 'Download PDF'. A PDF file downloads. Open it — it contains the proposal data with proper branding (logo, colors), formatted tables, and readable text. No layout breaks or missing data.",
            preReqs: "A proposal has been generated and saved.",
          },
          {
            id: "bp-16",
            text: "Send via email delivers proposal to entered email address",
            expected: "Click 'Send via Email'. Enter a recipient email address. Click send. The recipient receives an email with the proposal attached or linked within 5 minutes.",
            preReqs: "A proposal exists. Have an accessible email to send to.",
          },
          {
            id: "bp-17",
            text: "Broker info card at bottom shows correct name, email, phone, company",
            expected: "At the bottom of the proposal (both on-screen and in PDF), a broker info card shows the logged-in broker's name, email, phone, and agency. All values match the broker's profile.",
            preReqs: "Viewing a generated proposal.",
          },
        ],
      },
      {
        title: "Submit RFC — happy path",
        platform: "Infinity portal",
        path: "core",
        checks: [
          {
            id: "bp-18",
            text: "RFC form pre-fills plan details from the approved proposal",
            expected: "Click 'Submit RFC' from the proposal page. The RFC form opens with plan details (product line, tier structure, effective date, contribution amounts) pre-filled from the proposal data.",
            preReqs: "A saved proposal exists for this prospect.",
          },
          {
            id: "bp-19",
            text: "Submitting RFC creates a record linked to prospect + proposal + broker",
            expected: "After submitting the RFC, it appears in the RFC list. Opening the RFC shows links/references to the originating prospect, the proposal used, and the submitting broker.",
            preReqs: "RFC form filled and submitted.",
          },
          {
            id: "bp-20",
            text: "RFC status shows as 'Pending' in broker's view",
            expected: "In the broker's RFC list or prospect detail page, the submitted RFC shows with a 'Pending' status badge in yellow/amber.",
            preReqs: "RFC has been submitted.",
          },
          {
            id: "bp-21",
            text: "Admin / underwriting receives notification of new RFC within 5 minutes",
            expected: "Log into the admin portal. A notification (bell icon, email, or dashboard alert) shows a new RFC submission within 5 minutes of the broker's submission.",
            preReqs: "RFC was just submitted by a broker.",
          },
        ],
      },
      {
        title: "Fusion file rejection & errors",
        platform: "Infinity portal",
        path: "path-a",
        checks: [
          {
            id: "bp-22",
            text: "Uploading a malformed file shows clear error with specific issue identified",
            expected: "Upload a corrupt or malformed file (e.g., a renamed .txt file with .xlsx extension). An error message appears explaining the file could not be parsed, with a specific reason if possible.",
            preReqs: "On the Fusion upload page. Have a malformed test file ready.",
          },
          {
            id: "bp-23",
            text: "File missing required columns (e.g., SSN) shows 'Missing required field: SSN'",
            expected: "Upload a census file missing the SSN column. The error message specifically names the missing field: 'Missing required field: SSN'. The file is not processed.",
            preReqs: "Have a census file missing the SSN column.",
          },
          {
            id: "bp-24",
            text: "File exceeding size limit (25MB) is rejected with size error",
            expected: "Attempt to upload a file larger than 25 MB. An error appears: 'File exceeds the 25 MB size limit' or similar. The file is not uploaded.",
            preReqs: "Have a file larger than 25 MB.",
          },
          {
            id: "bp-25",
            text: "File with invalid data types (e.g., non-numeric salary) flags specific rows",
            expected: "Upload a census with text in the salary column for some rows. The error report lists the specific row numbers and fields with invalid data (e.g., 'Row 15: Salary must be numeric').",
            preReqs: "Have a census file with intentional data type errors.",
          },
          {
            id: "bp-26",
            text: "After file rejection, broker can re-upload without losing prospect data",
            expected: "After a file rejection, the upload area resets and allows a new file. The prospect data (company name, etc.) is still intact — nothing was lost from the rejection.",
            preReqs: "A file was just rejected in the Fusion flow.",
          },
        ],
      },
      {
        title: "Fission-only path (no Fusion)",
        platform: "Infinity portal",
        path: "path-b",
        checks: [
          {
            id: "bp-27",
            text: "Broker generates Fission estimate and proceeds directly to RFC without Fusion",
            expected: "After generating a Fission estimate, the broker can click 'Submit RFC' directly without running a Fusion analysis. The RFC form accepts the Fission-based proposal.",
            preReqs: "A Fission estimate has been generated for a prospect.",
          },
          {
            id: "bp-28",
            text: "Upgrade CTA to Fusion is visible but broker can skip it",
            expected: "On the Fission proposal page, a visible CTA says 'Upgrade to Precise Analysis' or similar. The broker can ignore it and proceed with 'Submit RFC' or 'Save'.",
            preReqs: "On the Fission proposal output page.",
          },
          {
            id: "bp-29",
            text: "RFC submitted from a Fission-only proposal is accepted",
            expected: "The RFC submitted from a Fission-only proposal is accepted into the system. It shows 'Pending' status just like a Fusion-based RFC.",
            preReqs: "Submitted an RFC based on a Fission estimate.",
          },
          {
            id: "bp-30",
            text: "Fission-only proposal is clearly labeled as 'Estimated' through entire lifecycle",
            expected: "At every stage — proposal view, saved proposals list, RFC detail — the Fission-based content is labeled 'Estimated' or 'Quick Estimate'. It never appears as 'Precise' or 'Final'.",
            preReqs: "A Fission-only proposal/RFC exists.",
          },
        ],
      },
      {
        title: "Fission → Fusion upgrade mid-flow",
        platform: "Infinity portal",
        path: "path-b",
        checks: [
          {
            id: "bp-31",
            text: "Broker clicks upgrade CTA on Fission proposal to switch to Fusion",
            expected: "Click the 'Upgrade to Precise Analysis' CTA on the Fission proposal. The Fusion upload flow opens with the prospect's group info already pre-filled.",
            preReqs: "On a Fission proposal output page with the upgrade CTA visible.",
          },
          {
            id: "bp-32",
            text: "Fusion upload flow opens with group info already pre-filled",
            expected: "The Fusion flow shows company name, employee count, state, and pay cycle from the prospect — no need to re-enter. Only the census file upload is needed.",
            preReqs: "Clicked the upgrade CTA from a Fission proposal.",
          },
          {
            id: "bp-33",
            text: "After Fusion proposal generates, Fission estimate is preserved (not deleted)",
            expected: "After the Fusion analysis completes, navigate back to the prospect detail. Both the Fission estimate AND the new Fusion proposal are listed in the Proposals section.",
            preReqs: "Fusion analysis completed after upgrading from Fission.",
          },
          {
            id: "bp-34",
            text: "Broker can compare Fission vs Fusion proposals side by side (if applicable) or toggle between them",
            expected: "The prospect detail page shows both proposals. The broker can open each one separately to compare numbers. If a side-by-side comparison view exists, both proposals render correctly.",
            preReqs: "Both Fission and Fusion proposals exist for the same prospect.",
          },
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
          {
            id: "pg-1",
            text: "Admin can review RFC details (plan config, group info, broker)",
            expected: "Open the pending RFC. A detail view shows: plan configuration, group/company info, broker name and contact, proposal summary, and effective dates. All data matches what the broker submitted.",
            preReqs: "A pending RFC exists. Logged into admin portal.",
          },
          {
            id: "pg-2",
            text: "Approving RFC changes its status from 'Pending' to 'Approved'",
            expected: "Click 'Approve' on the RFC detail page. Confirm the action. The RFC status badge changes from 'Pending' (yellow) to 'Approved' (green) immediately.",
            preReqs: "Viewing a pending RFC as an admin.",
          },
          {
            id: "pg-3",
            text: "Status change reflects immediately in both admin and broker portal views",
            expected: "After approval, check the RFC in both the admin portal and the broker's Infinity Portal. Both show 'Approved' status without needing to refresh.",
            preReqs: "RFC was just approved.",
          },
        ],
      },
      {
        title: "Verify prospect → group conversion",
        platform: "Admin + Infinity portal",
        path: "core",
        checks: [
          {
            id: "pg-4",
            text: "Prospect status changes to 'Active group' automatically after RFC approval",
            expected: "After RFC approval, the prospect record automatically transitions to 'Active Group' status. This happens without manual intervention — check within 1 minute of approval.",
            preReqs: "RFC was just approved for this prospect.",
          },
          {
            id: "pg-5",
            text: "Group record inherits all prospect data (company, plan, broker)",
            expected: "Open the new group record. Company name, plan configuration, broker assignment, and all other prospect data carried over correctly. No fields are blank that should have data.",
            preReqs: "Prospect has converted to active group.",
          },
          {
            id: "pg-6",
            text: "Broker sees group under 'Active groups' — no longer in prospects list",
            expected: "In the broker's Infinity Portal, the company now appears under 'Active Groups' (or equivalent section) and is removed from the 'Prospects' list.",
            preReqs: "Logged in as the broker who created the prospect.",
          },
          {
            id: "pg-7",
            text: "Broker receives confirmation notification of group activation",
            expected: "The broker receives a notification (in-portal, email, or both) confirming the group has been activated. The notification includes the group name and effective date.",
            preReqs: "Group was just activated from a prospect.",
          },
        ],
      },
      {
        title: "Census → member records",
        platform: "Admin portal",
        path: "core",
        checks: [
          {
            id: "pg-8",
            text: "Each census row creates an individual member record under the group",
            expected: "Open the group's member roster in the admin portal. Each row from the uploaded census file has a corresponding member record. Verify by comparing a few names from the census file.",
            preReqs: "Group has been activated with a census file attached.",
          },
          {
            id: "pg-9",
            text: "Member records have correct name, DOB, tier, salary, and effective date",
            expected: "Open 3-5 individual member records and compare their data against the source census file. Name, DOB, tier, salary, and effective date should all match exactly.",
            preReqs: "Member records exist under the group.",
          },
          {
            id: "pg-10",
            text: "Member count in group dashboard matches census row count",
            expected: "The group dashboard shows a member count (e.g., '47 Members'). This number matches the number of data rows in the census file (excluding header).",
            preReqs: "On the group dashboard in admin portal.",
          },
        ],
      },
      {
        title: "Employer portal provisioned",
        platform: "Client portal",
        path: "core",
        checks: [
          {
            id: "pg-11",
            text: "Employer contact can log into client portal",
            expected: "Using the employer contact's credentials (from the census or setup), log into the Client Portal. The login succeeds and the dashboard loads.",
            preReqs: "Group has been activated. Employer contact credentials are available.",
          },
          {
            id: "pg-12",
            text: "Client dashboard shows correct group name, plan, and member count",
            expected: "The Client Portal dashboard displays the company/group name, plan name, and total member count. All match the data configured during group activation.",
            preReqs: "Logged into Client Portal as the employer contact.",
          },
          {
            id: "pg-13",
            text: "Effective dates and contribution amounts match group configuration",
            expected: "The dashboard or plan details section shows the effective start date and contribution amounts (employee + employer portions). These match the RFC and plan configuration exactly.",
            preReqs: "On the Client Portal dashboard.",
          },
        ],
      },
      {
        title: "RFC denied",
        platform: "Admin + Infinity portal",
        path: "path-a",
        checks: [
          {
            id: "pg-14",
            text: "Admin can deny an RFC with a required denial reason",
            expected: "Click 'Deny' on a pending RFC. A modal or form appears requiring a denial reason (text field). The denial cannot be submitted without entering a reason.",
            preReqs: "A pending RFC exists. Logged in as admin.",
          },
          {
            id: "pg-15",
            text: "RFC status changes to 'Denied' — visible to both admin and broker",
            expected: "After denial, the RFC status changes to 'Denied' (red badge). Both admin portal and broker portal show the 'Denied' status.",
            preReqs: "Just denied an RFC with a reason.",
          },
          {
            id: "pg-16",
            text: "Broker receives notification with denial reason",
            expected: "The broker receives a notification containing the denial reason entered by the admin. The broker can read the full reason without contacting admin.",
            preReqs: "RFC was just denied.",
          },
          {
            id: "pg-17",
            text: "Prospect remains as a prospect (does NOT convert to group)",
            expected: "After RFC denial, the prospect is still in the 'Prospects' list (not in 'Active Groups'). Its status may show 'RFC Denied' but it's still a prospect, not a group.",
            preReqs: "RFC was denied for this prospect.",
          },
          {
            id: "pg-18",
            text: "Broker can revise and resubmit a new RFC from the same prospect",
            expected: "From the denied prospect, the broker can create a new proposal and submit a new RFC. The system does not block re-submission from a previously denied prospect.",
            preReqs: "A prospect with a denied RFC exists.",
          },
        ],
      },
      {
        title: "Census errors & duplicates",
        platform: "Admin portal",
        path: "path-a",
        checks: [
          {
            id: "pg-19",
            text: "Census row with missing required fields is flagged with specific error",
            expected: "Upload a census with rows missing required fields. The system identifies the specific rows and fields that are missing (e.g., 'Row 8: Missing DOB'). Invalid rows are not processed.",
            preReqs: "Have a census file with intentionally missing data.",
          },
          {
            id: "pg-20",
            text: "Duplicate members (matching name + DOB or SSN) are flagged for resolution",
            expected: "Upload a census with duplicate entries. The system detects duplicates and presents them for review, showing which rows conflict and why (matching name+DOB or SSN).",
            preReqs: "Have a census file with duplicate member entries.",
          },
          {
            id: "pg-21",
            text: "Admin can resolve duplicates: merge, skip, or override",
            expected: "For each flagged duplicate, the admin has options to: merge records, skip the duplicate row, or override (use the new data). Each option works and applies correctly.",
            preReqs: "Duplicate members were detected during census processing.",
          },
          {
            id: "pg-22",
            text: "Partially valid census processes valid rows and queues invalid rows for correction",
            expected: "A census with both valid and invalid rows processes the valid rows as member records. Invalid rows are queued in an error report for the admin to fix and re-process.",
            preReqs: "Have a census file with a mix of valid and invalid rows.",
          },
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
          {
            id: "cb-1",
            text: "CBS receives notification of new group with all plan details from admin",
            expected: "In the CBS/TPA system, a notification or queue item appears for the new group. It contains the group name, plan type, effective date, member count, and admin contact information.",
            preReqs: "A group has been activated and MSA signed. CBS/TPA system is accessible.",
          },
          {
            id: "cb-2",
            text: "Group record in CBS matches RFC: company name, plan config, effective date, broker",
            expected: "Open the group record in CBS. Compare company name, plan configuration, effective date, and broker info against the original RFC. All fields match exactly.",
            preReqs: "Group handoff has been received in CBS.",
          },
          {
            id: "cb-3",
            text: "MSA status shows as 'Signed' — CBS can proceed with implementation",
            expected: "The group record shows MSA status as 'Signed' (green indicator). Implementation actions (census processing, plan setup) are enabled — not grayed out or blocked.",
            preReqs: "On the group detail page in CBS system.",
          },
          {
            id: "cb-4",
            text: "CBS can view broker contact info for coordination questions",
            expected: "The group record includes broker contact information (name, email, phone) that CBS can use for coordination. This info is accurate and matches the broker's profile.",
            preReqs: "On the group detail page in CBS system.",
          },
        ],
      },
      {
        title: "Process final census",
        platform: "CBS/TPA system",
        path: "core",
        checks: [
          {
            id: "cb-5",
            text: "CBS receives or uploads the final census file",
            expected: "CBS can either receive the final census electronically through the system or manually upload it. The upload interface accepts the census file without errors.",
            preReqs: "Final census file is available. On the group implementation page in CBS.",
          },
          {
            id: "cb-6",
            text: "Census validates all required fields: Employee Name, State, Gross Pay, Tax Withholdings, Net Pay, DOB, SSN, Company Name, Pay Cycle",
            expected: "After upload, the system validates each required field. A validation report shows all fields were found and mapped correctly. No 'missing field' warnings for the required set.",
            preReqs: "A complete census file has been uploaded.",
          },
          {
            id: "cb-7",
            text: "Census is accepted with a confirmation receipt showing: employee count, field mapping, effective date",
            expected: "After successful validation, a confirmation screen shows: total employee count processed, field mapping summary, and the effective date. A receipt or reference number is generated.",
            preReqs: "Census file passed all validations.",
          },
          {
            id: "cb-8",
            text: "Each census row creates a member record in the system linked to the group",
            expected: "Navigate to the group's member list. Each census row has a corresponding member record. The member count matches the census row count. Records are linked to this group.",
            preReqs: "Census has been accepted and processed.",
          },
        ],
      },
      {
        title: "Census rejection & correction",
        platform: "CBS/TPA system",
        path: "path-a",
        checks: [
          {
            id: "cb-9",
            text: "Census with non-numeric salary values is rejected with row-level error detail",
            expected: "Upload a census with text in salary fields (e.g., 'TBD', 'N/A'). Error report lists each invalid row: 'Row 12: Gross Pay — expected numeric, got TBD'. Census is not processed.",
            preReqs: "Have a census file with non-numeric salary values.",
          },
          {
            id: "cb-10",
            text: "Census with invalid state codes is rejected with specific invalid values listed",
            expected: "Upload a census with invalid state codes (e.g., 'XX', 'ZZ'). Error report lists: 'Row 5: State — invalid value XX'. All invalid state codes are identified.",
            preReqs: "Have a census file with invalid state codes.",
          },
          {
            id: "cb-11",
            text: "Census missing required SSN column shows 'Missing required field: SSN'",
            expected: "Upload a census file that lacks an SSN column entirely. The error message specifically states 'Missing required field: SSN'. The file is not processed.",
            preReqs: "Have a census file without an SSN column.",
          },
          {
            id: "cb-12",
            text: "CBS can send correction request back to broker or employer with specific issues listed",
            expected: "From the error report, CBS can click 'Send Correction Request' (or similar). An email/notification is sent to the broker or employer listing the specific issues. The request is logged in the system.",
            preReqs: "A census has failed validation with errors.",
          },
          {
            id: "cb-13",
            text: "Corrected census can be re-uploaded and processes successfully",
            expected: "After receiving corrections, CBS uploads the corrected census. It passes validation, and the confirmation receipt shows all rows processed successfully.",
            preReqs: "A corrected census file is ready after the first was rejected.",
          },
        ],
      },
      {
        title: "Plan administration setup",
        platform: "CBS/TPA system",
        path: "core",
        checks: [
          {
            id: "cb-14",
            text: "Section 125 plan document is configured for the group",
            expected: "In the plan setup section, the Section 125 plan document is generated or configured for the group. The document shows the correct company name, effective date, and plan parameters.",
            preReqs: "Census has been processed. On the plan administration setup page.",
          },
          {
            id: "cb-15",
            text: "Contribution amounts match RFC plan configuration (employee + employer portions)",
            expected: "The contribution schedule shows employee and employer portions. Compare these amounts against the original RFC plan configuration — they should match exactly.",
            preReqs: "Plan administration setup is in progress.",
          },
          {
            id: "cb-16",
            text: "Pay cycle deduction schedule aligns with employer's payroll frequency",
            expected: "The deduction schedule reflects the employer's pay cycle (weekly/bi-weekly/semi-monthly/monthly). Deduction amounts are correctly calculated for the chosen frequency.",
            preReqs: "Contribution amounts have been configured.",
          },
          {
            id: "cb-17",
            text: "ACH payment routing is configured for benefit disbursements",
            expected: "ACH routing information is entered and validated. A test or verification step confirms the routing is correct. The system shows 'ACH Configured' or similar status.",
            preReqs: "On the payment/disbursement configuration page.",
          },
        ],
      },
      {
        title: "Trigger BEEP enrollment",
        platform: "CBS/TPA → BEEP",
        path: "core",
        checks: [
          {
            id: "cb-18",
            text: "CBS triggers enrollment outreach window for the group",
            expected: "CBS clicks 'Trigger Enrollment' or similar action. The system confirms the enrollment window has been opened. A start date and end date for the enrollment period are set.",
            preReqs: "Plan administration is complete. On the enrollment management page.",
          },
          {
            id: "cb-19",
            text: "BEEP receives the member list and begins outreach sequence",
            expected: "In the BEEP system or CBS status view, the member list shows as 'Sent to BEEP'. Outreach status begins updating (e.g., 'Queued', then 'Sending').",
            preReqs: "Enrollment outreach has been triggered.",
          },
          {
            id: "cb-20",
            text: "CBS can verify BEEP delivery status (sent, delivered, opened) per member",
            expected: "A delivery status report is available showing per-member outreach status: Sent, Delivered, Opened, Clicked, Enrolled. Statuses update in near real-time.",
            preReqs: "BEEP outreach has been initiated.",
          },
          {
            id: "cb-21",
            text: "Enrollment window start and end dates are correctly enforced",
            expected: "The enrollment window shows the configured start and end dates. Before the start date, members cannot enroll. After the end date, the enrollment link shows 'Enrollment Closed'.",
            preReqs: "Enrollment window has been configured with specific dates.",
          },
        ],
      },
      {
        title: "Member changes & terminations",
        platform: "CBS/TPA system",
        path: "path-c",
        checks: [
          {
            id: "cb-22",
            text: "CBS can add a new member mid-cycle (new hire) with correct effective date",
            expected: "Click 'Add Member' in the group roster. Enter new hire details. The system accepts the addition with the correct mid-cycle effective date. The member appears in the roster.",
            preReqs: "An active group exists with processed members.",
          },
          {
            id: "cb-23",
            text: "CBS can terminate a member — member status changes to 'Terminated'",
            expected: "Select a member and click 'Terminate'. Enter a termination date and reason. The member's status changes to 'Terminated' with the specified date. They remain in the roster but are flagged.",
            preReqs: "An active member exists in the group.",
          },
          {
            id: "cb-24",
            text: "Terminated member loses app access but historical data is preserved",
            expected: "After termination, attempt to log into the SYNRGY app as the terminated member — access is denied. In the admin portal, the member's historical data (HRA, vitals, events) is still viewable.",
            preReqs: "A member has been terminated.",
          },
          {
            id: "cb-25",
            text: "Once final census is sent to vendors, no mid-cycle termination within 30 days (per policy)",
            expected: "After the final census has been sent to vendors, attempt to terminate a member within 30 days. The system should block or warn about the 30-day policy restriction.",
            preReqs: "Final census has been sent to vendors within the last 30 days.",
          },
          {
            id: "cb-26",
            text: "CBS can process a qualifying life event (marriage, birth) that changes a member's tier",
            expected: "Select a member and process a QLE (e.g., marriage → add spouse, changing tier from 'Employee Only' to 'Employee + Spouse'). The tier change is recorded with the QLE date and reason.",
            preReqs: "An active member exists. QLE documentation is available.",
          },
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
          {
            id: "ep-1",
            text: "Employer can log in with valid credentials",
            expected: "Enter the employer/HR representative's credentials on the Client Portal login page. The dashboard loads successfully with the company name displayed in the header.",
            preReqs: "Employer credentials have been provisioned. Client Portal is accessible.",
          },
          {
            id: "ep-2",
            text: "Dashboard shows correct company name, plan name, and enrollment period",
            expected: "The dashboard header or summary section displays: company name, plan name (e.g., 'SYNRGY Health'), and the enrollment period dates. All match the configured group data.",
            preReqs: "Logged into Client Portal.",
          },
          {
            id: "ep-3",
            text: "Summary metrics visible: total enrolled, total activated, total pending, total opted-out",
            expected: "The dashboard shows summary cards or metrics for: Total Enrolled, Total Activated (app downloaded + active), Total Pending (invited but not enrolled), and Total Opted-Out. Numbers sum to total member count.",
            preReqs: "On the Client Portal dashboard.",
          },
        ],
      },
      {
        title: "Employee roster",
        platform: "Client portal",
        path: "core",
        checks: [
          {
            id: "ep-4",
            text: "Roster shows all employees in the group with enrollment status",
            expected: "The employee roster table lists all employees in the group. Each row shows the employee name and their enrollment status (Enrolled, Pending, Opted-Out, etc.).",
            preReqs: "On the Client Portal, navigated to Employee Roster section.",
          },
          {
            id: "ep-5",
            text: "Each row shows: name, enrollment status, activation date",
            expected: "Each roster row contains at minimum: employee name, current enrollment status, and activation date (if activated). Date format is readable (e.g., 'Mar 15, 2026').",
            preReqs: "Viewing the employee roster.",
          },
          {
            id: "ep-6",
            text: "No individual PHI or health data is visible anywhere on the roster (COMPLIANCE)",
            expected: "Carefully review the entire roster page. NO health data (diagnoses, vitals, HRA results, medications, visit history) is visible for any individual employee. Only enrollment/activation status is shown.",
            preReqs: "Viewing the employee roster.",
          },
          {
            id: "ep-7",
            text: "Roster supports filtering by department or location if applicable",
            expected: "If the roster has department or location data, filter dropdowns or search fields allow narrowing the list. Filtering works correctly and resets properly.",
            preReqs: "Viewing the employee roster with multiple departments/locations.",
          },
        ],
      },
      {
        title: "Utilization reporting",
        platform: "Client portal",
        path: "core",
        checks: [
          {
            id: "ep-8",
            text: "Aggregated utilization report shows: virtual care visits, HRA completions, screening completions, Rx savings usage",
            expected: "The utilization report displays aggregate numbers for: total virtual care visits, total HRA completions, total screening completions, and Rx savings usage. All data is presented as totals or percentages, not per-individual.",
            preReqs: "Navigate to the Utilization or Reports section of Client Portal.",
          },
          {
            id: "ep-9",
            text: "All data is aggregated — no individual member data exposed (COMPLIANCE)",
            expected: "Review every data point on the utilization report. ALL data is aggregated (totals, averages, percentages). No individual member names are associated with specific health actions.",
            preReqs: "Viewing the utilization report.",
          },
          {
            id: "ep-10",
            text: "Reports can be filtered by date range",
            expected: "Date range picker or dropdowns allow filtering the report to a specific period (e.g., last month, last quarter, custom range). Data updates to reflect only the selected period.",
            preReqs: "On the utilization report page.",
          },
        ],
      },
      {
        title: "Payroll confirmation",
        platform: "Client portal",
        path: "core",
        checks: [
          {
            id: "ep-11",
            text: "Section 125 deduction summary is visible with per-employee monthly amount",
            expected: "A payroll/deductions section shows the Section 125 deduction summary. Per-employee monthly deduction amount is displayed. The amount matches the plan configuration.",
            preReqs: "Navigate to the Payroll or Deductions section of Client Portal.",
          },
          {
            id: "ep-12",
            text: "Monthly benefit payment processing status is shown",
            expected: "A payment status indicator shows whether the current month's benefit payment has been: Pending, Processing, Completed, or Failed. The status is current.",
            preReqs: "Viewing the payroll/deductions section.",
          },
          {
            id: "ep-13",
            text: "Any payroll integration errors are flagged and visible",
            expected: "If there are payroll integration errors (mismatched amounts, failed ACH, etc.), they are displayed with clear error messages. If no errors exist, the section shows a clean status.",
            preReqs: "Viewing the payroll/deductions section.",
          },
          {
            id: "ep-14",
            text: "Employer administration fee is correctly calculated and displayed",
            expected: "The administration fee is shown as a line item with the correct amount per the plan agreement. The calculation (per-member rate × member count) is verifiable.",
            preReqs: "Viewing the payroll/deductions section.",
          },
        ],
      },
      {
        title: "Employer with restricted access",
        platform: "Client portal",
        path: "path-c",
        checks: [
          {
            id: "ep-15",
            text: "Employer cannot access other groups' data",
            expected: "Attempt to navigate to another group's URL or modify the group ID in the URL. The system returns an access denied error or redirects to the employer's own dashboard. No other group data is visible.",
            preReqs: "Logged in as an employer with access to one group.",
          },
          {
            id: "ep-16",
            text: "Employer cannot modify employee records directly (read-only)",
            expected: "On the employee roster, there are no 'Edit', 'Delete', or 'Modify' buttons for individual records. Attempting to POST/PUT via browser dev tools returns a 403 error.",
            preReqs: "Viewing the employee roster as employer.",
          },
          {
            id: "ep-17",
            text: "Employer cannot view, download, or export individual health data",
            expected: "Check all export/download options. No option exports individual health data. Any CSV/PDF export contains only enrollment status and aggregate data, not individual PHI.",
            preReqs: "On any report or roster page with download options.",
          },
          {
            id: "ep-18",
            text: "Session timeout enforced after inactivity period",
            expected: "Leave the Client Portal idle for the configured timeout period (typically 15-30 minutes). After the timeout, the session expires and the user is redirected to the login page or shown a timeout message.",
            preReqs: "Logged into Client Portal. Note the time and wait for the timeout period.",
          },
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
          {
            id: "me-1",
            text: "Member receives SMS and/or email with enrollment link",
            expected: "Check the member's phone and email. An SMS and/or email has been received containing an enrollment link. The message includes the company name and a brief description of the benefit.",
            preReqs: "BEEP enrollment has been triggered for this member's group.",
          },
          {
            id: "me-2",
            text: "Message delivered within the configured send window",
            expected: "The message timestamp falls within the configured outreach send window (e.g., 9 AM - 6 PM local time). Messages are NOT sent outside business hours.",
            preReqs: "Outreach was triggered. Check message delivery timestamps.",
          },
          {
            id: "me-3",
            text: "Link opens enrollment landing page (not broken or expired)",
            expected: "Tap/click the enrollment link. It opens a web page (not a 404 or error). The landing page loads with the company branding and enrollment instructions.",
            preReqs: "SMS or email with enrollment link received.",
          },
        ],
      },
      {
        title: "Complete enrollment — happy path",
        platform: "BEEP landing page",
        path: "core",
        checks: [
          {
            id: "me-4",
            text: "Landing page shows correct company name, plan details, and branding",
            expected: "The enrollment landing page displays: the company/group name, the plan name (e.g., 'SYNRGY Health'), and appropriate branding (logo, colors). All text is accurate.",
            preReqs: "On the BEEP enrollment landing page via the link.",
          },
          {
            id: "me-5",
            text: "Identity verification works: correct name + DOB + last 4 SSN grants access",
            expected: "Enter the member's correct name, DOB, and last 4 digits of SSN. The verification succeeds and the enrollment form opens. Incorrect info would be rejected.",
            preReqs: "On the enrollment landing page. Have the member's verification info.",
          },
          {
            id: "me-6",
            text: "Completing enrollment changes member status from 'Invited' to 'Enrolled'",
            expected: "After completing the enrollment form and confirming, check the member's status in the admin portal or BEEP dashboard. Status has changed from 'Invited' to 'Enrolled'.",
            preReqs: "Identity verified, enrollment form completed.",
          },
          {
            id: "me-7",
            text: "Member receives app download instructions and welcome message",
            expected: "After enrollment, the member receives an SMS/email with a link to download the SYNRGY app (App Store / Google Play) and a welcome message explaining next steps.",
            preReqs: "Enrollment was just completed.",
          },
        ],
      },
      {
        title: "Enrollment failure & retry",
        platform: "BEEP landing page",
        path: "path-a",
        checks: [
          {
            id: "me-8",
            text: "Incorrect identity info (wrong DOB or SSN) shows error and allows retry",
            expected: "Enter incorrect DOB or last-4 SSN. An error message appears: 'The information you entered does not match our records. Please try again.' The form allows another attempt.",
            preReqs: "On the enrollment verification page.",
          },
          {
            id: "me-9",
            text: "After 3 failed attempts, member is locked out with support contact info",
            expected: "After 3 consecutive failed verification attempts, the page displays a lockout message with support contact information (phone number and/or email). Further attempts are blocked.",
            preReqs: "Failed verification 3 times in a row.",
          },
          {
            id: "me-10",
            text: "Enrollment link that has expired shows 'Enrollment closed' message",
            expected: "Use an enrollment link after the enrollment window has ended. The page shows 'Enrollment Closed' or 'This enrollment period has ended' — not a generic error. Support contact info may be shown.",
            preReqs: "Have an enrollment link from an expired enrollment window.",
          },
          {
            id: "me-11",
            text: "Expired link does not allow late enrollment",
            expected: "On the expired enrollment page, there is no way to proceed with enrollment. No forms, no submit buttons, no workarounds. The enrollment is definitively closed.",
            preReqs: "On an expired enrollment page.",
          },
        ],
      },
      {
        title: "Follow-up & reminder logic",
        platform: "SMS + email",
        path: "core",
        checks: [
          {
            id: "me-12",
            text: "Non-responders receive reminder at configured interval (e.g., Day 3)",
            expected: "A member who hasn't enrolled receives a first reminder message approximately 3 days after the initial outreach (or at the configured interval). The message re-states the enrollment opportunity.",
            preReqs: "Member received initial outreach but has not enrolled. Wait for the reminder interval.",
          },
          {
            id: "me-13",
            text: "Second reminder fires at next interval (e.g., Day 7)",
            expected: "A second reminder arrives at the next configured interval (e.g., Day 7). The message may have different copy than the first reminder but still includes the enrollment link.",
            preReqs: "First reminder was sent. Member still has not enrolled.",
          },
          {
            id: "me-14",
            text: "Reminders stop immediately once member enrolls",
            expected: "After the member completes enrollment, no further reminder messages are sent. Check for 2-3 days after enrollment — no additional outreach arrives.",
            preReqs: "Member enrolled after receiving at least one reminder.",
          },
        ],
      },
      {
        title: "Opt-out flow",
        platform: "SMS + email",
        path: "path-b",
        checks: [
          {
            id: "me-15",
            text: "Member can opt out / unsubscribe from enrollment messages",
            expected: "The outreach SMS includes 'STOP' instructions. The email includes an unsubscribe link. Using either option triggers a confirmation and stops further messages.",
            preReqs: "Member has received an outreach SMS or email.",
          },
          {
            id: "me-16",
            text: "Opt-out stops ALL future BEEP outreach for that member",
            expected: "After opting out, no further BEEP messages (reminders, follow-ups) are sent to this member. Check the BEEP dashboard — member status shows opted-out.",
            preReqs: "Member has opted out of BEEP messages.",
          },
          {
            id: "me-17",
            text: "Member record is flagged as 'Opted out' in admin portal",
            expected: "In the admin portal, the member's enrollment status shows 'Opted Out'. This status is visible to admins and is correctly reflected in aggregate counts.",
            preReqs: "Member opted out. Check admin portal.",
          },
          {
            id: "me-18",
            text: "Opted-out member is NOT auto-enrolled or re-contacted in future cycles",
            expected: "In a subsequent enrollment cycle (if applicable), the opted-out member is not automatically contacted. Their opt-out preference persists across cycles.",
            preReqs: "An opted-out member exists. A new enrollment cycle has been triggered.",
          },
        ],
      },
      {
        title: "BEEP metrics tracking",
        platform: "Admin portal",
        path: "core",
        checks: [
          {
            id: "me-19",
            text: "Outreach metrics (sent, delivered, opened, clicked, enrolled) tracked per group",
            expected: "In the admin portal, navigate to BEEP analytics. The group's outreach funnel shows: messages Sent, Delivered, Opened, Clicked, and Enrolled counts. Each metric is a specific number.",
            preReqs: "BEEP outreach has been running for this group.",
          },
          {
            id: "me-20",
            text: "Admin dashboard shows accurate funnel metrics matching actual member actions",
            expected: "Compare the funnel metrics against known member actions. If you enrolled 1 member, the 'Enrolled' count should reflect that. Metrics should not be inflated or missing entries.",
            preReqs: "Some members have progressed through the enrollment funnel.",
          },
        ],
      },
    ],
  },

  // ─── NEW SCENARIO: Registration & login flows ───
  {
    "id": "registration-login",
    "persona": "Member",
    "icon": "L",
    "color": "#0C447C",
    "bg": "#E6F1FB",
    "title": "App registration & login",
    "summary": "Member registers for the first time (primary or dependent), verifies CB email, logs in, resets password, and tests AuthGate routing. Covers compliant error messaging and post-install re-authentication.",
    "steps": [
      {
        "title": "Initial entry & invalid attempt",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "rl-1",
            "text": "Attempt to register with invalid member info",
            "expected": "Tap 'Create Account' from the onboarding auth-choice screen. You land on a 'Find Your Account' search form. Entering random/invalid lastName + DOB + zip returns an error state with a 'Try Again' button. Tapping back returns to the form. All fields must be filled before the Find My Plan button is tappable.",
            "preReqs": "App freshly installed, not logged in. Reached the Sign Up flow.",
            "whereToLook": "synrgy-app/app/signup.tsx:457-507",
            "estimatedMinutes": 3
          },
          {
            "id": "rl-2",
            "text": "Verify field-level validation on Find Your Account form",
            "expected": "Leaving any required field blank prevents submission. DOB picker only accepts valid calendar dates. Zip field accepts only 5-digit numeric. Last name field accepts both cases (test with uppercase and lowercase variants of your name).",
            "preReqs": "On the 'Find Your Account' screen in Sign Up.",
            "whereToLook": "synrgy-app/app/signup.tsx:340-383",
            "estimatedMinutes": 3
          },
          {
            "id": "rl-9",
            "text": "Choose account type at start of signup wizard",
            "expected": "First step of Create Account flow shows two cards: 'I am the primary member' and 'I am a dependent'. Picking one routes you into the matching find-member flow. The other card is dismissed.",
            "preReqs": "On the first step of the Create Account wizard.",
            "whereToLook": "synrgy-app/app/signup.tsx:415-453",
            "estimatedMinutes": 2
          }
        ]
      },
      {
        "title": "Successful primary-member registration",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "rl-3",
            "text": "Register with valid primary-member test credentials",
            "expected": "After entering valid info (your actual last name, DOB 01/01/2000, ZIP 12345), the plan-confirm step appears showing your group name and last name. Tap 'This is me, continue'. You then reach 'Create Your Account' to set name, email, and password (minimum 8 characters). Eye toggle reveals/hides password. Create Account button becomes active once all fields valid.",
            "preReqs": "Test member record exists with DOB 01/01/2000, ZIP 12345, your actual last name. App is in fresh signup state.",
            "whereToLook": "synrgy-app/app/signup.tsx:614-687",
            "estimatedMinutes": 5
          },
          {
            "id": "rl-10",
            "text": "Confirm-plan step lets you back out if the plan shown is wrong",
            "expected": "On the 'This is me / Not me' confirmation, tapping 'Not me, try again' returns you to the Find Your Account search form with fields cleared.",
            "preReqs": "Just submitted a valid find-member query and the confirm step is visible.",
            "whereToLook": "synrgy-app/app/signup.tsx:473-507",
            "estimatedMinutes": 2
          },
          {
            "id": "rl-4",
            "text": "Email verification code arrives and completes within 2 minutes",
            "expected": "After creating credentials, a 6-digit code verification screen appears. The verification email arrives within 2 minutes. Entering the 6-digit code activates the Verify button. On successful verify, the app proceeds to the onboarding flow.",
            "preReqs": "Just completed Create Your Account credentials step.",
            "whereToLook": "synrgy-app/app/signup.tsx:691-737",
            "estimatedMinutes": 4
          },
          {
            "id": "rl-11",
            "text": "Resend verification code if it does not arrive",
            "expected": "On the 6-digit code screen, tapping 'Resend Code' triggers a new email. A new code arrives. The previous code is invalidated; only the most recent code works to verify.",
            "preReqs": "On the verify-CB-email screen with no code received yet.",
            "whereToLook": "synrgy-app/app/signup.tsx:728-736 (Resend button); 316 (resendMemberCode call)",
            "estimatedMinutes": 4
          },
          {
            "id": "rl-12",
            "text": "Wrong verification code shows an error and allows retry",
            "expected": "Entering an incorrect 6-digit code surfaces an error banner without consuming the screen. The user can correct the digits and tap Verify again, or request a resend.",
            "preReqs": "On the verify-CB-email screen.",
            "whereToLook": "synrgy-app/app/signup.tsx:286-310 (verifyMemberCode); 698 (error banner)",
            "estimatedMinutes": 3
          },
          {
            "id": "rl-13",
            "text": "Account-already-exists triggers automatic recovery",
            "expected": "If you sign up with an email already used on a prior incomplete signup, the app catches the 'already exists' error and silently logs you in to continue the CB-link flow. The user does not see a hard error; they progress to the find-member step (if not yet completed).",
            "preReqs": "A prior signup attempt left a Synrgy auth account without a linked CB member.",
            "whereToLook": "synrgy-app/app/signup.tsx:209-216",
            "estimatedMinutes": 4
          }
        ]
      },
      {
        "title": "Dependent signup",
        "platform": "SYNRGY app",
        "path": "path-b",
        "checks": [
          {
            "id": "rl-14",
            "text": "Dependent signup: find the primary member first",
            "expected": "Selecting 'I am a dependent' on the account-type step routes you to a Find Your Account form for the PRIMARY member (last name, DOB, ZIP). On success, the plan-confirm step shows the primary's group.",
            "preReqs": "Fresh signup, picked 'I am a dependent'.",
            "whereToLook": "synrgy-app/app/signup.tsx:159-179 (dependent flow start); 195-196 (checkForPrimary)",
            "estimatedMinutes": 3
          },
          {
            "id": "rl-15",
            "text": "Dependent details form collects firstName, lastName, DOB, gender, relationship",
            "expected": "After confirming the primary, a dependent-details form appears: First Name, Last Name, DOB picker, Gender M/F/O segmented control, Relationship spouse/child toggle. All fields required. Continue button activates when complete.",
            "preReqs": "Plan-confirmed as a dependent of a real primary member.",
            "whereToLook": "synrgy-app/app/signup.tsx:511-610",
            "estimatedMinutes": 4
          },
          {
            "id": "rl-16",
            "text": "Dependent flow completes: create credentials + verify email + land on onboarding",
            "expected": "After dependent details, the Create Your Account step appears. Following credentials creation and email verification, the app lands on the onboarding flow (same as primary).",
            "preReqs": "Just completed dependent details.",
            "whereToLook": "synrgy-app/app/signup.tsx:237-254 (verifyDependent); 286-310 (verify code)",
            "estimatedMinutes": 5
          }
        ]
      },
      {
        "title": "Verify-member (post-signup, required mode)",
        "platform": "SYNRGY app",
        "path": "path-a",
        "checks": [
          {
            "id": "rl-17",
            "text": "If signup succeeded but CB link failed, app routes to verify-member with no back button",
            "expected": "When AuthGate detects an authenticated user with no linked CB account, the app force-navigates to a verify-member screen. The header has NO back button. A 'Log Out' option is shown instead. The user must either complete CB linking or log out.",
            "preReqs": "Authenticated Synrgy account exists but CB link was not completed during signup.",
            "whereToLook": "synrgy-app/app/_layout.tsx:78-79 (AuthGate routing); synrgy-app/app/verify-member.tsx:337-348 (required mode)",
            "estimatedMinutes": 3
          },
          {
            "id": "rl-18",
            "text": "Logout from required verify-member returns to onboarding",
            "expected": "Tapping Log Out clears auth state and returns the user to the onboarding auth-choice step.",
            "preReqs": "On verify-member in required mode.",
            "whereToLook": "synrgy-app/app/verify-member.tsx:338-348",
            "estimatedMinutes": 2
          }
        ]
      },
      {
        "title": "Login flows",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "rl-5",
            "text": "Log in with valid credentials",
            "expected": "From the auth-choice step, tap Sign In. Enter email and password. On success, the app routes to the home screen (if onboarding is complete) or to the onboarding flow (if not).",
            "preReqs": "Account already created. App in fresh state or logged out.",
            "whereToLook": "synrgy-app/app/login.tsx:229-346",
            "estimatedMinutes": 3
          },
          {
            "id": "rl-6",
            "text": "Invalid credentials show a generic error",
            "expected": "Wrong email or password shows an inline error banner stating credentials are invalid. The error does NOT reveal whether the email is registered. The error message wording does not say 'no account found' or similar.",
            "preReqs": "On the login screen.",
            "whereToLook": "synrgy-app/app/login.tsx:254-257",
            "estimatedMinutes": 2
          },
          {
            "id": "rl-19",
            "text": "Re-login on a returning user skips verify-member",
            "expected": "After logging out and back in (same device), the user lands on home without seeing the verify-member screen. The Synrgy API auto-refreshes the CB token via /cb-session on every login.",
            "preReqs": "User previously completed full signup + CB link. Has logged out.",
            "whereToLook": "synrgy-app/app/_layout.tsx:78-89 (AuthGate); synrgy-app/services/auth-api.ts (cb-session)",
            "estimatedMinutes": 3
          },
          {
            "id": "rl-20",
            "text": "Language toggle on login screen switches UI language",
            "expected": "A language toggle pill is visible at the top of the login screen. Tapping it cycles through supported languages. All labeled UI elements re-render in the chosen language without app restart.",
            "preReqs": "On the login screen.",
            "whereToLook": "synrgy-app/app/login.tsx:248",
            "estimatedMinutes": 2
          }
        ]
      },
      {
        "title": "Password reset",
        "platform": "SYNRGY app",
        "path": "path-a",
        "checks": [
          {
            "id": "rl-7",
            "text": "Reset password for a valid account",
            "expected": "Tap 'Forgot password?' on login. Enter your email. Tap Send Reset Code. A 6-digit code arrives by email. Enter the code, set a new password (minimum 8 characters), tap Reset Password. A success alert appears. You can log in with the new password.",
            "preReqs": "Existing account email is accessible.",
            "whereToLook": "synrgy-app/app/login.tsx:91-223",
            "estimatedMinutes": 5
          },
          {
            "id": "rl-8",
            "text": "Password reset for unknown email handles failure gracefully",
            "expected": "Entering an email not associated with any account: observe what the app shows. Document the exact UI message. NOTE: the current code surfaces an explicit forgotPasswordError if the API throws, which may signal the email is unknown. Flag the actual behavior in the notes field so we can decide whether to fix the UX.",
            "preReqs": "On the Forgot Password email entry screen.",
            "whereToLook": "synrgy-app/app/login.tsx:53-56 (forgotPassword handler); 91-145 (UI)",
            "estimatedMinutes": 3,
            "failureGuidance": "If the app reveals the email is unknown (e.g. 'no account found' message), record verbatim in notes — this is a UX gap that needs separate fix."
          },
          {
            "id": "rl-21",
            "text": "Password reset code validation: new password must be at least 8 characters",
            "expected": "On the reset-code screen, entering a new password under 8 characters shows an inline validation hint and disables the Reset Password button.",
            "preReqs": "Entered a valid reset code, on the new-password step.",
            "whereToLook": "synrgy-app/app/login.tsx:69-85, 169",
            "estimatedMinutes": 2
          },
          {
            "id": "rl-22",
            "text": "Wrong reset code shows error and allows retry",
            "expected": "Entering a wrong 6-digit reset code surfaces resetError. The user can correct the code or re-request from the email screen.",
            "preReqs": "On the reset-code entry screen.",
            "whereToLook": "synrgy-app/app/login.tsx:62-86, 149-152",
            "estimatedMinutes": 3
          }
        ]
      }
    ]
  },

  // ─── SCENARIO 7: Member app onboarding ───
  {
    "id": "member-onboard",
    "persona": "Member",
    "icon": "O",
    "color": "#993C1D",
    "bg": "#FAECE7",
    "title": "App onboarding & HRA",
    "summary": "Member completes the onboarding flow (intro slides, video, auth, 5 permissions, income), then completes the multi-section Health Risk Assessment. Covers permission denial paths, AI Orb first interaction, and compliance language.",
    "steps": [
      {
        "title": "App install and launch",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "mo-1",
            "text": "App installs and launches without errors",
            "expected": "Install the SYNRGY app from App Store (iOS) or Google Play (Android). Tap the app icon. The splash screen appears within 3 seconds. No crash, no permission prompt before the splash, no white screen of death.",
            "preReqs": "Device has internet access and sufficient storage.",
            "whereToLook": "synrgy-app/app.json (bundle identifier, splash); synrgy-app/app/_layout.tsx (root)",
            "estimatedMinutes": 3
          }
        ]
      },
      {
        "title": "Visual conformance to v2 brand",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "mo-3",
            "text": "Background color is the warm v2 cream #F3EDE2 on all setup screens",
            "expected": "ALL setup screens (signup wizard, verify-member, onboarding intro/video) display the v2 warm cream background #F3EDE2. Use a color picker tool. The background is NOT pure white #FFFFFF and is NOT the older cream #F5EDE1.",
            "preReqs": "On any pre-home screen.",
            "whereToLook": "synrgy-app/app.json:11 (backgroundColor); synrgy-app/constants/colors.ts",
            "estimatedMinutes": 4
          },
          {
            "id": "mo-4",
            "text": "Primary CTA color is v2 teal (confirm exact hex with creative)",
            "expected": "Every primary CTA button (Sign Up, Continue, Verify, Activate) uses the v2 brand teal. Per code constants/colors.ts, primary is #0098A8. Per the brand-fork memory note, both Synrgy v2 and sister brands share #005F78. Verify with a color picker which hex the app actually renders. Record any deviation in notes.",
            "preReqs": "Navigating through any setup screen with CTA visible.",
            "whereToLook": "synrgy-app/constants/colors.ts (Colors.primary); app.json plugins/expo-notifications:color",
            "estimatedMinutes": 4,
            "failureGuidance": "If color is not in the #0098A8 / #005F78 family (e.g. orange #C95A38 from the pre-v2 palette), record verbatim and flag for design review."
          },
          {
            "id": "mo-5",
            "text": "Typography is consistent across setup screens; headlines use dark teal #005F78",
            "expected": "All headlines and section titles use the dark teal #005F78. Body text may be a darker neutral. Typography is consistent across all setup screens (no mixed system fonts). If a custom font is loaded (expo-font), it renders correctly without falling back to system fonts mid-screen.",
            "preReqs": "On setup screens.",
            "whereToLook": "synrgy-app/app.json:96 (expo-font plugin); synrgy-app/assets/fonts/; synrgy-app/constants/colors.ts",
            "estimatedMinutes": 4
          }
        ]
      },
      {
        "title": "Onboarding intro and video",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "mo-14",
            "text": "Onboarding intro renders 3 slide screens followed by 1 video screen",
            "expected": "After install, the onboarding flow shows 3 intro slides (steps 0-2) with title, subtitle, and 3 feature cards each. Then 1 video screen (step 3). Each slide is readable, no overflow, no missing imagery.",
            "preReqs": "First launch (or AsyncStorage @synrgy:onboarding_complete cleared).",
            "whereToLook": "synrgy-app/app/onboarding.tsx:291-305; synrgy-app/components/onboarding/IntroSlide.tsx; VideoScreen.tsx",
            "estimatedMinutes": 4
          },
          {
            "id": "mo-15",
            "text": "Pagination dots stay fixed at the bottom while content scrolls",
            "expected": "While swiping through onboarding screens, the pagination dots remain fixed in position at the bottom. The active dot updates to reflect the current screen.",
            "preReqs": "On the onboarding intro screens.",
            "whereToLook": "synrgy-app/components/onboarding/ProgressDots.tsx",
            "estimatedMinutes": 2
          },
          {
            "id": "mo-33",
            "text": "Onboarding video plays from Mux HLS source",
            "expected": "On the video step, a play overlay is visible. Tapping it streams the video from the Mux HLS source. Video plays in-line. After play completes, the Continue button is active.",
            "preReqs": "On the onboarding video step.",
            "whereToLook": "synrgy-app/components/onboarding/VideoScreen.tsx:39-84 (URL: stream.mux.com/1AmlO8pozv6ezYQeRaoc7fFHFJDqhNKrWjNLuIWWTq00.m3u8)",
            "estimatedMinutes": 3
          },
          {
            "id": "mo-34",
            "text": "Skip on video shows a reminder the first time, then allows skip",
            "expected": "Tapping Skip on the video step (without having played the video) surfaces a reminder text 'Consider watching the intro video' or similar. Tapping Skip a second time allows the user to proceed without watching.",
            "preReqs": "On the onboarding video step.",
            "whereToLook": "synrgy-app/components/onboarding/VideoScreen.tsx:40-44, 81-84",
            "estimatedMinutes": 3
          },
          {
            "id": "mo-16",
            "text": "AI Orb appears as a dimensional teal radial gradient sphere",
            "expected": "On the carousel screen that introduces the AI Orb (or on the home screen post-onboarding), the Orb renders as a dimensional/3D-looking sphere with a radial teal gradient. It is NOT flat, NOT purple, NOT red, NOT a plain circle.",
            "preReqs": "On the carousel screen with the Orb illustration or on home screen post-onboarding.",
            "whereToLook": "synrgy-app/components/Orb.tsx:194-203 (radial gradient SVG)",
            "estimatedMinutes": 3
          }
        ]
      },
      {
        "title": "Auth choice from onboarding",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "mo-35",
            "text": "Auth-choice step offers Sign In and Create Account paths",
            "expected": "On step 4 of onboarding, two cards are visible: Sign In (LogIn icon) → routes to /login; Create Account (UserPlus icon) → routes to /signup. Tapping back returns to the onboarding video step.",
            "preReqs": "Onboarding has reached step 4 (auth choice).",
            "whereToLook": "synrgy-app/components/onboarding/AuthChoice.tsx:19-41",
            "estimatedMinutes": 2
          }
        ]
      },
      {
        "title": "Permission flow — 5 permissions in fixed order",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "mo-36",
            "text": "Permission explainer step lists all 5 upcoming permissions",
            "expected": "Step 5 of onboarding (post-auth) shows the Permission Explainer screen. It lists each upcoming permission (Health, Microphone, Camera, Notifications, Location) with an icon and one-line description. A Next button advances to the first permission request.",
            "preReqs": "Just authenticated for the first time. On step 5.",
            "whereToLook": "synrgy-app/components/onboarding/PermissionExplainer.tsx:27-54",
            "estimatedMinutes": 3
          },
          {
            "id": "mo-6",
            "text": "Permission prompts fire in fixed order: Health → Microphone → Camera → Notifications → Location",
            "expected": "After the explainer, the OS permission prompts appear ONE AT A TIME in this exact order: (1) Health/Sahha, (2) Microphone, (3) Camera, (4) Notifications, (5) Location. Each is its own PermissionScreen inside the app, with a Continue Without (skip) button. Web platform excludes Health.",
            "preReqs": "Tapped Next on the Permission Explainer.",
            "whereToLook": "synrgy-app/app/onboarding.tsx:175-216 (handlers); 326-337 (loop); 102 (web filter)",
            "estimatedMinutes": 5
          },
          {
            "id": "mo-7",
            "text": "Granting all 5 permissions proceeds to the income step",
            "expected": "Granting all permissions in turn advances onboarding to the Income & Household step (step 11). No errors, no repeated prompts.",
            "preReqs": "On the first permission screen, ready to allow all.",
            "whereToLook": "synrgy-app/app/onboarding.tsx:326-337",
            "estimatedMinutes": 5
          },
          {
            "id": "mo-37",
            "text": "Permission denial modal shows OS-appropriate buttons",
            "expected": "Denying any permission triggers a denial modal. On iOS, the modal shows 'Open Settings' and 'Continue Without'. On Android, it shows 'Try Again' and 'Continue Without'. Modal is dismissable.",
            "preReqs": "On any permission screen, deny once.",
            "whereToLook": "synrgy-app/components/onboarding/PermissionScreen.tsx:173-205",
            "estimatedMinutes": 4
          },
          {
            "id": "mo-38",
            "text": "Second-time denial auto-advances without showing the modal again",
            "expected": "If a permission has already been denied once and the modal dismissed, denying it again silently advances to the next permission screen.",
            "preReqs": "Already denied a permission once on the current onboarding pass.",
            "whereToLook": "synrgy-app/components/onboarding/PermissionScreen.tsx:48-77",
            "estimatedMinutes": 3
          },
          {
            "id": "mo-39",
            "text": "Each permission screen has a Continue Without / Skip option",
            "expected": "Every PermissionScreen has a tappable Skip / Continue Without link visible at the bottom. Tapping it advances to the next permission without granting.",
            "preReqs": "On any permission screen.",
            "whereToLook": "synrgy-app/components/onboarding/PermissionScreen.tsx:167-169",
            "estimatedMinutes": 2
          },
          {
            "id": "mo-40",
            "text": "Granting Notifications enables default push types",
            "expected": "Granting Notifications triggers the app to register the Expo push token with the CB API and enable the default push types 'visitReminder' and 'videoReminder'. Other push types are off by default. Verify in Notification Settings post-onboarding.",
            "preReqs": "Notifications permission granted during onboarding.",
            "whereToLook": "synrgy-app/app/onboarding.tsx:195-212; synrgy-app/constants/onboarding.ts (DEFAULT_ENABLED_TYPES)",
            "estimatedMinutes": 4
          }
        ]
      },
      {
        "title": "Permission denial paths",
        "platform": "SYNRGY app",
        "path": "path-b",
        "checks": [
          {
            "id": "mo-9",
            "text": "Denying location: app continues; pharmacy locator falls back to default region",
            "expected": "Deny the Location prompt. Onboarding continues to the next step. Later, opening Pharmacy Locator centers the map on the default region (Charleston SC area) without an explicit error message. Manual zip entry still works.",
            "preReqs": "On the Location permission prompt.",
            "whereToLook": "synrgy-app/app/onboarding.tsx:214-216; synrgy-app/app/pharmacy-locator.tsx:45-72",
            "estimatedMinutes": 4
          },
          {
            "id": "mo-10",
            "text": "Denying Health (Sahha): app continues; vitals dashboard chip stays empty",
            "expected": "Deny the Health permission. Onboarding continues. The Sahha SDK is not authenticated. Background health sync to CleverHealth does not occur. Foreground face-scan still works (different SDK). Useful Guidance based on Sahha events does not populate.",
            "preReqs": "On the Health permission prompt.",
            "whereToLook": "synrgy-app/app/onboarding.tsx:175-185",
            "estimatedMinutes": 4
          },
          {
            "id": "mo-11",
            "text": "Denying Notifications: app continues; no push delivered",
            "expected": "Deny the Notifications permission. Onboarding continues. Later, no push notifications arrive from SYNRGY. In-app features continue normally.",
            "preReqs": "On the Notifications permission prompt.",
            "whereToLook": "synrgy-app/app/onboarding.tsx:195-212",
            "estimatedMinutes": 4
          },
          {
            "id": "mo-41",
            "text": "Denying microphone: voice on home screen does not work but app does not crash",
            "expected": "Deny the Microphone permission. Onboarding continues. On the home screen, tapping the Orb to initiate a voice session shows an in-app prompt that microphone access is needed. The app does not crash.",
            "preReqs": "On the Microphone permission prompt.",
            "whereToLook": "synrgy-app/app/onboarding.tsx:187-189; synrgy-app/app/index.tsx (voice handler)",
            "estimatedMinutes": 3
          },
          {
            "id": "mo-42",
            "text": "Denying camera: face vitals scan and VUC video unavailable",
            "expected": "Deny the Camera permission. Onboarding continues. Tapping Start Scan on /vitals-scan or starting a VUC session prompts again for camera access via the OS. If denied permanently, the app does not crash and offers a path back.",
            "preReqs": "On the Camera permission prompt.",
            "whereToLook": "synrgy-app/app/onboarding.tsx:191-193; synrgy-app/app/vitals-scanner.native.tsx",
            "estimatedMinutes": 4
          }
        ]
      },
      {
        "title": "Permission persistence",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "mo-8",
            "text": "Granted permissions persist across app force-close and relaunch",
            "expected": "Grant all permissions, force-close the app, relaunch. The app does NOT re-prompt for permissions. Device Settings still shows them granted.",
            "preReqs": "All permissions granted in onboarding.",
            "whereToLook": "synrgy-app/app/_layout.tsx (Sahha config on launch); OS persistence",
            "estimatedMinutes": 4
          },
          {
            "id": "mo-12",
            "text": "Member can re-enable previously denied permissions in device settings",
            "expected": "Go to device Settings → SYNRGY → toggle a previously denied permission on. Return to the app. The associated feature is now usable without an app restart.",
            "preReqs": "A permission was denied during onboarding.",
            "whereToLook": "OS behavior; synrgy-app/app/onboarding.tsx (no special re-entry handling)",
            "estimatedMinutes": 3
          },
          {
            "id": "mo-13",
            "text": "Re-enabling a permission activates the associated feature without restart",
            "expected": "Within the same app session, toggle a permission on in Settings and return to the app. Use the related feature (open Pharmacy Locator, start a face scan, etc.). The feature works without needing to restart the app.",
            "preReqs": "Just re-enabled a previously denied permission in device settings.",
            "whereToLook": "OS reactive permission model",
            "estimatedMinutes": 3
          }
        ]
      },
      {
        "title": "Income, household, and final welcome",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "mo-43",
            "text": "Income & household step accepts entry and submits to CB",
            "expected": "On step 11, enter an annual income amount (auto-formatted with commas) and select household size (picker overlay 1-9+). Tap Continue. Onboarding advances to the final welcome step. Backend records the values via updateHouseholdData.",
            "preReqs": "Just completed the permissions flow.",
            "whereToLook": "synrgy-app/app/onboarding.tsx:228-245, 341-413, 444-455",
            "estimatedMinutes": 4
          },
          {
            "id": "mo-44",
            "text": "Income & household step is skippable",
            "expected": "On step 11, tap Skip. Onboarding advances to the final welcome without submitting income or household data.",
            "preReqs": "On the Income & Household step.",
            "whereToLook": "synrgy-app/app/onboarding.tsx:444-455",
            "estimatedMinutes": 2
          },
          {
            "id": "mo-45",
            "text": "Final welcome auto-completes after ~2.5 seconds",
            "expected": "The final welcome screen shows an animated checkmark, a personalized title with your first name, and a loading dots animation. It auto-completes after roughly 2.5 seconds, routing to the home screen. The user does not need to tap anything.",
            "preReqs": "Just completed (or skipped) the income step.",
            "whereToLook": "synrgy-app/components/onboarding/FinalWelcome.tsx:40-64",
            "estimatedMinutes": 3
          },
          {
            "id": "mo-46",
            "text": "Returning users skip the entire onboarding flow",
            "expected": "After a user completes onboarding once and logs out, then logs back in on the same device, the app routes directly to the home screen. Onboarding video, slides, and permissions do not replay.",
            "preReqs": "User has previously completed onboarding (AsyncStorage @synrgy:onboarding_complete is true).",
            "whereToLook": "synrgy-app/app/onboarding.tsx:112-118; synrgy-app/app/_layout.tsx",
            "estimatedMinutes": 3
          }
        ]
      },
      {
        "title": "HRA list and intro",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "mo-20",
            "text": "Home screen surfaces an HRA action card if no assessments are completed",
            "expected": "After completing onboarding, the home screen shows an action card prompting completion of the Health Risk Assessment. Tapping the card navigates to /hra.",
            "preReqs": "First-time member with no completed assessments.",
            "whereToLook": "synrgy-app/app/index.tsx:198-212",
            "estimatedMinutes": 3
          },
          {
            "id": "mo-21",
            "text": "HRA list shows intro stats, in-progress, and past assessments",
            "expected": "On /hra, the screen shows an intro card with: total assessments count, completed count, and approximate duration (~10 minutes). Below: 'Resume' section listing in-progress assessments with their start date; 'Past Assessments' section listing finished assessments most-recent-first.",
            "preReqs": "On the HRA list screen.",
            "whereToLook": "synrgy-app/app/hra.tsx:110-167, 195-242",
            "estimatedMinutes": 4
          },
          {
            "id": "mo-26",
            "text": "Member can dismiss the HRA action card and proceed to other features",
            "expected": "On the home screen, the HRA action card has a dismiss button. Tapping it removes the card without breaking the home screen. Other features remain accessible.",
            "preReqs": "On the home screen with HRA card visible.",
            "whereToLook": "synrgy-app/app/index.tsx:406-412 (per-card dismiss)",
            "estimatedMinutes": 2
          },
          {
            "id": "mo-27",
            "text": "HRA remains accessible from the service menu after dismissing the card",
            "expected": "After dismissing the action card, open the service menu (grid or list overlay on home). The HRA service tile is still visible and tappable, routing to /hra.",
            "preReqs": "HRA action card dismissed.",
            "whereToLook": "synrgy-app/app/index.tsx:627-655; synrgy-app/constants/services.ts (health-risk-assessment service)",
            "estimatedMinutes": 2
          },
          {
            "id": "mo-28",
            "text": "Member can complete HRA at any point post-onboarding",
            "expected": "Open /hra, tap Start New HRA. The wizard launches and can be completed in one session. Results screen appears upon finish.",
            "preReqs": "On the HRA list screen, no in-progress assessment.",
            "whereToLook": "synrgy-app/app/hra.tsx:48-54; synrgy-app/app/hra-wizard.tsx",
            "estimatedMinutes": 12
          }
        ]
      },
      {
        "title": "HRA wizard — section progress and validation",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "mo-22",
            "text": "HRA wizard presents questions section-by-section with a progress bar",
            "expected": "Inside the wizard, questions are grouped into sections. A progress bar animates and shows the section name plus 'current / total' indicator. Tapping Next validates the current section and advances; Back returns one section (disabled on section 1).",
            "preReqs": "Inside /hra-wizard.",
            "whereToLook": "synrgy-app/app/hra-wizard.tsx:187-190, 392-398, 443, 458-460",
            "estimatedMinutes": 5
          },
          {
            "id": "mo-47",
            "text": "Number question enforces min/max bounds and NaN check",
            "expected": "A number question with defined bounds (e.g., systolic BP) shows a range hint. Entering a value outside the bounds or non-numeric input shows an inline error and blocks Next.",
            "preReqs": "On a section containing a number question.",
            "whereToLook": "synrgy-app/app/hra-wizard.tsx:228-243; synrgy-app/components/hra/NumberQuestion.tsx",
            "estimatedMinutes": 3
          },
          {
            "id": "mo-48",
            "text": "Date question enforces MM/DD/YYYY format and rejects future dates",
            "expected": "A date question accepts MM/DD/YYYY. Invalid calendar dates (Feb 30), years <1900, or future dates are rejected with inline error.",
            "preReqs": "On a section containing a date question.",
            "whereToLook": "synrgy-app/app/hra-wizard.tsx:255-277; synrgy-app/components/hra/DateQuestion.tsx",
            "estimatedMinutes": 3
          },
          {
            "id": "mo-49",
            "text": "Multi-select question requires at least one option when required",
            "expected": "A required multi-select question shows the hint 'Select all that apply'. Submitting with no selection blocks Next with an error.",
            "preReqs": "On a section containing a required multi-select question.",
            "whereToLook": "synrgy-app/app/hra-wizard.tsx:284-287; synrgy-app/components/hra/MultiSelectQuestion.tsx",
            "estimatedMinutes": 3
          },
          {
            "id": "mo-50",
            "text": "Don't-know option is always valid when offered",
            "expected": "Questions with allowDontKnow=true show a 'Don't know' button below the input. Selecting it counts as a valid response regardless of other input, and Next advances.",
            "preReqs": "On a question with the Don't know option visible.",
            "whereToLook": "synrgy-app/components/hra/QuestionRenderer.tsx:95-103; synrgy-app/app/hra-wizard.tsx:213",
            "estimatedMinutes": 3
          },
          {
            "id": "mo-51",
            "text": "Age question auto-fills from member DOB when first encountered",
            "expected": "The HRA section containing an age question (number type, text contains 'age') is pre-filled with the user's age calculated from member DOB on profile. The user can override.",
            "preReqs": "First time encountering the age question for this assessment.",
            "whereToLook": "synrgy-app/app/hra-wizard.tsx:135-156",
            "estimatedMinutes": 3
          },
          {
            "id": "mo-52",
            "text": "Suggestion autocomplete debounces input by ~300ms",
            "expected": "On a text question with suggestionsCategory (e.g., medication name), typing triggers an autocomplete dropdown. Suggestions appear after a brief pause (about 300 milliseconds). Tapping a suggestion fills the field.",
            "preReqs": "On a question with suggestionsCategory set.",
            "whereToLook": "synrgy-app/components/hra/SuggestionInput.tsx:44-57",
            "estimatedMinutes": 3
          }
        ]
      },
      {
        "title": "HRA wizard — abandon and resume",
        "platform": "SYNRGY app",
        "path": "path-c",
        "checks": [
          {
            "id": "mo-53",
            "text": "Exit mid-wizard prompts with Continue / Exit, does not auto-submit",
            "expected": "Tap the Exit button (X) mid-section. An alert appears with 'Continue Assessment' (cancel) and 'Exit' options. Tapping Exit returns to the HRA list without submitting the current section. The assessment status is unchanged on the server.",
            "preReqs": "Inside hra-wizard mid-section.",
            "whereToLook": "synrgy-app/app/hra-wizard.tsx:400-405",
            "estimatedMinutes": 3
          },
          {
            "id": "mo-54",
            "text": "Resume in-progress HRA returns to the correct section",
            "expected": "From the HRA list Resume section, tap an in-progress assessment. The wizard loads the user's actual current section (not always section 1) and pre-fills any answers already submitted in earlier sections.",
            "preReqs": "An in-progress HRA exists for this member.",
            "whereToLook": "synrgy-app/app/hra-wizard.tsx:112-119, 128-132",
            "estimatedMinutes": 4
          },
          {
            "id": "mo-23",
            "text": "After the final section submission, the user lands on results",
            "expected": "After submitting the final HRA section, the wizard fades and routes to /hra-results with the assessmentId. No long stall: navigation should occur within a couple of seconds.",
            "preReqs": "Just submitted the final HRA section.",
            "whereToLook": "synrgy-app/app/hra-wizard.tsx:362-370",
            "estimatedMinutes": 3
          }
        ]
      },
      {
        "title": "HRA results",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "mo-24",
            "text": "Results screen shows wellness score, color-coded by band",
            "expected": "The results screen displays a wellness score in a circular badge. Color: green 80+, orange 60-79 or 40-59, red <40. Completion date is shown in long form.",
            "preReqs": "Just completed an HRA.",
            "whereToLook": "synrgy-app/app/hra-results.tsx:60-71, 201-222",
            "estimatedMinutes": 3
          },
          {
            "id": "mo-55",
            "text": "Results show derived metrics (BMI, hypertension category, pack years) when applicable",
            "expected": "If the assessment captured the inputs, the results screen displays BMI value+category, hypertension category+description, and pack-years value+classification. If inputs were not captured, the section is absent.",
            "preReqs": "Just completed an HRA with relevant inputs.",
            "whereToLook": "synrgy-app/app/hra-results.tsx:228-266",
            "estimatedMinutes": 3
          },
          {
            "id": "mo-56",
            "text": "Risk flags appear with severity badge",
            "expected": "If any risk flags were generated, they appear as cards with a severity badge (low green, moderate orange, high dark-orange, critical red) and a brief description.",
            "preReqs": "Just completed an HRA that generated risk flags.",
            "whereToLook": "synrgy-app/app/hra-results.tsx:34-44, 269-296",
            "estimatedMinutes": 3
          },
          {
            "id": "mo-57",
            "text": "Cardiovascular section shows 10-year CV risk, vascular age, diabetes risk",
            "expected": "When CV inputs were captured, the results screen shows 10-year cardiovascular risk percentage, vascular age in years, and diabetes risk percentage in a grid.",
            "preReqs": "Just completed an HRA with CV inputs.",
            "whereToLook": "synrgy-app/app/hra-results.tsx:299-331",
            "estimatedMinutes": 3
          },
          {
            "id": "mo-58",
            "text": "Recommended labs and screenings are listed with reason and frequency",
            "expected": "When the engine recommends labs or screenings, each appears with name, reason for recommendation, and (for screenings) a frequency.",
            "preReqs": "Just completed an HRA where recommendations were generated.",
            "whereToLook": "synrgy-app/app/hra-results.tsx:334-382",
            "estimatedMinutes": 3
          }
        ]
      },
      {
        "title": "Compliance copy across onboarding and HRA",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "mo-18",
            "text": "All carousel and HRA copy uses compliant insured-event language",
            "expected": "Read every screen of the onboarding carousel, the HRA intro, and the results page. Any reference to coverage events uses compliant phrasing like 'may correspond to insured events' or similar. Record exact phrasing in notes.",
            "preReqs": "General observation across onboarding + HRA flows.",
            "whereToLook": "synrgy-app/components/onboarding/IntroSlide.tsx; synrgy-app/app/hra-results.tsx",
            "estimatedMinutes": 5
          },
          {
            "id": "mo-19",
            "text": "No occurrence of 'qualify for benefits', 'earn benefits', 'rewards', 'credits', 'points'",
            "expected": "Read every onboarding and HRA screen. None of the prohibited phrases appear anywhere. Flag any occurrence verbatim in notes.",
            "preReqs": "General observation.",
            "whereToLook": "synrgy-app/components/onboarding/; synrgy-app/app/hra*.tsx; CLAUDE.md compliance note",
            "estimatedMinutes": 5,
            "failureGuidance": "Any occurrence of prohibited phrasing must be flagged in notes verbatim. This is a hard compliance failure for fixed indemnity product."
          }
        ]
      },
      {
        "title": "AI Orb first interaction",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "mo-30",
            "text": "First Orb interaction includes a transparency disclaimer",
            "expected": "The first time you tap the Orb after completing onboarding, the Orb identifies itself as an AI assistant in natural language. The disclaimer is delivered conversationally, not robotically, per the Responsible AI Manifesto.",
            "preReqs": "Just completed onboarding. First Orb tap of this session.",
            "whereToLook": "synrgy-app/app/index.tsx; Uptyck system prompt configuration",
            "estimatedMinutes": 3
          },
          {
            "id": "mo-31",
            "text": "Orb greeting is personalized to the member",
            "expected": "The Orb greets the user by first name and references the user's specific plan or company. The greeting demonstrates RAG-loaded knowledge of the user's membership.",
            "preReqs": "First Orb interaction post-onboarding.",
            "whereToLook": "synrgy-app/app/index.tsx; Uptyck RAG plan context",
            "estimatedMinutes": 3
          },
          {
            "id": "mo-32",
            "text": "Orb never implies SYNRGY determines eligibility for insured events",
            "expected": "Listen to the Orb's greeting and any follow-up. At no point does it say SYNRGY 'determines', 'decides', or 'qualifies' the user for benefits. Compliant language only — actions 'may correspond to insured events'.",
            "preReqs": "Engaged with the Orb.",
            "whereToLook": "synrgy-app/app/index.tsx; Uptyck system prompt",
            "estimatedMinutes": 3,
            "failureGuidance": "Any non-compliant phrasing is a hard fail; record verbatim."
          }
        ]
      }
    ]
  },

  // ─── SCENARIO 8: Member uses core app features ───
  {
    "id": "member-features",
    "persona": "Member",
    "icon": "E",
    "color": "#993556",
    "bg": "#FBEAF0",
    "title": "Daily app engagement & features",
    "summary": "Member uses core daily-engagement features: Prevention Guidance feed, face vitals scan history, virtual urgent care, formulary search, and discount card. Compliance language is verified on every confirmation surface.",
    "steps": [
      {
        "title": "Prevention Guidance feed",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "mf-29",
            "text": "Latest guidance card renders with title, summary, tags, personalization pill",
            "expected": "Open /guidance from the service menu or an action card. The Latest Guidance card shows a domain icon and badges, title, 3-line summary, and tags indicating content type (video / article / actions). A personalization-level pill is visible ('Highly Personalized' / 'Personalized' / 'General').",
            "preReqs": "Member has at least one guidance generated. Sahha data may take hours to populate after install.",
            "whereToLook": "synrgy-app/app/guidance.tsx:83-94, 213-278",
            "estimatedMinutes": 4,
            "notes": "Sahha-driven guidance takes hours to populate from background health sync."
          },
          {
            "id": "mf-30",
            "text": "Today's Actions section shows up to 3 actions when present",
            "expected": "Below the Latest Guidance card, a 'Today's Actions' section shows up to 3 actionable items. If fewer exist, fewer are shown. If none, the section is absent.",
            "preReqs": "Latest guidance includes actions.",
            "whereToLook": "synrgy-app/app/guidance.tsx:281-301",
            "estimatedMinutes": 2
          },
          {
            "id": "mf-31",
            "text": "Past guidance list paginates via infinite scroll",
            "expected": "Below the latest card, a Past Guidance list shows prior guidance items (most recent first), excluding the latest one. Scrolling near the bottom loads more items via paginated fetch.",
            "preReqs": "Member has multiple past guidance items.",
            "whereToLook": "synrgy-app/app/guidance.tsx:152-176, 328-365",
            "estimatedMinutes": 4
          },
          {
            "id": "mf-32",
            "text": "Empty state shown if no guidance exists yet",
            "expected": "If the user has no generated guidance (new account, Sahha not yet populated), an empty state appears with a Refresh button. Tapping Refresh re-queries the latest guidance endpoint.",
            "preReqs": "New account with no guidance.",
            "whereToLook": "synrgy-app/app/guidance.tsx:188-208",
            "estimatedMinutes": 3
          },
          {
            "id": "mf-14",
            "text": "Recommendations are personalized to the member's data",
            "expected": "Read the latest guidance content. At least some of the recommendations reference the user's actual metrics or behaviors (e.g., named medications, observed activity levels, recent sleep patterns). Not all generic.",
            "preReqs": "Member has enough Sahha data for personalization.",
            "whereToLook": "synrgy-app/app/guidance.tsx; synrgy-app/services/cleverhealth-api.ts (CHGuidance)",
            "estimatedMinutes": 4
          }
        ]
      },
      {
        "title": "Prevention Guidance detail",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "mf-33",
            "text": "Detail screen plays HLS video with auth token query param",
            "expected": "Open a guidance detail with video content. A play overlay is visible. Tapping it streams the .m3u8 video from CleverHealth. The token is appended as a query param. Native video controls are present once playing.",
            "preReqs": "On a guidance with video content available (video.introStatus === 'completed' or segments exist).",
            "whereToLook": "synrgy-app/app/guidance-detail.tsx:264-273, 341-396",
            "estimatedMinutes": 4
          },
          {
            "id": "mf-34",
            "text": "Article scrolling near the bottom fires article_read engagement once",
            "expected": "Read an article guidance. Scroll within ~100px of the bottom. The engagement event 'article_read' is recorded once (server-side; client fires it fire-and-forget). Subsequent scroll-to-bottom does not double-fire.",
            "preReqs": "On a guidance detail with article content.",
            "whereToLook": "synrgy-app/app/guidance-detail.tsx:178-183, 234-239",
            "estimatedMinutes": 3
          },
          {
            "id": "mf-35",
            "text": "Video finish fires video_watched engagement once",
            "expected": "Play a video guidance to completion. The 'video_watched' engagement event is fired once. Replaying does not double-fire.",
            "preReqs": "On a guidance detail with video.",
            "whereToLook": "synrgy-app/app/guidance-detail.tsx:188, 388",
            "estimatedMinutes": 4
          },
          {
            "id": "mf-36",
            "text": "Action items can be locally checked off",
            "expected": "On the detail screen, action items have a checkbox. Tapping toggles a strikethrough on the text. Note: the checked state may not persist across screens — this is local-only UI per Phase 1 inventory.",
            "preReqs": "On a guidance detail with action items.",
            "whereToLook": "synrgy-app/app/guidance-detail.tsx:295-310, 410-427",
            "estimatedMinutes": 3,
            "notes": "Local checkbox state may not persist across screen visits."
          },
          {
            "id": "mf-37",
            "text": "Guidance detail surfaces a non-medical-advice disclaimer",
            "expected": "A non-medical-advice disclaimer is visible (footer or info card) on the detail screen.",
            "preReqs": "On a guidance detail.",
            "whereToLook": "synrgy-app/app/guidance-detail.tsx:313-325",
            "estimatedMinutes": 2
          }
        ]
      },
      {
        "title": "Virtual Urgent Care (entry from menu)",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "mf-3",
            "text": "VUC video session connects and functions",
            "expected": "After completing the intake, the Twilio Video session connects within 30 seconds. Local and remote video feeds render. Audio is clear. The session sustains for the allocated time without disconnects.",
            "preReqs": "Logged in, started a VUC visit, clinician present.",
            "whereToLook": "synrgy-app/components/tm/TwilioVideoView.tsx; synrgy-app/app/virtual-urgent-care.tsx",
            "estimatedMinutes": 10
          },
          {
            "id": "mf-4",
            "text": "Completed VUC visit appears in /visits history",
            "expected": "After a visit ends, navigate to /visits. The completed visit appears with member name, date in MM/DD/YYYY, reason for visit (up to 2 lines), and a Completed status pill in green. The entry persists across app restarts.",
            "preReqs": "Just completed a VUC visit.",
            "whereToLook": "synrgy-app/app/visits.tsx:65-94, 170-206",
            "estimatedMinutes": 4
          }
        ]
      },
      {
        "title": "Face vitals scan — latest reading",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "mf-10",
            "text": "Face vitals scan completes and persists results to scan history",
            "expected": "Tap Start Scan on /vitals-scan. The ShenAI camera-based scan runs for ~30 seconds. On completion, the app navigates to /scan-detail with the new scan ID. The scan appears in the recent-scans list on the next visit to /vitals-scan.",
            "preReqs": "Camera permission granted. Good lighting. Face visible to camera.",
            "whereToLook": "synrgy-app/app/vitals-scan.tsx:42-46, 98-107; synrgy-app/app/vitals-scanner.native.tsx:83-189",
            "estimatedMinutes": 6
          },
          {
            "id": "mf-11",
            "text": "Latest scan data is available via useLatestVitals hook (refreshes every 5 min)",
            "expected": "After a scan, any home-screen or other UI element that consumes the latest-vitals hook reflects the new reading. The hook auto-refreshes every 5 minutes.",
            "preReqs": "A scan has been recorded.",
            "whereToLook": "synrgy-app/hooks/useLatestVitals.ts",
            "estimatedMinutes": 4
          },
          {
            "id": "mf-12",
            "text": "Sahha-driven background data feeds CleverHealth for guidance generation",
            "expected": "After Sahha has been authenticated and connected health data exists, Sahha-fed data eventually drives guidance recommendations on /guidance. The 'source of truth' for background sync is the device's health platform (Apple Health / Health Connect).",
            "preReqs": "Sahha authenticated, connected health data exists on the source platform.",
            "whereToLook": "synrgy-app/services/sahha.ts; synrgy-app/CLAUDE.md (Sahha section)",
            "estimatedMinutes": 4,
            "notes": "Sahha takes hours to populate. Do not expect immediate appearance in guidance."
          }
        ]
      },
      {
        "title": "Formulary and discount card",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "mf-16",
            "text": "Formulary search returns drug results from the embedded dataset",
            "expected": "Open /formulary. Search for a common drug name (e.g., 'Lisinopril'). Results show matching drugs with name, category, dosage count, and forms. Results are derived from the embedded constants/formulary.ts dataset, not a live pharmacy-pricing API.",
            "preReqs": "On the Formulary screen.",
            "whereToLook": "synrgy-app/app/formulary.tsx:53-118; synrgy-app/constants/formulary.ts",
            "estimatedMinutes": 4
          },
          {
            "id": "mf-17",
            "text": "Drug detail shows dosages, forms, and a covered badge",
            "expected": "Tap a drug from the formulary list. The detail screen shows the drug name, category, list of dosages as chips (e.g., 500 mg, 1000 mg), and forms (e.g., Tablet). A 'This drug is covered' badge appears in green.",
            "preReqs": "On the formulary search results.",
            "whereToLook": "synrgy-app/app/drug-detail.tsx:57-89",
            "estimatedMinutes": 3
          },
          {
            "id": "mf-38",
            "text": "Drug detail has Rx Savings Card and Find Pharmacy buttons",
            "expected": "On the drug detail screen, two action buttons are visible: 'Rx Savings Card' routes to /discount-card; 'Find Pharmacy' routes to /pharmacy-locator.",
            "preReqs": "On a drug detail screen.",
            "whereToLook": "synrgy-app/app/drug-detail.tsx:91-104",
            "estimatedMinutes": 2
          },
          {
            "id": "mf-39",
            "text": "Discount card renders BIN, PCN, Group, and Member ID",
            "expected": "On /discount-card, a credit-card-style display shows BIN, PCN, Group, and Member ID values fetched via getInsuranceCard. All fields are populated; none show placeholder text.",
            "preReqs": "Member has insurance card data on file.",
            "whereToLook": "synrgy-app/app/discount-card.tsx:16-85",
            "estimatedMinutes": 3
          },
          {
            "id": "mf-40",
            "text": "Discount card error state shows retry button",
            "expected": "If the insurance card API call fails, an error message appears with a Retry button. Tapping Retry re-fetches.",
            "preReqs": "Force a fetch error (offline or test member without card on file).",
            "whereToLook": "synrgy-app/app/discount-card.tsx:44-53",
            "estimatedMinutes": 3
          }
        ]
      },
      {
        "title": "Branding and compliance across daily features",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "mf-13",
            "text": "Health insights are labeled as 'Health Insights' or similar; no SDK names visible",
            "expected": "Scan any in-app surface that presents health insights (guidance, vitals classification). No reference to underlying SDKs (Sahha, Uptyck, ShenAI) is visible in user-facing copy.",
            "preReqs": "General observation.",
            "whereToLook": "Manual scan across guidance.tsx, scan-detail.tsx, index.tsx",
            "estimatedMinutes": 4
          },
          {
            "id": "mf-15",
            "text": "No third-party SDK branding appears in any screen",
            "expected": "Walk through every screen accessible to a member. No logos, names, or branding from Sahha, Uptyck, ShenAI, Twilio, or other vendors. SYNRGY branding only.",
            "preReqs": "General observation across the app.",
            "whereToLook": "Manual scan",
            "estimatedMinutes": 5
          },
          {
            "id": "mf-27",
            "text": "App never says SYNRGY 'determines', 'decides', or 'controls' insured events",
            "expected": "Review every confirmation message, action card caption, and detail screen copy. The app never claims SYNRGY determines insured-event eligibility. Compliant language only.",
            "preReqs": "General observation.",
            "whereToLook": "Manual scan",
            "estimatedMinutes": 5,
            "failureGuidance": "Any occurrence of 'determines / decides / controls eligibility' is a hard compliance fail."
          },
          {
            "id": "mf-28",
            "text": "All confirmation copy uses 'may correspond to insured events' or equivalent",
            "expected": "Every confirmation message (post-scan, post-guidance, post-claim) uses compliant language: events 'may correspond to insured events'. Never 'earn benefits', 'qualify for benefits', 'rewards', 'credits', or 'points'.",
            "preReqs": "General observation.",
            "whereToLook": "Manual scan",
            "estimatedMinutes": 5,
            "failureGuidance": "Record verbatim any non-compliant phrasing."
          }
        ]
      }
    ]
  },

  // ─── NEW SCENARIO: AI Orb interaction testing ───
  {
    "id": "ai-orb-testing",
    "persona": "Member",
    "icon": "AI",
    "color": "#005F78",
    "bg": "#E1F5EE",
    "title": "AI Orb interaction testing",
    "summary": "Tests the AI Orb's visual states, audio quality, conversation flow, service routing, knowledge accuracy, boundary behavior, and free-form conversation. The Orb should speak naturally, route to correct services, and handle conversation endings gracefully.",
    "steps": [
      {
        "title": "Orb visual states",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "ai-1",
            "text": "Orb state-to-color mapping is correct (verify from code)",
            "expected": "The Orb morphs through five states defined in code: idle, listening, thinking, speaking, notification. Each state has a target color that lerps over time. Record the observed color for each state and verify it matches the constants in components/Orb.tsx. Note: the legacy red/blue/green/gray mapping from the prior CleverTest scenario may not match — verify against current code.",
            "preReqs": "Logged in, on home screen, interacting with the Orb to cycle through states.",
            "whereToLook": "synrgy-app/components/Orb.tsx:97-127 (color lerp); state definitions",
            "estimatedMinutes": 5,
            "failureGuidance": "If observed colors differ from code-defined targets, record per-state in notes."
          },
          {
            "id": "ai-2",
            "text": "Tap Orb while in notification state to consume the proactive insight",
            "expected": "When the Orb is in the notification state (driven by hasProactiveInsight in AppContext), tapping it transitions through speaking → green/listening. The Orb greets the user by name, delivers the proactive insight, and generates an action card on the home dashboard.",
            "preReqs": "A proactive insight is queued. Tester needs a reproducible trigger — check with Steph if this requires backend seeding.",
            "whereToLook": "synrgy-app/app/index.tsx (hasProactiveInsight handling); synrgy-app/context/AppContext.tsx",
            "estimatedMinutes": 4,
            "notes": "Producer of hasProactiveInsight flag is not yet visible in mobile code; reproducible trigger TBD."
          },
          {
            "id": "ai-3",
            "text": "Tap Orb after a conversation ended (idle/gray state) to reconnect",
            "expected": "After ending a conversation (Orb idle), tapping the Orb resumes the voice session. The Orb greets, then transitions to listening.",
            "preReqs": "Previous conversation ended (Orb idle).",
            "whereToLook": "synrgy-app/app/index.tsx:188-252 (useSynrgyVoice)",
            "estimatedMinutes": 3
          },
          {
            "id": "ai-4",
            "text": "First Orb interaction of the session includes a transparency disclaimer",
            "expected": "The first Orb interaction in a session includes a verbal disclosure that it is an AI assistant, in natural language. Per the Responsible AI Manifesto.",
            "preReqs": "First Orb interaction since login.",
            "whereToLook": "Uptyck system prompt; synrgy-app/app/index.tsx",
            "estimatedMinutes": 3
          }
        ]
      },
      {
        "title": "Audio quality",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "ai-5",
            "text": "Audio is clear without headphones",
            "expected": "Engage the Orb in conversation with device speakers at normal volume. Audio is clear and audible, no distortion or cutting out.",
            "preReqs": "Microphone permission granted. In a quiet environment.",
            "whereToLook": "OS + Uptyck SDK",
            "estimatedMinutes": 3
          },
          {
            "id": "ai-6",
            "text": "Audio routes correctly to headphones",
            "expected": "Connect wired or Bluetooth headphones, engage the Orb. Audio routes to headphones (not device speakers). No sync delay between Orb animation and audio.",
            "preReqs": "Headphones connected.",
            "whereToLook": "OS routing + Uptyck SDK",
            "estimatedMinutes": 3
          }
        ]
      },
      {
        "title": "Ending conversations",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "ai-7",
            "text": "Say 'That's all I need, goodbye.' — Orb disengages gracefully",
            "expected": "While Orb is listening, say the phrase. The Orb acknowledges and verbally disengages, then transitions to idle. Speaking again does not re-trigger a response until you tap the Orb.",
            "preReqs": "Orb listening.",
            "whereToLook": "Uptyck voice agent (server-side intent)",
            "estimatedMinutes": 3
          },
          {
            "id": "ai-8",
            "text": "Use a custom farewell phrase — Orb still detects the end",
            "expected": "Same as ai-7 but using a different goodbye phrase of your choice. Record the phrase you used in notes.",
            "preReqs": "Orb listening.",
            "whereToLook": "Uptyck voice agent",
            "estimatedMinutes": 3
          }
        ]
      },
      {
        "title": "Service routing — Orb generates the correct service card",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "ai-9",
            "text": "'Can you connect me to tax resources?' → Tax Hotline card",
            "expected": "The Orb responds verbally about tax resources AND adds a Tax Hotline action card to the home dashboard.",
            "preReqs": "Orb listening.",
            "whereToLook": "synrgy-app/constants/services.ts (tax-hotline); synrgy-app/app/tax-hotline.tsx",
            "estimatedMinutes": 3
          },
          {
            "id": "ai-10",
            "text": "'Can you help me update my password?' → Profile card",
            "expected": "Orb responds AND generates a Profile action card linking to /edit-profile.",
            "preReqs": "Orb listening.",
            "whereToLook": "synrgy-app/app/edit-profile.tsx",
            "estimatedMinutes": 2
          },
          {
            "id": "ai-11",
            "text": "'Can you show me doctors in my area?' → Provider Locator card",
            "expected": "Orb responds AND generates a Provider Locator action card linking to /provider-locator.",
            "preReqs": "Orb listening.",
            "whereToLook": "synrgy-app/app/provider-locator.tsx",
            "estimatedMinutes": 2
          },
          {
            "id": "ai-12",
            "text": "'Can you show me pharmacies in my area?' → Pharmacy Locator card",
            "expected": "Orb responds AND generates a Pharmacy Locator action card linking to /pharmacy-locator.",
            "preReqs": "Orb listening.",
            "whereToLook": "synrgy-app/app/pharmacy-locator.tsx",
            "estimatedMinutes": 2
          },
          {
            "id": "ai-13",
            "text": "'Can you help me check my blood pressure?' → Vitals card",
            "expected": "Orb responds AND generates a Vitals action card linking to /vitals-scan.",
            "preReqs": "Orb listening.",
            "whereToLook": "synrgy-app/app/vitals-scan.tsx",
            "estimatedMinutes": 2
          },
          {
            "id": "ai-14",
            "text": "'Can you help me schedule a therapy appointment?' → Mental Health Support card",
            "expected": "Orb responds AND generates a Mental Health Support card linking to /virtual-mental-health (Evo).",
            "preReqs": "Orb listening.",
            "whereToLook": "synrgy-app/app/virtual-mental-health.tsx",
            "estimatedMinutes": 2
          },
          {
            "id": "ai-15",
            "text": "'Can I talk to a doctor right now?' → Virtual Urgent Care card with $0 copay mention",
            "expected": "Orb responds AND generates a Virtual Urgent Care action card. The verbal response should mention $0 copay through the plan.",
            "preReqs": "Orb listening.",
            "whereToLook": "synrgy-app/app/virtual-urgent-care.tsx; Uptyck plan RAG",
            "estimatedMinutes": 3
          },
          {
            "id": "ai-16",
            "text": "'Can you tell me more about the SYNRGY plan?'",
            "expected": "Orb responds with accurate plan details, drawn from Uptyck RAG context loaded with the user's plan.",
            "preReqs": "Orb listening. Plan information loaded into Uptyck.",
            "whereToLook": "Uptyck RAG configuration; synrgy-app/services/uptyck.ts",
            "estimatedMinutes": 3
          },
          {
            "id": "ai-17",
            "text": "'Can you help me complete my health risk assessment?' → HRA card",
            "expected": "Orb responds AND generates an HRA action card linking to /hra.",
            "preReqs": "Orb listening.",
            "whereToLook": "synrgy-app/app/hra.tsx",
            "estimatedMinutes": 2
          },
          {
            "id": "ai-18",
            "text": "'Can you help me schedule a routine check-up with my doctor?' → Virtual Primary Care card with $0 copay mention",
            "expected": "Orb responds AND generates a VPC action card. The response should mention $0 copay.",
            "preReqs": "Orb listening.",
            "whereToLook": "synrgy-app/app/virtual-primary-care.tsx",
            "estimatedMinutes": 3
          }
        ]
      },
      {
        "title": "Service knowledge accuracy",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "ai-19",
            "text": "'What services do you provide in general?'",
            "expected": "Orb lists available services accurately, matching the user's plan and CB service config. Speech is natural, not a robotic list-readout.",
            "preReqs": "Orb listening.",
            "whereToLook": "Uptyck system prompt; CB getUserServiceConfig",
            "estimatedMinutes": 3
          },
          {
            "id": "ai-20",
            "text": "'Tell me more about body vitals.'",
            "expected": "Orb explains body vitals accurately: smartphone-based face scan via ShenAI, measures heart rate / BP / HRV / stress / breathing / cardiac workload / BMI. Mentions that readings are wellness estimates, NOT medical diagnoses.",
            "preReqs": "Orb listening.",
            "whereToLook": "Uptyck system prompt; synrgy-app/app/vitals-scan.tsx",
            "estimatedMinutes": 3
          },
          {
            "id": "ai-21",
            "text": "'Tell me more about virtual urgent care.'",
            "expected": "Orb explains VUC: on-demand video visit, $0 copay, how to access (start from menu or VUC card).",
            "preReqs": "Orb listening.",
            "whereToLook": "Uptyck system prompt; synrgy-app/app/virtual-urgent-care.tsx",
            "estimatedMinutes": 3
          },
          {
            "id": "ai-22",
            "text": "'Tell me more about mental health services.' — includes 988 crisis line",
            "expected": "Orb explains options: Evo therapy, Bella chat, peer support. Mentions the 988 Crisis Lifeline number for emergencies.",
            "preReqs": "Orb listening.",
            "whereToLook": "synrgy-app/app/mental-health.tsx:87-101 (988); Uptyck system prompt",
            "estimatedMinutes": 3
          },
          {
            "id": "ai-23",
            "text": "'Tell me more about virtual primary care.'",
            "expected": "Orb explains VPC: scheduled visit by phone (tel:8667101972), $0 copay, dedicated provider for ongoing care.",
            "preReqs": "Orb listening.",
            "whereToLook": "synrgy-app/app/virtual-primary-care.tsx",
            "estimatedMinutes": 3
          },
          {
            "id": "ai-24",
            "text": "Other services accuracy (pharmacy locator, tax hotline, provider locator, HRA, health plans, insurance scan, at-home testing)",
            "expected": "Probe each service. Orb provides accurate, current information for each. Flag any outdated or incorrect info in notes (e.g., references to features that no longer exist, or omits new features like at-home testing or insurance scan).",
            "preReqs": "Orb listening.",
            "whereToLook": "Uptyck system prompt; synrgy-app/constants/services.ts (16 services)",
            "estimatedMinutes": 6
          }
        ]
      },
      {
        "title": "Orb boundary testing",
        "platform": "SYNRGY app",
        "path": "path-a",
        "checks": [
          {
            "id": "ai-25",
            "text": "Off-topic question (e.g., 'Is Santa Claus real?') is deflected gracefully",
            "expected": "Orb declines to answer off-topic questions, friendly in tone, and redirects to plan and app-related topics. Does not provide the off-topic answer.",
            "preReqs": "Orb listening.",
            "whereToLook": "Uptyck system prompt",
            "estimatedMinutes": 3
          },
          {
            "id": "ai-26",
            "text": "Medical advice request is deflected to VUC or VPC",
            "expected": "Ask 'Should I take ibuprofen for my headache?'. The Orb does NOT give medical advice. It redirects to VUC (on-demand) or VPC (scheduled) and includes an appropriate disclaimer.",
            "preReqs": "Orb listening.",
            "whereToLook": "Uptyck system prompt",
            "estimatedMinutes": 3
          },
          {
            "id": "ai-27",
            "text": "Benefits-eligibility question uses compliant language",
            "expected": "Ask 'Do I qualify for the health benefit?'. The Orb NEVER uses 'qualify for benefits', 'earn benefits', 'rewards', 'credits', or 'points'. Uses 'may correspond to insured events' or equivalent. Does not imply SYNRGY determines eligibility.",
            "preReqs": "Orb listening.",
            "whereToLook": "Uptyck system prompt",
            "estimatedMinutes": 4,
            "failureGuidance": "Hard compliance fail if prohibited phrasing is used. Record verbatim."
          }
        ]
      },
      {
        "title": "Free-form conversation",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "ai-28",
            "text": "Conversation 1: natural multi-turn dialogue",
            "expected": "Have a 4-6 turn conversation with the Orb on a real plan-related topic. The Orb maintains context within the conversation, handles topic changes, and responds naturally. Record a brief summary of the conversation in notes.",
            "preReqs": "Orb just connected.",
            "whereToLook": "Uptyck RAG conversational behavior",
            "estimatedMinutes": 6
          },
          {
            "id": "ai-29",
            "text": "Conversation 2: different topics than Conversation 1",
            "expected": "Repeat with different topic categories (e.g., mental health vs. pharmacy vs. vitals). Conversation continues to feel natural.",
            "preReqs": "Just ended Conversation 1.",
            "whereToLook": "Uptyck RAG",
            "estimatedMinutes": 6
          },
          {
            "id": "ai-30",
            "text": "Conversation 3: edge cases (vague questions, rapid topic shifts, long pauses)",
            "expected": "Use intentionally vague phrasing, rapidly change topics, leave long silent pauses. Note how the Orb handles each — does it ask for clarification, does it time out, does it gracefully recover from interruption.",
            "preReqs": "Just ended Conversation 2.",
            "whereToLook": "Uptyck voice agent timeouts and clarification",
            "estimatedMinutes": 6
          }
        ]
      },
      {
        "title": "Orb troubleshooting",
        "platform": "SYNRGY app",
        "path": "path-c",
        "checks": [
          {
            "id": "ai-31",
            "text": "Orb stuck → tap to disconnect, then tap to reconnect",
            "expected": "If the Orb stops responding (no color change, no audio response), tap it once to force-disconnect (goes idle), then tap again to reconnect. The Orb resumes normal behavior.",
            "preReqs": "Orb appears stuck.",
            "whereToLook": "synrgy-app/app/index.tsx:243-252 (useFocusEffect cleanup)",
            "estimatedMinutes": 3
          },
          {
            "id": "ai-32",
            "text": "Orb stuck → navigate to a service and back",
            "expected": "Tap into any service (e.g. /pharmacy-locator) and back to home. The Orb should be idle. Tap to reconnect — should work.",
            "preReqs": "Disconnect/reconnect did not resolve the stuck state.",
            "whereToLook": "synrgy-app/app/index.tsx (useFocusEffect ends voice session)",
            "estimatedMinutes": 3
          },
          {
            "id": "ai-33",
            "text": "Orb stuck → log out and back in",
            "expected": "If prior steps did not help, log out and back in. The Orb works normally after re-login.",
            "preReqs": "Prior troubleshooting did not work.",
            "whereToLook": "synrgy-app/context/AuthContext.tsx (logout)",
            "estimatedMinutes": 4
          }
        ]
      }
    ]
  },

  // ─── NEW SCENARIO: Individual service screen testing ───
  {
    "id": "service-testing",
    "persona": "Member",
    "icon": "S",
    "color": "#0F6E56",
    "bg": "#E1F5EE",
    "title": "Individual service screen testing",
    "summary": "Detailed tests of each service screen the member can access from the home menu: Vitals, Mental Health (Bella + Peer Support + Evo), Virtual Care (VUC + VPC), Pharmacy + Formulary + Discount Card, Profile + Family, Health Plans, Provider Locator, Health Content, At-Home Testing, Insurance Scan, Hospital Indemnity, Tax Hotline. Covers UI, navigation, error states, and known UI-only flows.",
    "steps": [
      {
        "title": "Vitals — entry screen and recent scans",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "sv-1",
            "text": "Open Vitals — intro card and recent scans list visible",
            "expected": "Open /vitals-scan from the service menu or service card. The screen shows an intro card with icon and description. Below it, a 'Recent scans' section lists up to 3 prior scans (date + HR/BP summary). If none, an empty-state message appears. A 'Start Scan' button is prominent. Below the button, a wellness disclaimer is shown.",
            "preReqs": "Logged in. CB service config has body-vitals enabled.",
            "whereToLook": "synrgy-app/app/vitals-scan.tsx:62-107",
            "estimatedMinutes": 3
          },
          {
            "id": "sv-25",
            "text": "Tap a recent scan to view detail",
            "expected": "Tapping a row in the Recent scans list navigates to /scan-detail with the scan's ID. The detail screen loads all the metric cards for that scan.",
            "preReqs": "At least one scan exists.",
            "whereToLook": "synrgy-app/app/vitals-scan.tsx:84",
            "estimatedMinutes": 2
          }
        ]
      },
      {
        "title": "Vitals — face scan flow",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "sv-26",
            "text": "Native face scan happy path: 30-second measurement completes and persists",
            "expected": "On native (iOS/Android), tap Start Scan. The ShenAI camera view appears. Hold the device steady with face framed. After approximately 30 seconds, the measurement finishes. The app submits the result and navigates to /scan-detail showing all metrics. The recent-scans list is updated.",
            "preReqs": "Camera permission granted. Good lighting. Face visible.",
            "whereToLook": "synrgy-app/app/vitals-scanner.native.tsx:83-189",
            "estimatedMinutes": 6
          },
          {
            "id": "sv-27",
            "text": "ShenAI init failure surfaces a meaningful alert and routes back",
            "expected": "If ShenAI fails to initialize (INVALID_API_KEY, CONNECTION_ERROR, INTERNAL_ERROR), an alert appears with the specific error class. Tapping OK returns the user to /vitals-scan.",
            "preReqs": "Force an init failure (offline + cold start, or test build with bad API key).",
            "whereToLook": "synrgy-app/app/vitals-scanner.native.tsx:141-150",
            "estimatedMinutes": 4
          },
          {
            "id": "sv-28",
            "text": "Web face scan canvas renders status updates during measurement",
            "expected": "On web (Synrgy webapp), open Vitals and tap Start Scan. A canvas appears with the user's webcam view. Status text cycles through 'Loading scanner…' → 'Position your face in the frame…' → 'Hold still and look at the camera…' → 'Measuring…'. On completion, navigates to /scan-detail.",
            "preReqs": "Web platform. Camera access granted.",
            "whereToLook": "synrgy-app/app/vitals-scanner.web.tsx:148-222",
            "estimatedMinutes": 5
          }
        ]
      },
      {
        "title": "Vitals — past scan detail",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "sv-29",
            "text": "Scan detail shows date, time-of-day label, and signal quality pill",
            "expected": "On /scan-detail, the meta row shows the formatted date/time, a time-of-day label (Morning/Afternoon/Evening/Night), and a signal-quality pill (High / Medium / Low) with appropriate color.",
            "preReqs": "On a scan-detail page.",
            "whereToLook": "synrgy-app/app/scan-detail.tsx:742-758",
            "estimatedMinutes": 3
          },
          {
            "id": "sv-30",
            "text": "Heart rate card shows zone bar and trend versus last scan",
            "expected": "The Heart card displays HR in bpm with a zone bar (Low / Normal 50-100 / Elevated / High). A trend indicator (up/down/flat) shows the delta from the previous scan. If multiple scans exist, a history sparkline of the last 8 scans is shown.",
            "preReqs": "On a scan-detail page.",
            "whereToLook": "synrgy-app/app/scan-detail.tsx:778-879",
            "estimatedMinutes": 3
          },
          {
            "id": "sv-31",
            "text": "Blood pressure card shows AHA-aligned zone bar",
            "expected": "The BP card shows systolic/diastolic (e.g., 120/80 mmHg) and an AHA-aligned zone bar: Normal <120, Elevated 120-130, Stage 1 130-140, Stage 2 140-180 systolic.",
            "preReqs": "On a scan-detail page.",
            "whereToLook": "synrgy-app/app/scan-detail.tsx:882-955",
            "estimatedMinutes": 3
          },
          {
            "id": "sv-32",
            "text": "Chat-about-results CTA opens ScanChatModal",
            "expected": "Below the meta row, a 'Chat about these results' card is visible. Tapping it opens the ScanChatModal — a chat UI for asking Uptyck AI about the results.",
            "preReqs": "On a scan-detail page.",
            "whereToLook": "synrgy-app/app/scan-detail.tsx:760-775",
            "estimatedMinutes": 3
          }
        ]
      },
      {
        "title": "Mental Health — hub screen",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "sv-33",
            "text": "Open /mental-health — Evo service card + 988 crisis card visible",
            "expected": "From the service menu, tap Mental Health. The hub screen shows an intro card, an Evo service card linking to /virtual-mental-health, and a red 988 Crisis Support card with a 'Call 988' button.",
            "preReqs": "CB config includes mental-health services.",
            "whereToLook": "synrgy-app/app/mental-health.tsx:48-101",
            "estimatedMinutes": 3
          },
          {
            "id": "sv-34",
            "text": "Tap 'Call 988' on crisis card → native phone app opens to tel:988",
            "expected": "Tap the Call 988 button. The OS phone app opens with 988 pre-dialed.",
            "preReqs": "Native device (not web). On /mental-health.",
            "whereToLook": "synrgy-app/app/mental-health.tsx:96 (Linking.openURL('tel:988'))",
            "estimatedMinutes": 2
          }
        ]
      },
      {
        "title": "Mental Health — Bella chat",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "sv-7",
            "text": "Open Mental Health Chat (Bella) from menu",
            "expected": "Tap Mental Health Chat from the service menu. The Bella chat WebView loads with a brief 'Bella is connecting…' loading state. The WebView surfaces Bella's chat UI once loaded.",
            "preReqs": "CB service config includes mental-health-chat.",
            "whereToLook": "synrgy-app/app/mental-health-chat.tsx:73-189",
            "estimatedMinutes": 4
          },
          {
            "id": "sv-35",
            "text": "Missing required profile fields gates Bella with edit-profile prompt",
            "expected": "If member profile is missing any of the 10 required fields (firstName, lastName, gender, DOB, phone, email, address, city, state, zip), the chat does NOT open. Instead a 'Complete Your Profile' state is shown with a link to /edit-profile and a 'Go back' button.",
            "preReqs": "Test profile with at least one required field empty.",
            "whereToLook": "synrgy-app/app/mental-health-chat.tsx:60-71, 107-133",
            "estimatedMinutes": 4
          },
          {
            "id": "sv-8",
            "text": "Inside Bella, the in-WebView '?' opens Bella's own support screen",
            "expected": "Tap the red '?' icon in the Bella WebView (top-right). Bella's internal support screen opens. Note: this is Bella's UI rendered inside the WebView, not SYNRGY's. Record observed behavior.",
            "preReqs": "Bella WebView loaded.",
            "whereToLook": "synrgy-app/app/mental-health-chat.tsx:160-189 (WebView container only); '?' is Bella content",
            "estimatedMinutes": 3,
            "notes": "The '?' button lives inside the Bella WebView, not in SYNRGY native code. Verify with Bella vendor whether it still exists."
          },
          {
            "id": "sv-9",
            "text": "PHQ-9 and GAD-7 links open in device browser",
            "expected": "If PHQ-9 and GAD-7 links appear in the Bella WebView, tapping them opens external web pages in the phone's browser. Pages load correctly. Note: these are Bella-provided links.",
            "preReqs": "In the Bella WebView with assessment links visible.",
            "whereToLook": "Bella WebView content (not SYNRGY native)",
            "estimatedMinutes": 4,
            "notes": "PHQ-9 / GAD-7 links are inside the Bella WebView; behavior depends on Bella content."
          },
          {
            "id": "sv-10",
            "text": "Contact Support from inside Bella opens SYNRGY support module",
            "expected": "From Bella's support screen, tap Contact Support. SYNRGY's native /support module opens with options: Benefits, Virtual Care, Technical Issue, View your open support tickets.",
            "preReqs": "On Bella's support screen.",
            "whereToLook": "synrgy-app/app/support.tsx",
            "estimatedMinutes": 3
          },
          {
            "id": "sv-11",
            "text": "Close support modal returns to Bella, not home",
            "expected": "Tap X / close on the support module. You return to Bella's support screen inside the WebView (not the chat, not the home screen).",
            "preReqs": "SYNRGY support module is open from inside Bella.",
            "whereToLook": "synrgy-app/app/support.tsx; navigation handling",
            "estimatedMinutes": 2
          },
          {
            "id": "sv-36",
            "text": "Bella SSO failure shows error state with retry",
            "expected": "If loginBella returns no URL or fails, the screen shows an error message with 'Try again' and 'Go back' buttons. Try again retries the SSO call.",
            "preReqs": "Force an SSO failure (offline or backend stub).",
            "whereToLook": "synrgy-app/app/mental-health-chat.tsx:136-157",
            "estimatedMinutes": 3
          }
        ]
      },
      {
        "title": "Mental Health — Peer Support (Kindly Human)",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "sv-12",
            "text": "Open Peer Support from menu — WebView loads",
            "expected": "From the service menu, tap Peer Support. The peer-support WebView loads via loginPeerSupport SSO. Verify the screen does NOT display a large legacy Clever Health logo from inside the WebView — flag in notes if it does.",
            "preReqs": "CB service config includes peer-support.",
            "whereToLook": "synrgy-app/app/peer-support.tsx",
            "estimatedMinutes": 4,
            "notes": "Watch for legacy Clever Health logo inside the WebView content — has been a known UX issue."
          },
          {
            "id": "sv-37",
            "text": "Peer Support requires only 4 profile fields (vs Bella's 10)",
            "expected": "If the member is missing firstName, lastName, gender, or DOB, the 'Complete Your Profile' gate appears. If only optional fields are missing (e.g., phone), peer support still loads.",
            "preReqs": "Test profile with phone empty but core fields filled.",
            "whereToLook": "synrgy-app/app/peer-support.tsx:15",
            "estimatedMinutes": 3
          }
        ]
      },
      {
        "title": "Mental Health — Evo therapy",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "sv-38",
            "text": "Single eligible member auto-starts Evo session",
            "expected": "If only one eligible family member exists, opening /virtual-mental-health goes straight to the session WebView (no picker). loginEvo is called with that member's id.",
            "preReqs": "Account has exactly one eligible family member.",
            "whereToLook": "synrgy-app/app/virtual-mental-health.tsx:65",
            "estimatedMinutes": 4
          },
          {
            "id": "sv-39",
            "text": "Multiple eligible members trigger picker UI",
            "expected": "If 2+ eligible members exist, /virtual-mental-health shows a selection screen with each member as a card (name + relationship). Tapping a member triggers loginEvo for that member and opens the session.",
            "preReqs": "Account has multiple eligible family members.",
            "whereToLook": "synrgy-app/app/virtual-mental-health.tsx:67, 181-221",
            "estimatedMinutes": 4
          },
          {
            "id": "sv-40",
            "text": "Eligibility revoked → alert + back",
            "expected": "If isStillEligible returns false at session start, an alert is shown and the user is routed back from /virtual-mental-health.",
            "preReqs": "Test member whose isStillEligible returns false.",
            "whereToLook": "synrgy-app/app/virtual-mental-health.tsx:84-95",
            "estimatedMinutes": 3
          },
          {
            "id": "sv-41",
            "text": "messageOverride from server shows message screen instead of WebView",
            "expected": "If loginEvo returns a messageOverride (e.g., 'Sessions unavailable'), the screen shows a centered message instead of loading the WebView.",
            "preReqs": "Server returns messageOverride for the test user.",
            "whereToLook": "synrgy-app/app/virtual-mental-health.tsx:101-105, 226-241",
            "estimatedMinutes": 3
          }
        ]
      },
      {
        "title": "Virtual Primary Care",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "sv-13",
            "text": "Open VPC — info screen with conditions list and Call to Schedule CTA",
            "expected": "Open /virtual-primary-care from the service menu. The screen shows an intro card linking to VUC, a horizontal scrollable list of 12 conditions treated (annual physical, diabetes, hypertension, etc.), and a 'Call to Schedule' button at the bottom with the phone number displayed.",
            "preReqs": "CB service config includes virtual-primary-care.",
            "whereToLook": "synrgy-app/app/virtual-primary-care.tsx:73-119",
            "estimatedMinutes": 3
          },
          {
            "id": "sv-14",
            "text": "Tap the call button → phone dialer opens with VPC number",
            "expected": "Tap the Call to Schedule button. The OS phone dialer opens with the VPC phone number (tel:8667101972) pre-filled.",
            "preReqs": "Native device. On /virtual-primary-care.",
            "whereToLook": "synrgy-app/app/virtual-primary-care.tsx:112-119",
            "estimatedMinutes": 2
          }
        ]
      },
      {
        "title": "Virtual Urgent Care — entry and full visit",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "sv-15",
            "text": "Open VUC entry — dependent selection appears if eligible family exists",
            "expected": "Tap Virtual Urgent Care from the service menu. /select-dependent loads with a list of eligible family members (primary + spouse + children <18, excluding demo and pet records). Each card shows name and relationship.",
            "preReqs": "Account has eligible family members.",
            "whereToLook": "synrgy-app/app/select-dependent.tsx:31-41, 188-214",
            "estimatedMinutes": 3
          },
          {
            "id": "sv-42",
            "text": "Select a dependent → VUC main screen prepares the visit",
            "expected": "Tap a member card. /virtual-urgent-care loads with the dependentId param. A 'Preparing visit…' spinner is shown briefly while TMMainScreen initializes.",
            "preReqs": "Just selected a dependent.",
            "whereToLook": "synrgy-app/app/virtual-urgent-care.tsx:48, 130-137, 341-345",
            "estimatedMinutes": 3
          },
          {
            "id": "sv-43",
            "text": "EditProfileModal triggers if required profile fields are missing",
            "expected": "If the user's profile is missing any of the 10 required VUC fields, an EditProfileModal opens before the visit can proceed. Filling all fields and saving returns to the visit prep.",
            "preReqs": "Test user with incomplete profile.",
            "whereToLook": "synrgy-app/components/tm/EditProfileModal.tsx:27-156",
            "estimatedMinutes": 5
          },
          {
            "id": "sv-16",
            "text": "Full VUC visit happy path: intake → video → pharmacy → report",
            "expected": "Sign terms, enter reason for visit, complete intake questions. Twilio Video session connects with clinician. Receive a prescription/report. Send the prescription to a pharmacy via PharmacyPickerModal. Receive the report. Suggested safe test conditions: 'Eyelash Lengthening' or 'Anti-Wrinkle Cream'. If an Active Visit popup appears, choose 'No'.",
            "preReqs": "VUC available, dependent selected, profile complete.",
            "whereToLook": "synrgy-app/app/virtual-urgent-care.tsx; synrgy-app/components/tm/*",
            "estimatedMinutes": 30
          },
          {
            "id": "sv-17",
            "text": "Hamburger menu mid-visit offers cancel / finish later / contact support",
            "expected": "During a visit, tap the support button. An alert appears with options: Cancel Visit, Finish Later, Contact Support. Each option behaves correctly.",
            "preReqs": "In the middle of a VUC visit.",
            "whereToLook": "synrgy-app/app/virtual-urgent-care.tsx:165-182",
            "estimatedMinutes": 4
          },
          {
            "id": "sv-44",
            "text": "PharmacyPickerModal allows saving as preferred pharmacy",
            "expected": "When the modal opens with nearby pharmacies, select one. A confirmation alert asks if you want to save as preferred pharmacy. Tapping Save calls setPreferredPharmacy (best-effort).",
            "preReqs": "On the pharmacy selection step of a visit.",
            "whereToLook": "synrgy-app/components/tm/PharmacyPickerModal.tsx:108-147",
            "estimatedMinutes": 4
          },
          {
            "id": "sv-45",
            "text": "Post-visit survey: 5-star rating + recommend Y/N + comment",
            "expected": "After the visit, the PostVisitSurveyModal appears. Star rating is interactive (1-5). Recommendation has Yes/No buttons. Optional comment field up to 1000 characters. Submit is disabled until rating > 0.",
            "preReqs": "Just completed the clinician portion of a visit.",
            "whereToLook": "synrgy-app/components/tm/PostVisitSurveyModal.tsx:71-140",
            "estimatedMinutes": 4
          },
          {
            "id": "sv-46",
            "text": "Resume in-progress VUC visit from /visits",
            "expected": "If you exited a visit mid-flow, opening /visits shows the visit in history. Tapping it routes to /virtual-urgent-care with the visitId, and TMMainScreen loads cached state to resume.",
            "preReqs": "An in-progress visit exists.",
            "whereToLook": "synrgy-app/app/visits.tsx:118; synrgy-app/app/virtual-urgent-care.tsx:130-137",
            "estimatedMinutes": 5
          }
        ]
      },
      {
        "title": "Pharmacy locator",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "sv-18",
            "text": "Open Pharmacy Locator with location permission ON",
            "expected": "Open /pharmacy-locator. The map loads centered on the user's approximate location. Nearby pharmacies appear as pins on the map and as cards in the list below.",
            "preReqs": "Location permission granted.",
            "whereToLook": "synrgy-app/app/pharmacy-locator.tsx:45-72, 159-230",
            "estimatedMinutes": 3
          },
          {
            "id": "sv-19",
            "text": "Open Pharmacy Locator with location permission OFF — defaults to Charleston SC region",
            "expected": "Revoke location permission for SYNRGY in device settings, re-open /pharmacy-locator. The map centers on Charleston SC (32.7765, -79.9311) silently. No explicit error message appears. Pharmacies are loaded for that area. Map does not crash. Tester can override via search or by manually adjusting the map.",
            "preReqs": "Location permission revoked for SYNRGY in device settings.",
            "whereToLook": "synrgy-app/app/pharmacy-locator.tsx:45-72",
            "estimatedMinutes": 4,
            "notes": "Current behavior silently falls back to Charleston SC. This may surprise testers outside the SE US — record observed behavior."
          },
          {
            "id": "sv-20",
            "text": "Search by pharmacy name (debounced ~600ms)",
            "expected": "Type a pharmacy name in the search bar. After a brief delay (about 600 ms), results refresh to match the query.",
            "preReqs": "On /pharmacy-locator with map loaded.",
            "whereToLook": "synrgy-app/app/pharmacy-locator.tsx:91-106, 105",
            "estimatedMinutes": 3
          },
          {
            "id": "sv-21",
            "text": "Interact with the map: drag to refresh, tap pins, call, directions",
            "expected": "Drag the map to a new region. After ~800 ms, results refresh for the new region. Tap a pin to center on it. From a pharmacy card, tap Call to open the phone dialer with the pharmacy number. Tap Directions to open Apple Maps (iOS) or Google Maps (Android) with the destination.",
            "preReqs": "On /pharmacy-locator with map results.",
            "whereToLook": "synrgy-app/app/pharmacy-locator.tsx:135-145, 174-230",
            "estimatedMinutes": 5
          }
        ]
      },
      {
        "title": "Discount card and insurance benefits",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "sv-22",
            "text": "Open Rx Savings Card from menu — BIN/PCN/Group/Member ID populated",
            "expected": "Tap Rx Savings Card from the service menu (or from drug-detail). The /discount-card screen shows a credit-card-style display with BIN, PCN, Group, Member ID — all filled with member-specific values from getInsuranceCard. In test environments, values may be randomized; verify the card renders and fields populate.",
            "preReqs": "Member has insurance card on file.",
            "whereToLook": "synrgy-app/app/discount-card.tsx:16-85",
            "estimatedMinutes": 3
          },
          {
            "id": "sv-47",
            "text": "Discount card error state shows Retry button",
            "expected": "If getInsuranceCard fails, the screen shows 'Failed to load card' or similar with a Retry button. Tapping Retry re-fetches.",
            "preReqs": "Force a fetch failure (offline).",
            "whereToLook": "synrgy-app/app/discount-card.tsx:44-53",
            "estimatedMinutes": 3
          }
        ]
      },
      {
        "title": "Formulary",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "sv-48",
            "text": "Open Formulary — drugs list + sticky discount-card promo at bottom",
            "expected": "Tap Formulary / Free & Discounted Drugs from the menu. The screen shows an intro card with drug count, a search bar, an initial list of drugs (paginated, with Load More button). A sticky bottom bar promotes the Rx Savings Card.",
            "preReqs": "CB service config includes free-discounted-drugs.",
            "whereToLook": "synrgy-app/app/formulary.tsx:45-139",
            "estimatedMinutes": 3
          },
          {
            "id": "sv-49",
            "text": "Drug detail localized in Spanish when user's locale is es",
            "expected": "Switch app language to Spanish (Language Settings). Reopen /formulary and tap a drug. The description renders in Spanish (from formularyDescriptionsEs). Other fields use the same data but headers reflect Spanish translations.",
            "preReqs": "Spanish supported (per i18n config).",
            "whereToLook": "synrgy-app/app/drug-detail.tsx:84-85",
            "estimatedMinutes": 4
          }
        ]
      },
      {
        "title": "HRA service screen entry",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "sv-23",
            "text": "Open HRA from menu — list of assessments with Start CTA",
            "expected": "Tap Health Risk Assessment from the service menu. /hra loads, showing the intro card with stats and Start New HRA button. If a server error occurs in dev environments, document and flag as 'blocked — environment'.",
            "preReqs": "On the service menu.",
            "whereToLook": "synrgy-app/app/hra.tsx",
            "estimatedMinutes": 3
          },
          {
            "id": "sv-24",
            "text": "Start New HRA → wizard begins immediately at section 1",
            "expected": "Tap Start New HRA. The wizard launches into the first section with a progress bar showing '1 / N'. If a 'Continue active visit' popup appears (cross-feature interference), tap No.",
            "preReqs": "On /hra, no in-progress assessment.",
            "whereToLook": "synrgy-app/app/hra.tsx:48-54; synrgy-app/app/hra-wizard.tsx",
            "estimatedMinutes": 3
          }
        ]
      },
      {
        "title": "Profile and family management",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "sv-50",
            "text": "Edit profile — modify name and address, save persists",
            "expected": "From the service menu, tap Profile. /edit-profile loads with current member fields filled. Change first name, last name, and address. Tap Save. A success alert appears. Navigate away and back; the changes persist.",
            "preReqs": "On the service menu.",
            "whereToLook": "synrgy-app/app/edit-profile.tsx:48, 75-88",
            "estimatedMinutes": 4
          },
          {
            "id": "sv-51",
            "text": "Edit profile required-field validation blocks save",
            "expected": "Clear the first name field, tap Save. An inline error appears; save is blocked. Filling the field unblocks save.",
            "preReqs": "On /edit-profile.",
            "whereToLook": "synrgy-app/app/edit-profile.tsx:68-69",
            "estimatedMinutes": 3
          },
          {
            "id": "sv-52",
            "text": "Add dependent — spouse (full adult form required)",
            "expected": "On /family, tap the add-dependent button. Select Spouse. The full adult form is shown (name, DOB, gender, SSN, address, phone, email). Fill all required fields and save. The dependent appears in the family list.",
            "preReqs": "On the service menu. Primary member.",
            "whereToLook": "synrgy-app/app/family.tsx:121; synrgy-app/app/add-dependent.tsx:87, 90-96, 127",
            "estimatedMinutes": 5
          },
          {
            "id": "sv-53",
            "text": "Add dependent — child <18 (minor form only)",
            "expected": "Tap add-dependent, select Child. Enter a DOB making the child <18 years old. The adult-only section (email, phone, address) is hidden. Save with minor-only fields. Dependent is added.",
            "preReqs": "On /family.",
            "whereToLook": "synrgy-app/app/add-dependent.tsx:87 (age check)",
            "estimatedMinutes": 4
          },
          {
            "id": "sv-54",
            "text": "Delete dependent with confirmation alert",
            "expected": "On /family, tap the delete icon on a dependent card. A confirmation alert appears. Tap Delete in the alert. The dependent is removed from the list. Tap Cancel to abort — no change.",
            "preReqs": "At least one dependent exists.",
            "whereToLook": "synrgy-app/app/family.tsx:67-88",
            "estimatedMinutes": 4
          },
          {
            "id": "sv-55",
            "text": "Invite adult dependent — email sent",
            "expected": "For an adult dependent without an account, tap the mail icon. A backend call sends an invitation email. A success alert with the dependent's email appears.",
            "preReqs": "An adult dependent without an account exists on the family list.",
            "whereToLook": "synrgy-app/app/family.tsx:100-104",
            "estimatedMinutes": 3
          }
        ]
      },
      {
        "title": "Health Plans (Uptyck SDK)",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "sv-56",
            "text": "Open Health Plans — list scaffolding renders",
            "expected": "Tap Health Plan Unlock / Health Plans from the menu. /health-plan loads with an intro card, an empty state if no plans, or a list of local card-scan plans and Uptyck-uploaded documents.",
            "preReqs": "CB service config includes health-plan-unlock.",
            "whereToLook": "synrgy-app/app/health-plan.tsx:154-249",
            "estimatedMinutes": 3
          },
          {
            "id": "sv-57",
            "text": "Add a plan via card scan",
            "expected": "Tap the camera/photo library button. After capturing or selecting an image, the scanning screen appears with animated scan overlay. OCR runs. The form moves to the confirm step where you select a payer and verify member info. Tap Activate. The plan is added to the local list.",
            "preReqs": "Camera + photo library permissions granted.",
            "whereToLook": "synrgy-app/app/add-plan.tsx",
            "estimatedMinutes": 6
          },
          {
            "id": "sv-58",
            "text": "OCR failure on card scan — manual entry path still works",
            "expected": "If OCR fails (force by submitting an unrelated image), an alert appears. The form still proceeds to the confirm step with empty fields. The user can search a payer manually, fill member info, and Activate.",
            "preReqs": "On add-plan w/ scanning underway.",
            "whereToLook": "synrgy-app/app/add-plan.tsx:191-196",
            "estimatedMinutes": 4
          },
          {
            "id": "sv-59",
            "text": "Upload plan PDF — Uptyck 3-step upload completes",
            "expected": "On /health-plan, tap Upload Document. /upload-plan opens. Select a PDF, enter a plan name, choose a plan type. Tap Submit. A spinner appears. Uptyck creates the plan record, the app PUTs the file to S3, then confirms the upload. Success screen with Done button appears.",
            "preReqs": "A test PDF file available on the device.",
            "whereToLook": "synrgy-app/app/upload-plan.tsx; synrgy-app/services/uptyck.ts:40-78",
            "estimatedMinutes": 6
          },
          {
            "id": "sv-60",
            "text": "Uptyck plan polls every 5 seconds while processing",
            "expected": "After uploading a plan, return to /health-plan. The plan appears with a 'processing' status (amber). The list re-fetches every 5 seconds until status becomes 'ready' (green). Verify by waiting and observing the auto-update.",
            "preReqs": "Just uploaded a plan.",
            "whereToLook": "synrgy-app/app/health-plan.tsx:76-86",
            "estimatedMinutes": 5
          },
          {
            "id": "sv-61",
            "text": "Plan chat available only when status === 'ready'",
            "expected": "Uptyck plan cards show 'Ask a Question' pill only when status is 'ready'. Cards in 'processing' or 'error' state do not show the pill and are not tappable to /plan-chat.",
            "preReqs": "Plans in different statuses present.",
            "whereToLook": "synrgy-app/app/health-plan.tsx:207-208, 233-238",
            "estimatedMinutes": 3
          },
          {
            "id": "sv-62",
            "text": "Plan chat (Uptyck RAG) answers plan-specific questions",
            "expected": "Tap a ready plan card. /plan-chat opens. Ask a question about your plan (e.g., 'What's my deductible?'). Uptyck responds using the plan document as RAG context.",
            "preReqs": "Plan in 'ready' state.",
            "whereToLook": "synrgy-app/app/plan-chat.tsx",
            "estimatedMinutes": 5
          },
          {
            "id": "sv-63",
            "text": "PATH-A — Local card-scan plan does NOT persist across app restart (expected to fail)",
            "expected": "Add a plan via card scan (local plan, sourced from planStore Zustand). Force-close the app. Reopen. The card-scan plan is GONE from the list. This is the current behavior because the Zustand store is not AsyncStorage-backed. This check is currently expected to FAIL until persistence is added. Record as 'fail' so the gap is tracked.",
            "preReqs": "Added at least one local card-scan plan.",
            "whereToLook": "synrgy-app/stores/planStore.ts (no AsyncStorage)",
            "estimatedMinutes": 4,
            "failureGuidance": "Expected to FAIL — this surfaces a known persistence bug. Mark as fail and log so engineering can address."
          },
          {
            "id": "sv-64",
            "text": "Delete plan with confirmation alert",
            "expected": "On /health-plan, tap the delete button on a plan card. Confirmation alert appears. Confirm. Uptyck plan is deleted server-side and removed from list. Local plans are removed from Zustand only.",
            "preReqs": "At least one plan exists.",
            "whereToLook": "synrgy-app/app/health-plan.tsx:88-112",
            "estimatedMinutes": 3
          }
        ]
      },
      {
        "title": "Provider Locator (Low-Cost Care / Goodbill)",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "sv-65",
            "text": "Open Provider Locator — 501(r) intro + household income status card",
            "expected": "Tap Provider Locator from the service menu. The screen shows an intro about 501(r) financial assistance and a household income status card (either prompting to add income or showing current income + size with an edit option).",
            "preReqs": "CB service config includes provider-locator.",
            "whereToLook": "synrgy-app/app/provider-locator.tsx:221-273",
            "estimatedMinutes": 3
          },
          {
            "id": "sv-66",
            "text": "Add household income via modal",
            "expected": "Tap the income card or Edit. The IncomeModal opens. Enter an annual income (with thousands formatting), household size (1-99). Tap Save. updateHouseholdData is called. Modal closes; the card now shows the entered values.",
            "preReqs": "On /provider-locator.",
            "whereToLook": "synrgy-app/app/provider-locator.tsx:412-519, 447-451",
            "estimatedMinutes": 4
          },
          {
            "id": "sv-67",
            "text": "Zip search returns providers in the area",
            "expected": "Enter a valid 5-digit zip. Tap Search. searchProviders runs with goodbill network + hospital type. Results appear in cards: name, address, distance, financial assistance badge if applicable.",
            "preReqs": "Household income set (or skip on confirm).",
            "whereToLook": "synrgy-app/app/provider-locator.tsx:120-110, 337-381",
            "estimatedMinutes": 4
          },
          {
            "id": "sv-68",
            "text": "Use My Location geocodes to nearby providers",
            "expected": "Tap Use My Location. After location permission, the app reverse-geocodes to a zip and runs the same search. Results appear.",
            "preReqs": "Location permission granted.",
            "whereToLook": "synrgy-app/app/provider-locator.tsx:300-316",
            "estimatedMinutes": 4
          },
          {
            "id": "sv-69",
            "text": "Provider card — tap Phone opens dialer; tap Directions opens maps",
            "expected": "On a provider card, tap the Phone icon to open the dialer with the provider's number. Tap Navigation icon to open Apple Maps (iOS) or Google Maps (Android) with the destination.",
            "preReqs": "Provider results visible.",
            "whereToLook": "synrgy-app/app/provider-locator.tsx:369-379",
            "estimatedMinutes": 4
          },
          {
            "id": "sv-70",
            "text": "Provider Locator error states (invalid zip, geocode fail, no results)",
            "expected": "Try invalid zip (e.g., '1234') — alert appears. Try a remote zip with no providers — empty state 'No providers found' appears. Try zip + offline — error message in list. Each error shows an actionable message.",
            "preReqs": "Various edge inputs.",
            "whereToLook": "synrgy-app/app/provider-locator.tsx:121, 134, 141, 145, 388",
            "estimatedMinutes": 5
          }
        ]
      },
      {
        "title": "Health Content Library (Mayo Clinic)",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "sv-71",
            "text": "Search Health Content (min 2 chars, debounced)",
            "expected": "Tap Health Content from the service menu. Type a query of at least 2 characters in the search box. After ~500ms, search results appear as cards (icon + title + content type badge + preview text).",
            "preReqs": "CB service config includes health-content-library.",
            "whereToLook": "synrgy-app/app/health-content.tsx:141-159, 234-275",
            "estimatedMinutes": 3
          },
          {
            "id": "sv-72",
            "text": "Open content detail — type-specific renderer (Article)",
            "expected": "Tap an article result. The detail screen shows title, content-type badge, and sectioned HTML rendered via react-native-render-html (paragraphs, headings, bold, links). Disclaimer if applicable.",
            "preReqs": "Search results include an article.",
            "whereToLook": "synrgy-app/app/health-content.tsx:412-445",
            "estimatedMinutes": 3
          },
          {
            "id": "sv-73",
            "text": "Video content plays via Mux HLS",
            "expected": "On a video result, the detail screen renders an embedded video player. Native controls work. If the video URL is unavailable, a placeholder 'Video is being prepared…' message appears.",
            "preReqs": "Search results include a video.",
            "whereToLook": "synrgy-app/app/health-content.tsx:611-637",
            "estimatedMinutes": 4
          },
          {
            "id": "sv-74",
            "text": "Recipe detail shows servings, ingredients, nutrient table",
            "expected": "Open a Recipe content item. The detail shows serving info badge, abstract, optional dietitian tip box, directions section, ingredients section, and a nutrient analysis table.",
            "preReqs": "Search results include a recipe.",
            "whereToLook": "synrgy-app/app/health-content.tsx:509-555",
            "estimatedMinutes": 4
          },
          {
            "id": "sv-75",
            "text": "SlideShow detail — chevron navigation with counter",
            "expected": "Open a SlideShow content item. Left/Right chevron buttons navigate slides. A counter shows 'X / Y'. Chevrons disable at start/end.",
            "preReqs": "Search results include a slideshow.",
            "whereToLook": "synrgy-app/app/health-content.tsx:557-609",
            "estimatedMinutes": 4
          }
        ]
      },
      {
        "title": "At-Home Testing (UI-only, backend simulated)",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "sv-76",
            "text": "Open At-Home Testing — available kits + prior orders",
            "expected": "Tap At Home Testing from the service menu. The landing screen shows available kit cards (name, price, panel chips, Learn More + Order Kit buttons) and a Prior Orders section with status icons (Truck=ordered, Clock=pending, CheckCircle=completed).",
            "preReqs": "CB service config includes at-home-testing.",
            "whereToLook": "synrgy-app/app/at-home-testing.tsx:66-168",
            "estimatedMinutes": 3
          },
          {
            "id": "sv-77",
            "text": "Testing info screen renders 4-step flowchart + Mux video",
            "expected": "Tap Learn More on a kit card. /testing-info loads with the 4-step Order → Collect → Return → Get Results flowchart, a Mux HLS video with play overlay, and a 'Good to Know' tips section.",
            "preReqs": "On at-home-testing.",
            "whereToLook": "synrgy-app/app/testing-info.tsx",
            "estimatedMinutes": 4
          },
          {
            "id": "sv-78",
            "text": "Order test kit — shipping + payment form simulated submission",
            "expected": "Tap Order Kit. /order-test-kit loads with a shipping form (auto-filled from cbMember) and payment form (card number formatted XXXX XXXX XXXX XXXX, MM/YY expiry, CVC). All fields required. Tap Submit. A 1.5-second loading state appears. A confirmation alert displays the address and kit name. Test note: this is currently a UI-only simulation; no kit will actually ship.",
            "preReqs": "On a kit card from /at-home-testing.",
            "whereToLook": "synrgy-app/app/order-test-kit.tsx:86-94",
            "estimatedMinutes": 6,
            "notes": "Order submission is a 1.5s setTimeout simulation. No real Stripe/shipping backend exists for this flow."
          },
          {
            "id": "sv-79",
            "text": "Test results screen with abnormal vs normal split",
            "expected": "From at-home-testing, tap a completed prior order. /test-results loads. Out-of-range results appear in a section with left red border; normal results in a section with neutral border. Each result can expand for explanation.",
            "preReqs": "Completed prior order in mock data.",
            "whereToLook": "synrgy-app/app/test-results.tsx:111-182",
            "estimatedMinutes": 4
          },
          {
            "id": "sv-80",
            "text": "Test results AI Summary is a hardcoded placeholder (do NOT verify personalization)",
            "expected": "On /test-results, an 'AI Summary' section appears when out-of-range results exist. The text is currently a hardcoded placeholder analyzing example metrics (glucose, LDL, ApoB), NOT generated from the user's actual results. Tester should verify the section renders, not that the text matches the user's data.",
            "preReqs": "On a test-results screen with abnormal results.",
            "whereToLook": "synrgy-app/app/test-results.tsx:145-154",
            "estimatedMinutes": 3,
            "notes": "AI Summary is placeholder text in v2.0.0. Personalization is not yet implemented."
          }
        ]
      },
      {
        "title": "Insurance Scan + Eligibility",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "sv-81",
            "text": "Open Insurance Scan — capture, scan, verify flow",
            "expected": "From the service menu, open insurance scan. The capture state offers Take Photo, Upload Photo, or Manual Entry. Scanning state shows a 'Scanning insurance card…' spinner. Verify state shows a payer search dropdown and member info form pre-filled from getMemberDetails.",
            "preReqs": "CB service config includes insurance-scan (or app entry point exists).",
            "whereToLook": "synrgy-app/app/insurance-scan.tsx:177-355",
            "estimatedMinutes": 5
          },
          {
            "id": "sv-82",
            "text": "Payer search (debounced 200ms) populates dropdown",
            "expected": "Type a payer name (e.g., 'Aetna'). After ~200ms, a dropdown of matching payers appears. Tap one — it is selected, dropdown closes, CheckCircle icon appears.",
            "preReqs": "On the verify state of insurance-scan.",
            "whereToLook": "synrgy-app/app/insurance-scan.tsx:244-289",
            "estimatedMinutes": 3
          },
          {
            "id": "sv-83",
            "text": "Verify eligibility → /insurance-benefits with eligibility status",
            "expected": "Fill all fields, tap Verify Eligibility. A 'Verifying…' spinner appears. On success, the app navigates to /insurance-benefits showing eligibility status (green card), plan overview, cost-sharing, remaining-this-year, and copays.",
            "preReqs": "Valid test payer + member info.",
            "whereToLook": "synrgy-app/app/insurance-scan.tsx:145-157; synrgy-app/app/insurance-benefits.tsx:86-170",
            "estimatedMinutes": 5
          },
          {
            "id": "sv-84",
            "text": "Insurance scan failure paths handled",
            "expected": "Test paths: camera permission denied → alert; OCR fails → alert + return to verify (manual entry); eligibility check fails → alert + return to verify. Each shows actionable messaging.",
            "preReqs": "Force various failures.",
            "whereToLook": "synrgy-app/app/insurance-scan.tsx:85-87, 114-116, 159-160",
            "estimatedMinutes": 5
          }
        ]
      },
      {
        "title": "Hospital Indemnity (UI-only claim submission)",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "sv-85",
            "text": "Open Hospital Indemnity — plan selector + benefit schedule + recent claims",
            "expected": "Tap Hospital Indemnity from the menu. The landing screen shows a plan selector chiplist, a benefit schedule table mapping insured events to limits and amounts, a 'Submit New Claim' CTA, and up to 3 recent claims (or empty state).",
            "preReqs": "CB service config includes hospital-indemnity.",
            "whereToLook": "synrgy-app/app/hospital-indemnity.tsx:39-155",
            "estimatedMinutes": 4
          },
          {
            "id": "sv-86",
            "text": "View claims history — all claims (no pagination)",
            "expected": "Tap 'View all claims'. /hi-claims loads with all prior claims (or empty state). Each card shows submitted date, plan, service count, claim total, and status badge (currently 'Submitted' hardcoded).",
            "preReqs": "On /hospital-indemnity.",
            "whereToLook": "synrgy-app/app/hi-claims.tsx",
            "estimatedMinutes": 3
          },
          {
            "id": "sv-87",
            "text": "Open claim detail — member info, line items, documents",
            "expected": "Tap a claim. /hi-claim-detail loads showing member info card, services line items, claim total, and documents thumbnail grid (if documents exist).",
            "preReqs": "At least one claim exists.",
            "whereToLook": "synrgy-app/app/hi-claim-detail.tsx:56-136",
            "estimatedMinutes": 3
          },
          {
            "id": "sv-88",
            "text": "New claim wizard — demographics + add service entries",
            "expected": "Tap Submit New Claim. /hi-new-claim loads. Demographics section is read-only from getMemberDetails. Services section has one default entry (description, date of service, provider, amount). Add Entry button creates new entries. Remove button (X) removes entries (cannot remove if only one exists).",
            "preReqs": "On /hospital-indemnity.",
            "whereToLook": "synrgy-app/app/hi-new-claim.tsx:229-304",
            "estimatedMinutes": 5
          },
          {
            "id": "sv-89",
            "text": "New claim wizard — upload documents via camera + gallery",
            "expected": "Tap Take Photo or Choose Photo. Camera or gallery opens. After capture/selection, the document thumbnail appears in the grid. Tap X to remove a document.",
            "preReqs": "On hi-new-claim, camera + photo library permission granted.",
            "whereToLook": "synrgy-app/app/hi-new-claim.tsx:306-362, 117-135",
            "estimatedMinutes": 5
          },
          {
            "id": "sv-90",
            "text": "New claim wizard — certification checkbox + signature canvas",
            "expected": "Check the certification checkbox. Draw a signature on the signature canvas. The Clear button erases it. While drawing, page scroll is locked.",
            "preReqs": "On hi-new-claim.",
            "whereToLook": "synrgy-app/app/hi-new-claim.tsx:364-407",
            "estimatedMinutes": 4
          },
          {
            "id": "sv-91",
            "text": "Submit button gated until canSubmit is satisfied",
            "expected": "The Submit button is disabled until: all service entries have provider+description+date+amount > 0, at least one document is uploaded, certification is checked, and a signature is drawn. Once all conditions are met, the button activates.",
            "preReqs": "On hi-new-claim with partial form.",
            "whereToLook": "synrgy-app/app/hi-new-claim.tsx:97-107, 411",
            "estimatedMinutes": 4
          },
          {
            "id": "sv-92",
            "text": "Submit new claim — UI-only success path (no backend POST)",
            "expected": "Tap Submit Claim. The claim is persisted to the local Zustand store (no backend API call in v2.0.0). A success screen with checkmark, 'Submit another claim', and 'Done' buttons appears. Tester note: nothing is sent to a carrier; this is currently a client-side flow.",
            "preReqs": "All fields filled, canSubmit true.",
            "whereToLook": "synrgy-app/app/hi-new-claim.tsx:141-162, 213-226",
            "estimatedMinutes": 4,
            "notes": "Claim submission is UI-only — no backend API call. Verify the UI flow, not carrier-side receipt."
          },
          {
            "id": "sv-93",
            "text": "Compliance — no 'rewards/earn/points/credits' in HI screens",
            "expected": "Walk through all HI screens (landing, claims list, claim detail, new claim wizard). Confirm no occurrence of 'rewards', 'earn', 'points', 'credits'. Insured events are referenced as 'services' for claim line items.",
            "preReqs": "General observation across HI flows.",
            "whereToLook": "Manual scan of hi-*.tsx files",
            "estimatedMinutes": 5,
            "failureGuidance": "Hard compliance fail if any prohibited terminology appears."
          }
        ]
      },
      {
        "title": "Tax Hotline",
        "platform": "SYNRGY app",
        "path": "core",
        "checks": [
          {
            "id": "sv-94",
            "text": "Open Tax Hotline — feature cards + web portal + phone CTA",
            "expected": "Tap Tax Hotline from the service menu. The screen shows 5 feature cards (federal filing, bilingual, quick turnaround, unlimited, prep+filing), a 'Visit Web Portal' button, and a 'Call Tax Hotline' button.",
            "preReqs": "CB service config includes tax-hotline.",
            "whereToLook": "synrgy-app/app/tax-hotline.tsx:79-112",
            "estimatedMinutes": 3
          },
          {
            "id": "sv-95",
            "text": "Visit Web Portal opens https://synrgy.bmdgateway.com in browser",
            "expected": "Tap Visit Web Portal. An in-app web browser (or external browser) opens to synrgy.bmdgateway.com. Verify the URL is correct.",
            "preReqs": "On /tax-hotline.",
            "whereToLook": "synrgy-app/app/tax-hotline.tsx:104-107",
            "estimatedMinutes": 2
          },
          {
            "id": "sv-96",
            "text": "Call Tax Hotline opens phone dialer to 844-379-0062",
            "expected": "Tap Call Tax Hotline. The OS phone dialer opens with tel:18443790062 (display '844-379-0062').",
            "preReqs": "Native device.",
            "whereToLook": "synrgy-app/app/tax-hotline.tsx:109-112",
            "estimatedMinutes": 2
          }
        ]
      }
    ]
  },

  // ─── SCENARIO 9: Member disengagement & recovery ───
  {
    "id": "member-recovery",
    "persona": "Member",
    "icon": "R",
    "color": "#854F0B",
    "bg": "#FAEEDA",
    "title": "App deletion, re-engagement & recovery",
    "summary": "Member deletes the app or revokes specific permissions; verifies that re-installing recovers the account via Synrgy auth + derived-password CB re-auth, and that permission revocation properly disables associated features within the app.",
    "steps": [
      {
        "title": "Re-install and recover the account",
        "platform": "SYNRGY app",
        "path": "path-c",
        "checks": [
          {
            "id": "mr-9",
            "text": "Re-download the app and log in — existing account recovered",
            "expected": "After deleting and re-installing the app, open it. Tap Sign In (not Create Account). Enter the original email and password. The app recognizes the existing Synrgy auth account. No new account is created. The Synrgy API also auto-refreshes the CB token via /cb-session using the derived password.",
            "preReqs": "Account previously existed. App was deleted from device.",
            "whereToLook": "synrgy-app/app/login.tsx; synrgy-app/services/auth-api.ts (cb-session)",
            "estimatedMinutes": 5
          },
          {
            "id": "mr-10",
            "text": "Previous app-side data is intact post-re-login",
            "expected": "After re-login, navigate through the app. Verify the following app-side data is present and matches what existed before deletion: HRA results on /hra-results, face scan history on /vitals-scan, VUC visit history on /visits, family on /family. Note: this is app-visible data only; we are not asserting admin-portal state.",
            "preReqs": "Re-installed app, logged in with original credentials. Member had data before deletion.",
            "whereToLook": "Cross-screen verification: hra.tsx, vitals-scan.tsx, visits.tsx, family.tsx",
            "estimatedMinutes": 5,
            "notes": "App-side verification only. Upstream admin-portal verification is out of scope per Phase 1 decision."
          },
          {
            "id": "mr-11",
            "text": "Re-install on a fresh device re-runs onboarding visuals but CB link is seamless",
            "expected": "After re-installing on the same device, AsyncStorage is empty so onboarding video and slides may replay (intentional). However, the user does NOT need to re-verify CB membership: the Synrgy API auto-re-authenticates with CB using the derived password during the post-login /cb-session call. The user lands on home without a verify-member step.",
            "preReqs": "Re-installed app on the same device.",
            "whereToLook": "synrgy-app/app/_layout.tsx (AuthGate); synrgy-app/services/auth-api.ts; synrgy-app/app/onboarding.tsx:112-118",
            "estimatedMinutes": 6
          },
          {
            "id": "mr-12",
            "text": "Device-level permissions are prompted again on a fresh install",
            "expected": "On re-install, OS-level permissions were lost. During the post-login onboarding flow, the app prompts again for Health, Mic, Camera, Notifications, and Location, in the documented order.",
            "preReqs": "Re-installed app (fresh OS permissions).",
            "whereToLook": "synrgy-app/app/onboarding.tsx:175-216",
            "estimatedMinutes": 5
          }
        ]
      },
      {
        "title": "Permission revocation (without deletion)",
        "platform": "SYNRGY app",
        "path": "path-c",
        "checks": [
          {
            "id": "mr-13",
            "text": "Revoking Health permission stops Sahha background sync and guidance generation",
            "expected": "Go to device Settings → SYNRGY → revoke Health Connect (Android) / HealthKit (iOS) permission. Return to the app. Sahha is no longer authenticated. Sahha background sync stops. Over time, new guidance based on Sahha-fed events stops being generated.",
            "preReqs": "Health permission currently granted. Sahha previously authenticated.",
            "whereToLook": "synrgy-app/services/sahha.ts; OS health permission",
            "estimatedMinutes": 5,
            "notes": "Guidance generation pause is delayed by hours since it's server-side."
          },
          {
            "id": "mr-14",
            "text": "Revoking Notifications stops push delivery",
            "expected": "Revoke Notifications in device settings. Push notifications no longer arrive. In-app features (action cards, Orb, etc.) continue working.",
            "preReqs": "Notifications permission currently granted.",
            "whereToLook": "OS notification permission",
            "estimatedMinutes": 4
          },
          {
            "id": "mr-17",
            "text": "Revoking Camera disables face vitals scan and VUC video",
            "expected": "Revoke Camera permission. Tap Start Scan on /vitals-scan — the OS prompts again or shows a permission-blocked state. Start a VUC visit — the visit cannot establish the video stream until camera is re-enabled.",
            "preReqs": "Camera permission currently granted.",
            "whereToLook": "synrgy-app/app/vitals-scanner.native.tsx; components/tm/TMComponentSlots.tsx:50-67",
            "estimatedMinutes": 4
          },
          {
            "id": "mr-18",
            "text": "Revoking Microphone disables voice on home Orb",
            "expected": "Revoke Microphone. Tap the Orb to initiate voice. The OS prompts again or shows a blocked state. The voice session cannot start.",
            "preReqs": "Microphone permission currently granted.",
            "whereToLook": "synrgy-app/app/index.tsx (useSynrgyVoice)",
            "estimatedMinutes": 3
          },
          {
            "id": "mr-16",
            "text": "Re-enabling a previously revoked permission activates the feature immediately",
            "expected": "Re-enable any previously revoked permission in device settings. Return to the app. The associated feature works again without restarting the app.",
            "preReqs": "Just re-enabled a permission.",
            "whereToLook": "OS reactive permission model",
            "estimatedMinutes": 3
          }
        ]
      },
      {
        "title": "Logout vs delete distinction",
        "platform": "SYNRGY app",
        "path": "path-c",
        "checks": [
          {
            "id": "mr-19",
            "text": "Logout clears all tokens and routes to onboarding auth-choice step",
            "expected": "From the service menu, tap Log Out. The app calls signOut(), deauthenticates Sahha, clears AsyncStorage tokens, and routes to /onboarding step 4 (auth choice). All cached user data is gone from the app instance.",
            "preReqs": "Logged in.",
            "whereToLook": "synrgy-app/context/AuthContext.tsx (logout); synrgy-app/services/token.ts",
            "estimatedMinutes": 3
          },
          {
            "id": "mr-20",
            "text": "Re-login after logout on same device is seamless (no re-onboard, no re-verify-member)",
            "expected": "After logout, log back in on the same device with the same credentials. The app lands on home directly. AsyncStorage @synrgy:onboarding_complete persists so onboarding is skipped. /cb-session call re-authenticates CB transparently. No verify-member screen appears.",
            "preReqs": "Just logged out on a device where onboarding was completed.",
            "whereToLook": "synrgy-app/app/_layout.tsx (AuthGate); synrgy-app/services/auth-api.ts (cb-session)",
            "estimatedMinutes": 4
          }
        ]
      }
    ]
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
          {
            id: "du-1",
            text: "Group-level engagement metrics show: active members, avg engagement score, feature usage breakdown",
            expected: "In the admin portal, navigate to the group's analytics page. Metrics display: number of active members, average engagement score (or similar metric), and a feature usage breakdown (which features are being used and by how many members).",
            preReqs: "Members have been using the app. Admin portal accessible.",
          },
          {
            id: "du-2",
            text: "Member-level status is accurate: active, inactive, terminated, pending",
            expected: "Check several members' statuses in the admin portal against their actual state (app installed and active = Active, app deleted = Inactive, etc.). All statuses are accurate and current.",
            preReqs: "Multiple members exist in various states.",
          },
          {
            id: "du-3",
            text: "Covered event log is complete with correct event types and timestamps",
            expected: "The admin portal's covered event log shows every qualifying event (virtual visits, screenings, HRA, etc.) with accurate event types and timestamps. Compare against test actions you performed.",
            preReqs: "Members have performed qualifying actions.",
          },
          {
            id: "du-4",
            text: "BEEP outreach funnel (sent → delivered → opened → clicked → enrolled) is accurate",
            expected: "The BEEP analytics show the correct funnel progression. Numbers at each stage make logical sense (each stage is ≤ previous stage). Compare enrolled count against actual enrolled members.",
            preReqs: "BEEP outreach has been running for this group.",
          },
        ],
      },
      {
        title: "Broker portal data",
        platform: "Infinity portal",
        path: "core",
        checks: [
          {
            id: "du-5",
            text: "Broker can view engagement trends for their groups",
            expected: "In the Infinity Portal, navigate to the group's engagement section. Trend data shows over time (chart or table) how engagement metrics have changed. Data is recent and reflects actual activity.",
            preReqs: "Logged in as the broker. Group has engagement data.",
          },
          {
            id: "du-6",
            text: "Enrollment rate and feature adoption metrics are accurate",
            expected: "Enrollment rate (enrolled ÷ total members) is accurate. Feature adoption metrics (% using virtual care, vitals, etc.) match actual usage. Spot-check a few numbers.",
            preReqs: "On the group analytics page in the broker portal.",
          },
          {
            id: "du-7",
            text: "Broker cannot see individual member PHI (COMPLIANCE)",
            expected: "Review every data point visible to the broker. NO individual member health data (diagnoses, vitals, medications, visit details) is visible. Only aggregate data and enrollment status are shown.",
            preReqs: "On the broker portal viewing group data.",
          },
        ],
      },
      {
        title: "Employer portal data",
        platform: "Client portal",
        path: "core",
        checks: [
          {
            id: "du-8",
            text: "Aggregated utilization data matches admin portal data",
            expected: "Compare the utilization data on the employer portal with the same data on the admin portal. Totals (virtual care visits, screenings, etc.) should match between the two portals.",
            preReqs: "Both admin and employer portals accessible.",
          },
          {
            id: "du-9",
            text: "Enrollment counts (enrolled, pending, opted-out) match actual member statuses",
            expected: "The employer portal's enrollment counts match the actual member statuses in the admin portal. If 47 members are enrolled in admin portal, the employer portal also shows 47 enrolled.",
            preReqs: "On the employer portal dashboard.",
          },
          {
            id: "du-10",
            text: "Payroll deduction summary matches plan configuration",
            expected: "The payroll deduction amounts shown on the employer portal match the plan configuration (per-employee deduction amount × number of enrolled employees). Any discrepancy is a defect.",
            preReqs: "On the employer portal payroll section.",
          },
          {
            id: "du-11",
            text: "No individual PHI exposed in any report or export (COMPLIANCE)",
            expected: "Download or view every available report and export on the employer portal. NO individual member health data appears anywhere. All data is aggregated. Test both on-screen views and downloaded files.",
            preReqs: "On the employer portal, checking all reports and exports.",
          },
        ],
      },
      {
        title: "CBS/TPA data",
        platform: "CBS/TPA system",
        path: "core",
        checks: [
          {
            id: "du-12",
            text: "CBS sees correct member roster with current statuses",
            expected: "In the CBS system, the member roster shows all members with their current statuses (Active, Inactive, Terminated). Statuses match the admin portal and reflect recent changes.",
            preReqs: "CBS/TPA system accessible.",
          },
          {
            id: "du-13",
            text: "Termination and tier change events from CBS are reflected in app and admin portal",
            expected: "When CBS terminates a member or changes a tier, the change appears in both the admin portal and the member's app experience. Verify propagation direction: CBS → admin → app.",
            preReqs: "CBS has made a recent status change to a member.",
          },
          {
            id: "du-14",
            text: "ACH payment records match covered event totals",
            expected: "ACH payment records in the CBS system match the total covered events. The payment amounts correspond to the correct number of qualifying events at the correct per-event rate.",
            preReqs: "Covered events exist and ACH payments have been processed.",
          },
        ],
      },
      {
        title: "Cross-platform data consistency",
        platform: "All",
        path: "path-c",
        checks: [
          {
            id: "du-15",
            text: "Member count in admin portal = member count in CBS = roster count in employer portal",
            expected: "Check the total member count across all three portals (Admin, CBS, Client). All three numbers should be identical. Any discrepancy indicates a data sync issue.",
            preReqs: "Access to admin portal, CBS system, and client portal for the same group.",
          },
          {
            id: "du-16",
            text: "Covered event count in admin portal matches the member's in-app history",
            expected: "For a specific member, count covered events in the admin portal. Compare against the member's in-app event/visit history. Counts should match.",
            preReqs: "A member with covered events. Both admin portal and app accessible.",
          },
          {
            id: "du-17",
            text: "A change made in CBS (e.g., termination) propagates to admin, employer, and app",
            expected: "Make a change in CBS (e.g., terminate a member). Within the expected sync interval, verify the change appears in: admin portal (member status), employer portal (roster), and the app (access denied for terminated member).",
            preReqs: "CBS system access. About to make a test change.",
          },
          {
            id: "du-18",
            text: "A status change in admin (e.g., deactivation) propagates to CBS and employer portal",
            expected: "Make a status change in the admin portal. Verify it propagates to CBS (member status update) and the employer portal (roster update). Check within the expected sync interval.",
            preReqs: "Admin portal access. About to make a test change.",
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

export function getScenarioStats(scenario: Scenario) {
  const totalCheckpoints = scenario.steps.reduce((sum, s) => sum + s.checks.length, 0);
  const estimatedMinutes = Math.round((totalCheckpoints * 2) / 5) * 5 || 5;
  const platforms = [...new Set(scenario.steps.map((s) => s.platform))];
  return { totalCheckpoints, estimatedMinutes, platforms, stepCount: scenario.steps.length };
}
