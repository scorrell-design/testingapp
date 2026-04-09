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
    id: "registration-login",
    persona: "Member",
    icon: "L",
    color: "#0C447C",
    bg: "#E6F1FB",
    title: "App registration & login",
    summary:
      "Member registers for the first time, verifies email, logs in, and tests password reset. Covers both success and failure paths.",
    steps: [
      {
        title: "Failed registration",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          {
            id: "rl-1",
            text: "Attempt to register with invalid information",
            expected: "Tap 'Sign Up'. You are taken to a 'Find Your Account' screen. There is a button to log in instead, which takes you to login credentials — hitting back returns you to 'Find Your Account'. All fields must be filled before you can continue. Upon entering random/invalid info, you see a screen saying your information was not found with a 'Try Again' button. Tapping 'Try Again' takes you back to the form.",
            preReqs: "App freshly installed, not logged in.",
          },
          {
            id: "rl-2",
            text: "Verify field-level validation on registration form",
            expected: "Leaving any required field blank prevents submission. DOB field accepts only valid date format. Zip code field accepts only 5-digit numeric input. Last name field is case-insensitive (test with uppercase and lowercase — both should work).",
            preReqs: "On the 'Find Your Account' screen.",
          },
        ],
      },
      {
        title: "Successful registration",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          {
            id: "rl-3",
            text: "Register with valid test credentials",
            expected: "After entering valid info, you are taken to a 'Create Your Account' screen to set email and password. You can navigate back and forth between pages. After creating credentials, you are taken to an email verification screen. After verifying email, you are taken to the onboarding flow.",
            preReqs: "Valid member with eligibility record. Test info: DOB 01/01/2000, your actual last name, zip 12345.",
          },
          {
            id: "rl-4",
            text: "Email verification completes successfully",
            expected: "Verification email arrives within 2 minutes. Clicking the link in the email (or entering the code) returns you to the app. App proceeds to onboarding.",
            preReqs: "Just completed account credential creation.",
          },
        ],
      },
      {
        title: "Login flows",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          {
            id: "rl-5",
            text: "Log in with valid credentials",
            expected: "Tap 'Login'. Enter email and password. App takes you to the home screen (or onboarding if not yet completed).",
            preReqs: "Account already created.",
          },
          {
            id: "rl-6",
            text: "Attempt login with invalid credentials",
            expected: "Entering wrong email/password shows an error message stating credentials are invalid. Does not reveal whether the email exists in the system.",
            preReqs: "On the login screen.",
          },
        ],
      },
      {
        title: "Password reset",
        platform: "SYNRGY app",
        path: "path-a",
        checks: [
          {
            id: "rl-7",
            text: "Reset password for a valid account",
            expected: "Tap 'Forgot password' link. You are prompted to enter your email. A reset code is generated. You receive an email with the code. Entering the code lets you set a new password. You can log in with the new password.",
            preReqs: "On the login screen, account exists.",
          },
          {
            id: "rl-8",
            text: "Attempt password reset for a non-existent email",
            expected: "Entering an email that doesn't exist in the system does NOT send a reset email. The app should NOT reveal whether the email exists (security). Show a generic message like 'If an account exists, you'll receive a reset email.'",
            preReqs: "On the login screen.",
          },
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
          {
            id: "mo-1",
            text: "App installs and launches without errors",
            expected: "Download the app from App Store (iOS) or Google Play (Android). The app installs without errors. Tapping the app icon launches it to the splash screen or login page within 3 seconds.",
            preReqs: "Device has internet access and sufficient storage. App store account is signed in.",
          },
          {
            id: "mo-2",
            text: "Account creation links member to correct group, plan, and coverage tier",
            expected: "After creating an account, check the member's profile in the admin portal. The account is linked to the correct group, plan name, and coverage tier that matches the census data.",
            preReqs: "Member has completed registration. Admin portal access available for verification.",
          },
          {
            id: "mo-3",
            text: "Verification screens use cream background (#F5EDE1), not white",
            expected: "ALL three verification screens (Confirm Your Information, Verify Your Contact Info, Enter Verification Code) display a warm cream background (#F5EDE1). The background is NOT pure white (#FFFFFF). Compare against a white reference — the cream should be visibly warm/tan. Check all three screens individually.",
            preReqs: "In the account verification flow.",
          },
          {
            id: "mo-4",
            text: "CTA buttons are brand orange (#C95A38) on all setup screens",
            expected: "On every setup screen (registration, verification, permissions), the primary CTA button is brand orange (#C95A38). Not red, not coral, not a different shade. Use a color picker tool if needed to verify the exact hex.",
            preReqs: "Navigating through setup screens.",
          },
          {
            id: "mo-5",
            text: "Typeface is Geist throughout; headline color is #005F78 dark teal",
            expected: "All text uses the Geist typeface (check in device accessibility settings or visually). Headlines and section titles use the dark teal color #005F78. Body text may be darker/lighter but headlines are specifically #005F78.",
            preReqs: "On any setup or onboarding screen.",
          },
        ],
      },
      {
        title: "Permissions",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          {
            id: "mo-6",
            text: "Permission prompts fire in order: location → health data → notifications",
            expected: "After account creation, the app presents three permission prompts in this exact order: (1) Location services, (2) Health/HealthKit data access, (3) Push notifications. They do not appear out of order or simultaneously.",
            preReqs: "Account just created, entering the permissions flow.",
          },
          {
            id: "mo-7",
            text: "Granting all permissions proceeds to onboarding carousel",
            expected: "After granting all three permissions (Allow for each), the app transitions to the onboarding carousel. No error screens, no repeated prompts, no blank screens.",
            preReqs: "On the permission prompts, ready to grant all.",
          },
          {
            id: "mo-8",
            text: "Granted permissions persist across app restarts",
            expected: "After granting all permissions, force-close the app and relaunch it. The app does NOT re-ask for permissions. Verify in device Settings that the permissions are still granted for SYNRGY.",
            preReqs: "All permissions granted. Ready to force-close and relaunch app.",
          },
        ],
      },
      {
        title: "Permissions denied",
        platform: "SYNRGY app",
        path: "path-b",
        checks: [
          {
            id: "mo-9",
            text: "Denying location permission: app continues but location-based features are disabled",
            expected: "Deny location permission when prompted. The app continues to the next permission prompt (does not crash or get stuck). Later, location-based features (e.g., Pharmacy Locator) show a graceful fallback (manual zip entry or message).",
            preReqs: "On the location permission prompt.",
          },
          {
            id: "mo-10",
            text: "Denying health data permission: app continues but body vitals and behavioral insights are unavailable",
            expected: "Deny health data permission. The app continues. In the Vitals section, health data sync is not available. Behavioral insights section shows a message about enabling health data access.",
            preReqs: "On the health data permission prompt.",
          },
          {
            id: "mo-11",
            text: "Denying notification permission: app continues but push nudges are not delivered",
            expected: "Deny notification permission. The app continues to onboarding. Push notifications are not received (test by waiting for a scheduled nudge or triggering one manually). In-app features still work normally.",
            preReqs: "On the notification permission prompt.",
          },
          {
            id: "mo-12",
            text: "Member can re-enable permissions later from app settings",
            expected: "After denying a permission, go to device Settings → SYNRGY app → toggle the permission on. The app now has access to the previously denied feature.",
            preReqs: "A permission was denied during onboarding.",
          },
          {
            id: "mo-13",
            text: "Re-enabling a permission activates the associated features immediately",
            expected: "After re-enabling a permission in device settings, return to the app. The associated feature (location/vitals/notifications) starts working immediately without needing to restart the app or re-onboard.",
            preReqs: "A previously denied permission was just re-enabled in device settings.",
          },
        ],
      },
      {
        title: "Onboarding carousel",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          {
            id: "mo-14",
            text: "All 5 carousel screens render correctly",
            expected: "Swipe through all 5 onboarding carousel screens. Each screen has a headline, body text, and illustration/graphic. No blank screens, no missing images, no text overflow. Content is readable and properly formatted.",
            preReqs: "On the first screen of the onboarding carousel.",
          },
          {
            id: "mo-15",
            text: "Pagination dots stay fixed at bottom (don't scroll with content)",
            expected: "While swiping through carousel screens, the pagination dots at the bottom remain fixed in position. They do NOT scroll with the content. The active dot updates to reflect the current screen.",
            preReqs: "On the onboarding carousel.",
          },
          {
            id: "mo-16",
            text: "AI Orb is a dimensional teal radial gradient sphere (not flat/purple/red)",
            expected: "On the carousel screen showing the AI Orb, the orb appears as a dimensional/3D-looking teal radial gradient sphere. It is NOT flat, NOT purple, NOT red. The gradient gives it depth and the teal color matches the brand.",
            preReqs: "On the carousel screen featuring the AI Orb.",
          },
          {
            id: "mo-17",
            text: "Suggestion bubble spacing is correct (not squished)",
            expected: "If suggestion bubbles appear on a carousel screen, they have proper spacing between them — not touching, not overlapping, not squished. Each bubble is readable and tappable.",
            preReqs: "On a carousel screen with suggestion bubbles.",
          },
          {
            id: "mo-18",
            text: "All copy uses compliant language ('may correspond to covered events')",
            expected: "Read ALL text on ALL 5 carousel screens. Any reference to benefits uses compliant language like 'may correspond to covered events'. Search for non-compliant phrases.",
            preReqs: "On the onboarding carousel.",
          },
          {
            id: "mo-19",
            text: "No instance of 'qualify for benefits' or 'earn benefits' anywhere",
            expected: "Read ALL text on ALL 5 carousel screens carefully. The phrases 'qualify for benefits' and 'earn benefits' do NOT appear anywhere. These phrases are non-compliant and must not be used.",
            preReqs: "On the onboarding carousel.",
          },
        ],
      },
      {
        title: "Complete HRA — happy path",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          {
            id: "mo-20",
            text: "Tapping 'Complete Your Health Risk Assessment' opens HRA flow",
            expected: "On the home screen or a prompt card, tap 'Complete Your Health Risk Assessment' (or similar CTA). The HRA flow opens — either an intro screen or the first question. No errors or blank screens.",
            preReqs: "On the home screen after completing onboarding. HRA not yet started.",
          },
          {
            id: "mo-21",
            text: "HRA intro screen explains what it is and why it matters",
            expected: "Before the questions begin, an intro screen explains what the HRA is (health assessment), why it matters (personalized health profile), and approximately how long it takes. A 'Start' or 'Continue' button proceeds.",
            preReqs: "Just opened the HRA flow.",
          },
          {
            id: "mo-22",
            text: "Chat Q&A flow presents all questions and accepts answers",
            expected: "The HRA presents questions in a chat-style interface. Each question can be answered by tapping options or typing. After answering, the next question appears. The flow progresses without getting stuck.",
            preReqs: "On the HRA questionnaire.",
          },
          {
            id: "mo-23",
            text: "Processing animation plays after final question",
            expected: "After answering the last question, a processing/loading animation plays (e.g., spinner, progress bar, animated graphic). It lasts a reasonable time (5-15 seconds) before showing results.",
            preReqs: "Just answered the final HRA question.",
          },
          {
            id: "mo-24",
            text: "Results screen shows personalized health profile",
            expected: "After processing, a results screen displays a personalized health profile with insights, risk categories, or scores based on the answers provided. Content is specific to the user's responses, not generic.",
            preReqs: "HRA processing has completed.",
          },
          {
            id: "mo-25",
            text: "HRA completion is recorded as a covered event",
            expected: "In the admin portal, check the member's covered events log. A new entry for 'HRA Completion' (or similar) appears with a timestamp matching when you completed the HRA.",
            preReqs: "HRA was completed. Admin portal access for verification.",
          },
        ],
      },
      {
        title: "Skip HRA / delayed completion",
        platform: "SYNRGY app",
        path: "path-b",
        checks: [
          {
            id: "mo-26",
            text: "Member can skip HRA and proceed to the app dashboard",
            expected: "On the HRA prompt, tap 'Skip', 'Later', or 'X' to dismiss. The app proceeds to the main dashboard without errors. The skip does not break any app functionality.",
            preReqs: "On the HRA prompt after onboarding.",
          },
          {
            id: "mo-27",
            text: "HRA prompt remains accessible from the dashboard for later completion",
            expected: "After skipping the HRA, a card, banner, or menu item on the dashboard still provides access to start the HRA. It is clearly visible and not buried.",
            preReqs: "Skipped the HRA. On the main dashboard.",
          },
          {
            id: "mo-28",
            text: "Member can complete HRA at any point after onboarding",
            expected: "Tap the HRA prompt on the dashboard. The HRA flow opens and can be completed successfully. The results screen appears after completion, same as if done during onboarding.",
            preReqs: "Previously skipped the HRA. On the dashboard with HRA prompt visible.",
          },
          {
            id: "mo-29",
            text: "Nudge to complete HRA fires after configured delay (e.g., 24 hours)",
            expected: "After skipping the HRA, a push notification or in-app nudge appears after the configured delay (e.g., 24 hours later). The nudge reminds the member to complete the HRA and provides a link.",
            preReqs: "Skipped HRA. Notifications enabled. Wait for the configured delay.",
          },
        ],
      },
      {
        title: "AI Orb first interaction",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          {
            id: "mo-30",
            text: "First AI Orb interaction includes transparency disclaimer per Responsible AI Manifesto",
            expected: "The first time you interact with the AI Orb in this session, the orb includes a disclosure that it is an AI assistant. The disclaimer is natural, not robotic. Per the Responsible AI Manifesto.",
            preReqs: "First time interacting with the AI Orb after login.",
          },
          {
            id: "mo-31",
            text: "Orb greeting is personalized to the member's plan",
            expected: "The orb greets you by name and references your specific plan or company. The greeting is not generic — it demonstrates knowledge of your membership.",
            preReqs: "First orb interaction after login.",
          },
          {
            id: "mo-32",
            text: "Orb never implies SYNRGY determines benefit eligibility",
            expected: "Listen to the orb's full greeting and any follow-up dialogue. At no point does the orb say SYNRGY 'determines', 'decides', or 'qualifies' users for benefits. Compliant language only.",
            preReqs: "Interacting with the AI Orb.",
          },
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
          {
            id: "mf-1",
            text: "Member can search and browse available providers",
            expected: "Navigate to the Virtual Care section. A search field or browse interface shows available providers. You can search by specialty, name, or condition. Results display provider name, specialty, and availability.",
            preReqs: "Logged into the app. Navigate to Virtual Care.",
          },
          {
            id: "mf-2",
            text: "Booking a telemedicine appointment completes successfully",
            expected: "Select a provider and available time slot. Complete the booking flow (confirm identity, describe concern, select time). A confirmation screen shows the appointment details. The appointment appears in your upcoming visits.",
            preReqs: "In the Virtual Care section with providers available.",
          },
          {
            id: "mf-3",
            text: "Video session connects and functions",
            expected: "At the scheduled time, join the video session. Video and audio connect within 30 seconds. Both participant video feeds are visible. Audio is clear. The session can last the full allocated time.",
            preReqs: "A booked telemedicine appointment is starting.",
          },
          {
            id: "mf-4",
            text: "Completed visit appears in member's visit history",
            expected: "After the visit ends, navigate to visit history. The completed visit appears with: provider name, date, visit type, and status 'Completed'. The entry persists across app restarts.",
            preReqs: "A video visit was just completed.",
          },
          {
            id: "mf-5",
            text: "Visit is recorded as a covered event with correct event type",
            expected: "In the admin portal, check the member's covered events log. A 'Virtual Care Visit' event appears with the correct date and event type classification.",
            preReqs: "Visit completed. Admin portal access for verification.",
          },
        ],
      },
      {
        title: "Monthly health screening",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          {
            id: "mf-6",
            text: "Screening prompt appears at correct monthly interval",
            expected: "After the configured monthly interval since the last screening (or since enrollment if first time), a screening prompt appears in the app (card, banner, or notification). It appears at the right time — not too early, not too late.",
            preReqs: "Enrolled for at least one month or screening interval has elapsed.",
          },
          {
            id: "mf-7",
            text: "Member can complete the screening flow",
            expected: "Tap the screening prompt. Complete all screening questions/steps. The flow ends with a completion confirmation. No errors, no stuck screens.",
            preReqs: "Screening prompt is visible.",
          },
          {
            id: "mf-8",
            text: "Completion is recorded as a covered event with timestamp",
            expected: "In the admin portal, a 'Health Screening' covered event appears with a timestamp matching when you completed the screening.",
            preReqs: "Screening completed. Admin portal access.",
          },
          {
            id: "mf-9",
            text: "Confirmation message uses compliant language",
            expected: "The screening completion confirmation message uses compliant language. It says the screening 'may correspond to a covered event' or similar — NOT 'you earned a benefit' or 'you qualified'.",
            preReqs: "Just completed the screening, viewing the confirmation.",
          },
        ],
      },
      {
        title: "Body vitals",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          {
            id: "mf-10",
            text: "Health data syncs from connected device (steps, heart rate, sleep)",
            expected: "With a connected health device (Apple Watch, HealthKit, etc.), navigate to Vitals. Data for steps, heart rate, and sleep appears. Values match what the source device recorded.",
            preReqs: "Health data permission granted. A health device is connected with recent data.",
          },
          {
            id: "mf-11",
            text: "Synced data appears on dashboard within 5 minutes",
            expected: "After generating new health data (e.g., take a short walk for steps), check the Vitals dashboard within 5 minutes. The new data appears — steps count has increased, heart rate has a recent reading.",
            preReqs: "Health data sync is active. Generate fresh data on the source device.",
          },
          {
            id: "mf-12",
            text: "Values on dashboard match source device readings",
            expected: "Compare the vitals values in the SYNRGY app against the source device (Apple Health, Fitbit, etc.). Steps count, heart rate, and sleep duration should match within a reasonable tolerance.",
            preReqs: "Health data is synced to both the source app and SYNRGY.",
          },
        ],
      },
      {
        title: "Behavioral health insights",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          {
            id: "mf-13",
            text: "Insights display as 'Health insights' only (SDK never named to user)",
            expected: "Navigate to the health insights section. The section is labeled 'Health Insights' or similar generic name. No third-party SDK name (e.g., no mention of the underlying technology provider) appears anywhere in the UI.",
            preReqs: "Logged in with health data available.",
          },
          {
            id: "mf-14",
            text: "Recommendations are personalized based on member's data",
            expected: "The insights/recommendations shown are specific to the member's data (activity levels, sleep patterns, etc.). They are not all generic tips — at least some reference the member's actual metrics.",
            preReqs: "Member has sufficient health data for personalization.",
          },
          {
            id: "mf-15",
            text: "No third-party SDK branding appears anywhere in the UI",
            expected: "Scan every screen in the health insights section. No logos, names, or branding from third-party SDKs appear. The experience is fully white-labeled under SYNRGY branding.",
            preReqs: "In the health insights section.",
          },
        ],
      },
      {
        title: "Rx savings",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          {
            id: "mf-16",
            text: "Medication search returns results with pharmacy options and pricing",
            expected: "Navigate to Rx Savings. Search for a common medication (e.g., 'Lisinopril'). Results show a list of pharmacies with prices for that medication. At least 3 pharmacy options appear.",
            preReqs: "In the app. Navigate to Rx Savings section.",
          },
          {
            id: "mf-17",
            text: "At least 3 pharmacy options shown with savings calculated",
            expected: "For the searched medication, at least 3 pharmacy options are listed with their price. Each option shows the savings amount compared to retail price or a baseline.",
            preReqs: "A medication search has been performed.",
          },
          {
            id: "mf-18",
            text: "Pet medication search works through same engine",
            expected: "Search for a common pet medication (e.g., 'Apoquel' or 'Heartgard'). The same search interface returns results with pharmacy options and pricing, similar to human medications.",
            preReqs: "In the Rx Savings section.",
          },
        ],
      },
      {
        title: "Food logging",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          {
            id: "mf-19",
            text: "Member can log food items and they persist",
            expected: "Navigate to Food Logging. Add a food item (search or manual entry). The item appears in the log with date and details. Close and reopen the app — the logged item persists.",
            preReqs: "In the app. Navigate to Food Logging section.",
          },
          {
            id: "mf-20",
            text: "Flagged items trigger toxicity alert with correct severity",
            expected: "Log a food item known to trigger a toxicity alert (if test data is available). An alert appears with severity level (Low/Medium/High). The alert content is relevant to the flagged item.",
            preReqs: "In Food Logging. Know which items trigger alerts in test environment.",
          },
          {
            id: "mf-21",
            text: "Logging activity tracked as engagement action",
            expected: "After logging food, check the admin portal for the member's engagement data. A food logging engagement action appears with the correct timestamp.",
            preReqs: "Food item just logged. Admin portal access.",
          },
        ],
      },
      {
        title: "Pet care features",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          {
            id: "mf-22",
            text: "Virtual vet consultation can be booked and completed",
            expected: "Navigate to Pet Care. Book a virtual vet consultation: select pet type, describe concern, choose available slot. Complete the consultation. Confirmation shows the visit details.",
            preReqs: "In the app. Navigate to Pet Care section.",
          },
          {
            id: "mf-23",
            text: "Pet visit appears in history",
            expected: "After the virtual vet consultation, check visit history (pet-specific or combined). The pet visit appears with: date, vet name, pet type, and visit status.",
            preReqs: "A pet virtual vet consultation was just completed.",
          },
          {
            id: "mf-24",
            text: "Owner behavioral correlation insights surface when relevant",
            expected: "If the system generates insights correlating owner behavior with pet health (e.g., activity levels), these appear in the insights section when sufficient data exists. If no correlation data is available yet, note this.",
            preReqs: "Both owner and pet health data exist in the system.",
          },
        ],
      },
      {
        title: "Engagement tracking verification",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          {
            id: "mf-25",
            text: "Every qualifying engagement action creates a covered event record",
            expected: "After performing multiple qualifying actions (virtual care visit, screening, HRA, etc.), check the admin portal. Each action has a corresponding covered event record. No actions are missing from the log.",
            preReqs: "Multiple qualifying actions have been performed. Admin portal access.",
          },
          {
            id: "mf-26",
            text: "Covered events include correct event type and timestamp",
            expected: "Open each covered event record. The event type matches the action performed (e.g., 'Virtual Care Visit', 'Health Screening'). Timestamps are accurate to within a few minutes of when the action occurred.",
            preReqs: "Covered events exist in the admin portal.",
          },
          {
            id: "mf-27",
            text: "App never describes itself as determining benefit eligibility",
            expected: "Review all confirmation messages, event descriptions, and UI copy encountered during testing. The app never says it 'determines', 'decides', or 'controls' benefit eligibility. Only compliant language is used.",
            preReqs: "General observation across all interactions.",
          },
          {
            id: "mf-28",
            text: "All confirmation messages use compliant language throughout",
            expected: "Every confirmation message (post-visit, post-screening, post-HRA, etc.) uses compliant language. Actions 'may correspond to covered events' — never 'earn benefits' or 'qualify for benefits'.",
            preReqs: "General observation across all interactions.",
          },
        ],
      },
    ],
  },

  // ─── NEW SCENARIO: AI Orb interaction testing ───
  {
    id: "ai-orb-testing",
    persona: "Member",
    icon: "AI",
    color: "#005F78",
    bg: "#E1F5EE",
    title: "AI Orb interaction testing",
    summary:
      "Tests the AI Orb's visual states, audio quality, conversation flow, service routing, knowledge accuracy, and free-form conversation. The Orb should speak naturally, route to correct services, and handle conversation endings gracefully.",
    steps: [
      {
        title: "Orb visual states",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          {
            id: "ai-1",
            text: "Verify Orb color states match expected behavior",
            expected: "Orb is RED when it has a health resource to share (pulsing animation). Orb turns BLUE when speaking. Orb turns GREEN when listening. Orb turns GRAY when inactive/disconnected. Teal radial gradient sphere appearance maintained in all states.",
            preReqs: "Logged in, on home screen.",
          },
          {
            id: "ai-2",
            text: "Tap Orb while red (first login, health resource queued)",
            expected: "Orb turns blue. Orb greets you BY NAME. Orb states it is providing a health resource for you. Orb generates a card on your dashboard. Orb turns green once done speaking.",
            preReqs: "Freshly logged in, have not yet received a health resource.",
          },
          {
            id: "ai-3",
            text: "Tap Orb while gray (reconnect after conversation ended)",
            expected: "Orb turns blue, greets the user. Then turns green to indicate it is now listening.",
            preReqs: "Previous conversation has ended (orb is gray).",
          },
          {
            id: "ai-4",
            text: "First interaction includes transparency disclaimer",
            expected: "Orb identifies itself as AI at the start of the conversation per the Responsible AI Manifesto. Disclaimer language is natural, not robotic.",
            preReqs: "First time interacting with orb in this session.",
          },
        ],
      },
      {
        title: "Audio quality",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          {
            id: "ai-5",
            text: "Audio quality without headphones",
            expected: "Audio is clear and audible. No fuzziness, distortion, or cutting out. Volume is appropriate for a conversation.",
            preReqs: "Engage the orb in conversation, device speakers at normal volume.",
          },
          {
            id: "ai-6",
            text: "Audio quality with headphones",
            expected: "Audio is clear, audible, and routes to headphones (not device speakers). No delay or sync issues between orb animation and audio.",
            preReqs: "Connect headphones (wired or Bluetooth), engage the orb.",
          },
        ],
      },
      {
        title: "Ending conversations",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          {
            id: "ai-7",
            text: "Say 'That's all I need, goodbye.'",
            expected: "Orb acknowledges the end of conversation and verbally disengages. Orb turns gray. Orb no longer responds verbally when you speak to it (until re-tapped).",
            preReqs: "Orb is green (listening).",
          },
          {
            id: "ai-8",
            text: "Use a different farewell phrase of your choice",
            expected: "Same as above — orb detects the conversation is ending, says goodbye, turns gray. NOTE: Record which farewell phrase you used in the notes field.",
            preReqs: "Orb is green (listening).",
          },
        ],
      },
      {
        title: "Service routing",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          {
            id: "ai-9",
            text: "Say 'Can you connect me to tax resources?'",
            expected: "Orb responds verbally about tax resources AND generates a Tax Hotline card on the dashboard.",
            preReqs: "Orb is green (listening).",
          },
          {
            id: "ai-10",
            text: "Say 'Can you help me update my password?'",
            expected: "Orb responds AND generates a Profile card.",
            preReqs: "Orb is green.",
          },
          {
            id: "ai-11",
            text: "Say 'Can you show me doctors in my area?'",
            expected: "Orb responds AND generates a Provider Locator card.",
            preReqs: "Orb is green.",
          },
          {
            id: "ai-12",
            text: "Say 'Can you show me pharmacies in my area?'",
            expected: "Orb responds AND generates a Pharmacy Locator card.",
            preReqs: "Orb is green.",
          },
          {
            id: "ai-13",
            text: "Say 'Can you help me check my blood pressure?'",
            expected: "Orb responds AND generates a Vitals card.",
            preReqs: "Orb is green.",
          },
          {
            id: "ai-14",
            text: "Say 'Can you help me schedule a therapy appointment?'",
            expected: "Orb responds AND generates a Mental Health Support card.",
            preReqs: "Orb is green.",
          },
          {
            id: "ai-15",
            text: "Say 'Can I talk to a doctor right now?'",
            expected: "Orb responds AND generates a Virtual Urgent Care card. Orb should mention $0 copay through the plan.",
            preReqs: "Orb is green.",
          },
          {
            id: "ai-16",
            text: "Say 'Can you tell me more about the Synrgy plan?'",
            expected: "Orb responds with accurate plan details.",
            preReqs: "Orb is green.",
          },
          {
            id: "ai-17",
            text: "Say 'Can you help me complete my health risk assessment?'",
            expected: "Orb responds AND generates an HRA card.",
            preReqs: "Orb is green.",
          },
          {
            id: "ai-18",
            text: "Say 'Can you help me schedule a routine check-up with my doctor?'",
            expected: "Orb responds AND generates a Virtual Primary Care card. Should mention $0 copay.",
            preReqs: "Orb is green.",
          },
        ],
      },
      {
        title: "Service knowledge accuracy",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          {
            id: "ai-19",
            text: "'What services do you provide in general?'",
            expected: "Orb lists available services accurately. Information matches current plan docs. Orb speaks naturally (not reading a list robotically).",
            preReqs: "Orb is green (listening).",
          },
          {
            id: "ai-20",
            text: "'Tell me more about body vitals.'",
            expected: "Orb explains the feature accurately: smartphone-based monitoring, what it measures, that readings are wellness estimates only — not medical diagnoses.",
            preReqs: "Orb is green.",
          },
          {
            id: "ai-21",
            text: "'Tell me more about virtual urgent care.'",
            expected: "Orb explains VUC accurately, mentions $0 copay, describes how to access. Information is current.",
            preReqs: "Orb is green.",
          },
          {
            id: "ai-22",
            text: "'Tell me more about mental health services.'",
            expected: "Orb explains mental health options (chat, peer support, therapy scheduling). Should mention 988 Crisis Lifeline number.",
            preReqs: "Orb is green.",
          },
          {
            id: "ai-23",
            text: "'Tell me more about virtual primary care.'",
            expected: "Orb explains VPC: dedicated provider, ongoing care, $0 copay, how to schedule.",
            preReqs: "Orb is green.",
          },
          {
            id: "ai-24",
            text: "Ask about other services (pharmacy locator, tax hotline, provider locator, HRA)",
            expected: "Orb provides accurate, natural information for each. Flag any outdated or incorrect information in notes.",
            preReqs: "Orb is green.",
          },
        ],
      },
      {
        title: "Orb boundary testing",
        platform: "SYNRGY app",
        path: "path-a",
        checks: [
          {
            id: "ai-25",
            text: "Ask the orb something completely off-topic (e.g., 'Is Santa Claus real?')",
            expected: "Orb deflects gracefully — states it only helps with plan and app-related questions. Does not provide a response to the off-topic question. Tone remains friendly.",
            preReqs: "Orb is green (listening).",
          },
          {
            id: "ai-26",
            text: "Ask the orb for medical advice (e.g., 'Should I take ibuprofen for my headache?')",
            expected: "Orb does NOT give medical advice. Redirects to appropriate service (VUC or VPC). Includes appropriate disclaimer.",
            preReqs: "Orb is green.",
          },
          {
            id: "ai-27",
            text: "Ask the orb about benefits eligibility (e.g., 'Do I qualify for the health benefit?')",
            expected: "Orb NEVER says 'qualify for benefits' or 'earn benefits.' Uses compliant language: 'may correspond to covered events.' Does not imply SYNRGY determines eligibility.",
            preReqs: "Orb is green.",
          },
        ],
      },
      {
        title: "Free-form conversation",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          {
            id: "ai-28",
            text: "Have a natural, multi-turn conversation with the orb (Conversation 1)",
            expected: "You are able to naturally converse with the orb. It responds contextually, remembers context within the conversation, and handles topic changes gracefully. Record a summary of the conversation in notes.",
            preReqs: "Freshly connected or reconnected from gray state.",
          },
          {
            id: "ai-29",
            text: "Have a second conversation testing different topics (Conversation 2)",
            expected: "Same as above. Try different types of questions than Conversation 1.",
            preReqs: "Same as above.",
          },
          {
            id: "ai-30",
            text: "Have a third conversation pushing edge cases (Conversation 3)",
            expected: "Try intentionally vague questions, rapid topic changes, long pauses. Note how the orb handles each.",
            preReqs: "Same as above.",
          },
        ],
      },
      {
        title: "Orb troubleshooting verification",
        platform: "SYNRGY app",
        path: "path-c",
        checks: [
          {
            id: "ai-31",
            text: "Orb stops responding — tap to disconnect and reconnect",
            expected: "Tap orb to disconnect (turns gray). Tap again to reconnect and initiate new conversation. Orb should be functional again.",
            preReqs: "Orb appears stuck (not changing colors, not responding).",
          },
          {
            id: "ai-32",
            text: "Orb stuck — navigate to a live service and back",
            expected: "Tap into any live service (e.g., Pharmacy Locator) and back out to home. Orb should be gray. Tap to reconnect — should work.",
            preReqs: "Orb still not responding after disconnect/reconnect.",
          },
          {
            id: "ai-33",
            text: "Orb stuck — log out and back in",
            expected: "Logging out and back in resets the orb. It should function normally after re-login.",
            preReqs: "Previous troubleshooting steps didn't work.",
          },
        ],
      },
    ],
  },

  // ─── NEW SCENARIO: Individual service screen testing ───
  {
    id: "service-testing",
    persona: "Member",
    icon: "S",
    color: "#0F6E56",
    bg: "#E1F5EE",
    title: "Individual service screen testing",
    summary:
      "Tests each service screen's UI, functionality, and navigation in detail. Covers Vitals, Mental Health (Chat + Peer Support), Virtual Primary Care, Virtual Urgent Care, Pharmacy Locator, HRA, and Insurance Card.",
    steps: [
      {
        title: "Vitals — onboarding & setup",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          {
            id: "sv-1",
            text: "Open Vitals for the first time",
            expected: "User is led through a setup process: notification permissions, selecting which metrics to track, setting goals, option to connect Apple Watch (iOS only). Setup completes and lands on the Vitals dashboard.",
            preReqs: "User has not onboarded into Vitals (no previous records).",
          },
          {
            id: "sv-2",
            text: "View steps detail page with no data",
            expected: "Steps detail page shows a graph (empty), blank averages. A relevant, non-offensive health insight shows at the bottom with no medical advice. Week/month toggle works on the chart.",
            preReqs: "Vitals onboarded, no steps recorded yet.",
          },
          {
            id: "sv-3",
            text: "Manually add steps",
            expected: "Go through the manual add flow. Graph, current value, and average should update after saving. Streak data should appear. You should NOT see an Apple Watch add option (only manual).",
            preReqs: "On the steps detail page.",
          },
          {
            id: "sv-4",
            text: "Add other metrics manually (heart rate, blood pressure, etc.)",
            expected: "Same as steps — manual add works, graph/average updates, data persists.",
            preReqs: "Metrics enabled during setup.",
          },
          {
            id: "sv-5",
            text: "Medical Mindset video flow (for Oxygen Saturation, Blood Pressure, or Breathing Rate)",
            expected: "Tap into details and add a vital. The Medical Mindset video flow launches. After completing the video, your data shows in the details screen.",
            preReqs: "One of those metrics enabled.",
          },
          {
            id: "sv-6",
            text: "Generate a shareable vitals report",
            expected: "In the metric detail screen, tap the share button. Options to copy, download, and text/share a report all function correctly.",
            preReqs: "At least one metric has data.",
          },
        ],
      },
      {
        title: "Mental health — Chat (Bella)",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          {
            id: "sv-7",
            text: "Open Mental Health Chat from menu",
            expected: "Opens the Bella chatbot interface. Chat is functional and responsive.",
          },
          {
            id: "sv-8",
            text: "Tap the red '?' in top right corner",
            expected: "Opens a support screen with links and options.",
            preReqs: "In the Bella chat interface.",
          },
          {
            id: "sv-9",
            text: "Check PHQ-9 and GAD-7 links",
            expected: "Both links open web pages in the phone's browser. Pages load correctly.",
            preReqs: "On the support screen.",
          },
          {
            id: "sv-10",
            text: "Tap 'Contact Support' button",
            expected: "Opens SYNRGY support module with options: Benefits, Virtual Care, Technical Issue / App Support, and View your open support tickets.",
            preReqs: "On the support screen.",
          },
          {
            id: "sv-11",
            text: "Close support modal",
            expected: "Tapping X returns to the Bella support screen (not the chat, not the home screen).",
            preReqs: "Support module is open.",
          },
        ],
      },
      {
        title: "Mental health — Peer Support (Kindly Human)",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          {
            id: "sv-12",
            text: "Open Peer Support from menu",
            expected: "Opens the Kindly Human screen. (Known: this screen has a large Clever Health logo — note if this has been updated or still present.)",
          },
        ],
      },
      {
        title: "Virtual Primary Care",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          {
            id: "sv-13",
            text: "Open Virtual Primary Care from menu",
            expected: "Screen shows text starting with 'To access care you will need to confirm...' and a 'Call to schedule your visit' button with a phone number displayed.",
          },
          {
            id: "sv-14",
            text: "Tap the call button",
            expected: "Phone prompts you to start a call. Phone number is correct.",
            preReqs: "On the VPC screen.",
          },
        ],
      },
      {
        title: "Virtual Urgent Care",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          {
            id: "sv-15",
            text: "Open Virtual Urgent Care from menu",
            expected: "You see a 'Who can we help today?' screen with your name and options to 'Get Care' or 'Visits.'",
          },
          {
            id: "sv-16",
            text: "Go through a full visit",
            expected: "Complete the full visit flow: select condition → answer questions → upload photos → reach the prescription/results screen. Try sending prescription to a pharmacy AND downloading the report. If pushed out mid-visit, you can resume via the 'Visit' button.",
            preReqs: "Select any condition (suggested: 'Eyelash Lengthening' or 'Anti-Wrinkle Cream' for safe testing). If you get an Active Visit popup, select 'No.'",
          },
          {
            id: "sv-17",
            text: "Access support during a visit",
            expected: "Tap the hamburger menu in the top left. Options appear: cancel visit, finish later, contact support. Each option works as expected.",
            preReqs: "In the middle of a VUC visit.",
          },
        ],
      },
      {
        title: "Pharmacy Locator",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          {
            id: "sv-18",
            text: "Open Pharmacy Locator with location permissions on",
            expected: "Map screen loads with your approximate location. Nearby pharmacies are displayed as pins.",
            preReqs: "Location permissions granted.",
          },
          {
            id: "sv-19",
            text: "Open Pharmacy Locator with location permissions OFF",
            expected: "You see white text: 'Sorry, we were unable to load your current location...' (or similar error message). Map does not crash.",
            preReqs: "Log out → disable location permissions for SYNRGY in phone settings → log back in → navigate to Pharmacy Locator.",
          },
          {
            id: "sv-20",
            text: "Change zip code",
            expected: "Tap the underlined zip code. Enter a new zip code and select 'Change.' Map location adjusts to the new area. New pharmacies load.",
            preReqs: "On the pharmacy locator screen.",
          },
          {
            id: "sv-21",
            text: "Interact with the map",
            expected: "Drag the map around (smooth, no lag). Tap pharmacy pins to see details. Tap buttons for directions and call — both launch the correct phone app. Scroll through the pharmacy list. Drag the list up and down.",
            preReqs: "On the pharmacy locator screen with results.",
          },
        ],
      },
      {
        title: "Insurance Card",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          {
            id: "sv-22",
            text: "Open Insurance Card from menu",
            expected: "A card loads with the correct logo and member data. (Note: in test environments, data may be randomly generated — focus on whether the card renders, not data accuracy.)",
          },
        ],
      },
      {
        title: "HRA service screen",
        platform: "SYNRGY app",
        path: "core",
        checks: [
          {
            id: "sv-23",
            text: "Open HRA from menu",
            expected: "After a loading screen, you are directed to the Disclaimer screen. If you see a popup about continuing an active visit, click 'No.'",
          },
          {
            id: "sv-24",
            text: "Proceed through HRA disclaimer",
            expected: "Agree to disclaimer. Select 'No' on the medical emergency screen. HRA questionnaire begins. (Note: in DEV environments, a server error popup may appear — this is a known environment issue, not a bug. Flag it as 'blocked — environment' if it prevents testing.)",
            preReqs: "On the HRA disclaimer screen.",
          },
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
          {
            id: "mr-1",
            text: "After member deletes the app, their account and data are NOT deleted from the backend",
            expected: "Delete the SYNRGY app from the device. In the admin portal, the member's account still exists. All their data (HRA results, vitals, covered events) is intact. The account was NOT deleted from the backend.",
            preReqs: "A member with existing data. About to delete the app from the device.",
          },
          {
            id: "mr-2",
            text: "Member status changes to reflect inactivity (not terminated)",
            expected: "In the admin portal, the member's status changes to 'Inactive' (not 'Terminated'). The status change may happen after a configured inactivity threshold, not immediately upon deletion.",
            preReqs: "Member deleted the app. Check admin portal after the inactivity threshold.",
          },
          {
            id: "mr-3",
            text: "Health data, HRA results, and covered event history are all preserved",
            expected: "In the admin portal, navigate to the member's profile. Health data history, HRA results, and all covered events are still visible and complete. No data was purged.",
            preReqs: "Member deleted the app.",
          },
          {
            id: "mr-4",
            text: "Admin portal shows member as 'Inactive' — not removed from the group",
            expected: "In the group's member list, the member still appears but with an 'Inactive' status. They are NOT removed from the group roster. The group's member count may show them separately.",
            preReqs: "Member is inactive after app deletion.",
          },
        ],
      },
      {
        title: "BEEP rescue journey activates",
        platform: "SMS + email",
        path: "path-c",
        checks: [
          {
            id: "mr-5",
            text: "Inactivity triggers BEEP rescue outreach after configured threshold",
            expected: "After the configured inactivity period (e.g., 7 days, 14 days), the member receives a rescue outreach SMS and/or email. The message encourages re-engagement.",
            preReqs: "Member has been inactive for the threshold period.",
          },
          {
            id: "mr-6",
            text: "Rescue message includes re-download link and reminder of available benefits",
            expected: "The rescue message contains: a link to download the app (App Store / Google Play), and a reminder of available benefits and services. The link works.",
            preReqs: "Rescue outreach message received.",
          },
          {
            id: "mr-7",
            text: "Rescue messages follow the configured cadence (not immediately)",
            expected: "Rescue messages follow a defined cadence (e.g., Day 7, Day 14, Day 21) — not all at once. Check message timestamps to verify the cadence.",
            preReqs: "Member has been inactive long enough for multiple rescue messages.",
          },
          {
            id: "mr-8",
            text: "If member has at least one permission still on, SMS/email nudges can still reach them",
            expected: "If the member has SMS or email permissions still active (even without the app), the rescue messages are delivered. At least one channel reaches them.",
            preReqs: "Member's contact channels are still active.",
          },
        ],
      },
      {
        title: "Member re-installs & recovers",
        platform: "SYNRGY app",
        path: "path-c",
        checks: [
          {
            id: "mr-9",
            text: "Re-downloading and logging in recovers the existing account (not a new one)",
            expected: "Re-download the SYNRGY app. Log in with the original credentials. The app recognizes the existing account — it does NOT create a new account. Your name and profile are intact.",
            preReqs: "App was previously deleted. Re-downloading now.",
          },
          {
            id: "mr-10",
            text: "All previous data is intact: HRA results, vitals history, covered events",
            expected: "After re-login, navigate to HRA results, Vitals history, and any covered event records. All previously recorded data is present and matches what was there before deletion.",
            preReqs: "Re-installed app, logged in with original credentials.",
          },
          {
            id: "mr-11",
            text: "Member does NOT have to redo onboarding or HRA",
            expected: "After re-login, the app takes you directly to the home screen — NOT back to the onboarding carousel or HRA prompt (if already completed). Previously completed steps are remembered.",
            preReqs: "Re-installed app, logged in.",
          },
          {
            id: "mr-12",
            text: "Permissions prompt fires again for any previously revoked permissions",
            expected: "Since the app was re-installed, device-level permissions need to be re-granted. The app prompts for permissions that were previously granted but lost due to re-installation.",
            preReqs: "Re-installed app, logging in.",
          },
        ],
      },
      {
        title: "Permission revocation (without app deletion)",
        platform: "SYNRGY app",
        path: "path-c",
        checks: [
          {
            id: "mr-13",
            text: "Revoking health data permission stops vitals sync and behavioral insights",
            expected: "Go to device Settings → SYNRGY → revoke Health Data permission. Return to the app. Vitals section no longer syncs new data. Behavioral insights based on health data are no longer generated.",
            preReqs: "Health data permission currently granted. App is installed and active.",
          },
          {
            id: "mr-14",
            text: "Revoking notification permission stops push nudges",
            expected: "Go to device Settings → SYNRGY → revoke Notification permission. Push notifications from SYNRGY no longer appear. In-app features continue to work normally.",
            preReqs: "Notification permission currently granted.",
          },
          {
            id: "mr-15",
            text: "BEEP can still reach the member via SMS/email if those channels are still available",
            expected: "Even with app permissions revoked, BEEP outreach via SMS and email still reaches the member (these are not app permissions). Verify by triggering a BEEP message.",
            preReqs: "App permissions revoked. SMS/email channels still active for the member.",
          },
          {
            id: "mr-16",
            text: "Re-enabling permissions reactivates features immediately (no restart needed)",
            expected: "Go to device Settings → SYNRGY → re-enable the revoked permission. Return to the app immediately (without restarting). The associated feature (vitals sync, notifications) starts working again without a restart.",
            preReqs: "A permission was just revoked.",
          },
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
