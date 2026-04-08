import { google, sheets_v4 } from "googleapis";
import { scenarios, type Scenario } from "./scenarios";
import { supabase } from "./supabase";

// ---------------------------------------------------------------------------
// Auth & client singleton
// ---------------------------------------------------------------------------

let cachedClient: sheets_v4.Sheets | null = null;

function getGoogleSheetsClient(): sheets_v4.Sheets {
  if (cachedClient) return cachedClient;

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  cachedClient = google.sheets({ version: "v4", auth });
  return cachedClient;
}

const SPREADSHEET_ID = () => process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;

// ---------------------------------------------------------------------------
// Summary-tab throttle (at most once every 5 s)
// ---------------------------------------------------------------------------

let summaryTimer: ReturnType<typeof setTimeout> | null = null;
let summaryQueued = false;

function scheduleSummaryUpdate() {
  if (summaryTimer) {
    summaryQueued = true;
    return;
  }
  summaryTimer = setTimeout(async () => {
    summaryTimer = null;
    const queued = summaryQueued;
    summaryQueued = false;
    try {
      const testers = await getAllTesterResults();
      await syncSummaryTab(testers);
    } catch (err) {
      console.error("Throttled summary sync failed:", err);
    }
    if (queued) scheduleSummaryUpdate();
  }, 5_000);
}

// ---------------------------------------------------------------------------
// Retry helper (one retry after 2 s)
// ---------------------------------------------------------------------------

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err: unknown) {
    const status =
      err && typeof err === "object" && "code" in err
        ? (err as { code: number }).code
        : 0;
    if (status === 429 || status >= 500) {
      await new Promise((r) => setTimeout(r, 2_000));
      return fn();
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildCheckpointRows(): string[][] {
  const rows: string[][] = [];
  for (const scenario of scenarios) {
    for (const step of scenario.steps) {
      for (const check of step.checks) {
        rows.push([check.id, scenario.title, step.title, check.text, "", "", ""]);
      }
    }
  }
  return rows;
}

async function getSheetTabs(): Promise<sheets_v4.Schema$SheetProperties[]> {
  const sheets = getGoogleSheetsClient();
  const res = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID(),
    fields: "sheets.properties",
  });
  return (res.data.sheets ?? []).map((s) => s.properties!);
}

async function getSheetIdByTitle(
  title: string
): Promise<number | null> {
  const tabs = await getSheetTabs();
  const match = tabs.find((p) => p.title === title);
  return match?.sheetId ?? null;
}

function statusColors(status: string): {
  bg: { red: number; green: number; blue: number };
  fg: { red: number; green: number; blue: number };
} | null {
  const map: Record<
    string,
    { bg: { red: number; green: number; blue: number }; fg: { red: number; green: number; blue: number } }
  > = {
    PASS: {
      bg: { red: 0.882, green: 0.961, blue: 0.933 },
      fg: { red: 0.059, green: 0.431, blue: 0.337 },
    },
    FAIL: {
      bg: { red: 0.988, green: 0.922, blue: 0.922 },
      fg: { red: 0.639, green: 0.176, blue: 0.176 },
    },
    BLOCKED: {
      bg: { red: 0.98, green: 0.933, blue: 0.855 },
      fg: { red: 0.522, green: 0.31, blue: 0.043 },
    },
    SKIP: {
      bg: { red: 0.945, green: 0.937, blue: 0.91 },
      fg: { red: 0.373, green: 0.369, blue: 0.353 },
    },
  };
  return map[status.toUpperCase()] ?? null;
}

function formatTimestamp(): string {
  return new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ---------------------------------------------------------------------------
// ensureTesterTab
// ---------------------------------------------------------------------------

export async function ensureTesterTab(
  testerName: string,
  _testerEmail: string
): Promise<void> {
  const sheets = getGoogleSheetsClient();
  const existing = await getSheetIdByTitle(testerName);
  if (existing !== null) return;

  await withRetry(() =>
    sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID(),
      requestBody: {
        requests: [{ addSheet: { properties: { title: testerName } } }],
      },
    })
  );

  const newSheetId = await getSheetIdByTitle(testerName);
  if (newSheetId === null) return;

  const header = [
    ["Checkpoint ID", "Scenario", "Step", "Checkpoint", "Status", "Updated", "Notes"],
  ];
  const dataRows = buildCheckpointRows();

  await withRetry(() =>
    sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID(),
      range: `'${testerName}'!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [...header, ...dataRows] },
    })
  );

  await withRetry(() =>
    sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID(),
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: newSheetId,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.957, green: 0.965, blue: 0.98 },
                  textFormat: { bold: true },
                },
              },
              fields: "userEnteredFormat(backgroundColor,textFormat)",
            },
          },
          {
            updateSheetProperties: {
              properties: {
                sheetId: newSheetId,
                gridProperties: { frozenRowCount: 1 },
              },
              fields: "gridProperties.frozenRowCount",
            },
          },
          {
            updateDimensionProperties: {
              range: { sheetId: newSheetId, dimension: "COLUMNS", startIndex: 0, endIndex: 1 },
              properties: { pixelSize: 120 },
              fields: "pixelSize",
            },
          },
          {
            updateDimensionProperties: {
              range: { sheetId: newSheetId, dimension: "COLUMNS", startIndex: 1, endIndex: 2 },
              properties: { pixelSize: 220 },
              fields: "pixelSize",
            },
          },
          {
            updateDimensionProperties: {
              range: { sheetId: newSheetId, dimension: "COLUMNS", startIndex: 2, endIndex: 3 },
              properties: { pixelSize: 200 },
              fields: "pixelSize",
            },
          },
          {
            updateDimensionProperties: {
              range: { sheetId: newSheetId, dimension: "COLUMNS", startIndex: 3, endIndex: 4 },
              properties: { pixelSize: 420 },
              fields: "pixelSize",
            },
          },
          {
            updateDimensionProperties: {
              range: { sheetId: newSheetId, dimension: "COLUMNS", startIndex: 4, endIndex: 5 },
              properties: { pixelSize: 80 },
              fields: "pixelSize",
            },
          },
          {
            updateDimensionProperties: {
              range: { sheetId: newSheetId, dimension: "COLUMNS", startIndex: 5, endIndex: 6 },
              properties: { pixelSize: 150 },
              fields: "pixelSize",
            },
          },
          {
            updateDimensionProperties: {
              range: { sheetId: newSheetId, dimension: "COLUMNS", startIndex: 6, endIndex: 7 },
              properties: { pixelSize: 220 },
              fields: "pixelSize",
            },
          },
        ],
      },
    })
  );
}

// ---------------------------------------------------------------------------
// syncCheckpointToSheet
// ---------------------------------------------------------------------------

export async function syncCheckpointToSheet(
  testerName: string,
  checkId: string,
  status: string,
  notes?: string
): Promise<void> {
  const sheets = getGoogleSheetsClient();
  const sheetId = await getSheetIdByTitle(testerName);
  if (sheetId === null) return;

  const rowIndex = await findCheckRow(testerName, checkId);
  if (rowIndex === null) return;

  const upperStatus = status.toUpperCase();

  await withRetry(() =>
    sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID(),
      range: `'${testerName}'!E${rowIndex + 1}:G${rowIndex + 1}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[upperStatus, formatTimestamp(), notes ?? ""]],
      },
    })
  );

  const colors = statusColors(upperStatus);
  if (colors) {
    await withRetry(() =>
      sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID(),
        requestBody: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId,
                  startRowIndex: rowIndex,
                  endRowIndex: rowIndex + 1,
                  startColumnIndex: 4,
                  endColumnIndex: 5,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: colors.bg,
                    textFormat: { foregroundColor: colors.fg },
                  },
                },
                fields:
                  "userEnteredFormat(backgroundColor,textFormat.foregroundColor)",
              },
            },
          ],
        },
      })
    );
  }

  scheduleSummaryUpdate();
}

// ---------------------------------------------------------------------------
// clearCheckpointOnSheet
// ---------------------------------------------------------------------------

export async function clearCheckpointOnSheet(
  testerName: string,
  checkId: string
): Promise<void> {
  const sheets = getGoogleSheetsClient();
  const sheetId = await getSheetIdByTitle(testerName);
  if (sheetId === null) return;

  const rowIndex = await findCheckRow(testerName, checkId);
  if (rowIndex === null) return;

  await withRetry(() =>
    sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID(),
      range: `'${testerName}'!E${rowIndex + 1}:G${rowIndex + 1}`,
      valueInputOption: "RAW",
      requestBody: { values: [["", "", ""]] },
    })
  );

  await withRetry(() =>
    sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID(),
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId,
                startRowIndex: rowIndex,
                endRowIndex: rowIndex + 1,
                startColumnIndex: 4,
                endColumnIndex: 5,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 1, green: 1, blue: 1 },
                },
              },
              fields: "userEnteredFormat(backgroundColor)",
            },
          },
        ],
      },
    })
  );

  scheduleSummaryUpdate();
}

// ---------------------------------------------------------------------------
// clearAllResultsOnSheet
// ---------------------------------------------------------------------------

export async function clearAllResultsOnSheet(
  testerName: string
): Promise<void> {
  const sheets = getGoogleSheetsClient();
  const sheetId = await getSheetIdByTitle(testerName);
  if (sheetId === null) return;

  const totalRows = buildCheckpointRows().length;

  await withRetry(() =>
    sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID(),
      range: `'${testerName}'!E2:G${totalRows + 1}`,
      valueInputOption: "RAW",
      requestBody: {
        values: Array.from({ length: totalRows }, () => ["", "", ""]),
      },
    })
  );

  await withRetry(() =>
    sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID(),
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId,
                startRowIndex: 1,
                endRowIndex: totalRows + 1,
                startColumnIndex: 4,
                endColumnIndex: 5,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 1, green: 1, blue: 1 },
                },
              },
              fields: "userEnteredFormat(backgroundColor)",
            },
          },
        ],
      },
    })
  );

  scheduleSummaryUpdate();
}

// ---------------------------------------------------------------------------
// syncSummaryTab
// ---------------------------------------------------------------------------

export async function syncSummaryTab(
  allTesters: Array<{
    name: string;
    email: string;
    results: Record<string, { status: string }>;
  }>
): Promise<void> {
  const sheets = getGoogleSheetsClient();

  let sheetId = await getSheetIdByTitle("Summary");
  if (sheetId === null) {
    await withRetry(() =>
      sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID(),
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: { title: "Summary", index: 0 },
              },
            },
          ],
        },
      })
    );
    sheetId = await getSheetIdByTitle("Summary");
  }

  if (sheetId === null) return;

  const header = ["Scenario", "Total checkpoints"];
  for (const t of allTesters) header.push(t.name);

  const rows: string[][] = [header];

  let grandTested = new Array(allTesters.length).fill(0);
  let grandFailed = new Array(allTesters.length).fill(0);
  let grandTotal = 0;

  for (const scenario of scenarios) {
    const checkIds = scenarioCheckIds(scenario);
    const total = checkIds.length;
    grandTotal += total;
    const row = [scenario.title, String(total)];

    for (let ti = 0; ti < allTesters.length; ti++) {
      const t = allTesters[ti];
      let tested = 0;
      let failed = 0;
      for (const cid of checkIds) {
        const r = t.results[cid];
        if (r) {
          tested++;
          if (r.status === "fail") failed++;
        }
      }
      grandTested[ti] += tested;
      grandFailed[ti] += failed;

      let cell = `${tested}/${total}`;
      if (tested === total && failed === 0) {
        cell += " ✓";
      } else if (failed > 0) {
        cell += ` (${failed} failed)`;
      }
      row.push(cell);
    }
    rows.push(row);
  }

  const totalsRow = ["TOTAL", String(grandTotal)];
  for (let ti = 0; ti < allTesters.length; ti++) {
    let cell = `${grandTested[ti]}/${grandTotal}`;
    if (grandFailed[ti] > 0) cell += ` (${grandFailed[ti]} failed)`;
    totalsRow.push(cell);
  }
  rows.push(totalsRow);

  await withRetry(() =>
    sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID(),
      range: "'Summary'!A1",
      valueInputOption: "RAW",
      requestBody: { values: rows },
    })
  );

  await withRetry(() =>
    sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID(),
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.957, green: 0.965, blue: 0.98 },
                  textFormat: { bold: true },
                },
              },
              fields: "userEnteredFormat(backgroundColor,textFormat)",
            },
          },
          {
            updateSheetProperties: {
              properties: {
                sheetId,
                gridProperties: { frozenRowCount: 1 },
              },
              fields: "gridProperties.frozenRowCount",
            },
          },
        ],
      },
    })
  );
}

// ---------------------------------------------------------------------------
// getAllTesterResults — fetches every tester + their results from Supabase
// ---------------------------------------------------------------------------

export async function getAllTesterResults(): Promise<
  Array<{
    name: string;
    email: string;
    results: Record<string, { status: string }>;
  }>
> {
  const { data: testers } = await supabase
    .from("testers")
    .select("id, name, email");

  if (!testers || testers.length === 0) return [];

  const { data: allResults } = await supabase
    .from("test_results")
    .select("tester_id, check_id, status");

  const resultsByTester: Record<
    string,
    Record<string, { status: string }>
  > = {};

  for (const r of allResults ?? []) {
    if (!resultsByTester[r.tester_id]) resultsByTester[r.tester_id] = {};
    resultsByTester[r.tester_id][r.check_id] = { status: r.status };
  }

  return testers.map((t) => ({
    name: t.name,
    email: t.email,
    results: resultsByTester[t.id] ?? {},
  }));
}

// ---------------------------------------------------------------------------
// fullSyncAllSheets — rebuild every tab from Supabase (recovery)
// ---------------------------------------------------------------------------

export async function fullSyncAllSheets(): Promise<void> {
  const sheets = getGoogleSheetsClient();
  const allTesters = await getAllTesterResults();

  const { data: allNotes } = await supabase
    .from("test_results")
    .select("tester_id, check_id, status, notes, updated_at");

  const notesByTester: Record<
    string,
    Record<string, { status: string; notes: string | null; updated_at: string }>
  > = {};
  for (const r of allNotes ?? []) {
    if (!notesByTester[r.tester_id]) notesByTester[r.tester_id] = {};
    notesByTester[r.tester_id][r.check_id] = {
      status: r.status,
      notes: r.notes,
      updated_at: r.updated_at,
    };
  }

  const { data: testers } = await supabase
    .from("testers")
    .select("id, name, email");

  for (const tester of testers ?? []) {
    await ensureTesterTab(tester.name, tester.email);

    const testerResults = notesByTester[tester.id] ?? {};
    const checkRows = buildCheckpointRows();

    const statusValues: string[][] = [];
    for (const row of checkRows) {
      const checkId = row[0];
      const result = testerResults[checkId];
      if (result) {
        const ts = result.updated_at
          ? new Date(result.updated_at).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
          : "";
        statusValues.push([
          result.status.toUpperCase(),
          ts,
          result.notes ?? "",
        ]);
      } else {
        statusValues.push(["", "", ""]);
      }
    }

    await withRetry(() =>
      sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID(),
        range: `'${tester.name}'!E2:G${checkRows.length + 1}`,
        valueInputOption: "RAW",
        requestBody: { values: statusValues },
      })
    );

    const sheetId = await getSheetIdByTitle(tester.name);
    if (sheetId === null) continue;

    const formatRequests: sheets_v4.Schema$Request[] = [];
    for (let i = 0; i < checkRows.length; i++) {
      const checkId = checkRows[i][0];
      const result = testerResults[checkId];
      const colors = result
        ? statusColors(result.status.toUpperCase())
        : null;

      formatRequests.push({
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: i + 1,
            endRowIndex: i + 2,
            startColumnIndex: 4,
            endColumnIndex: 5,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: colors
                ? colors.bg
                : { red: 1, green: 1, blue: 1 },
              ...(colors
                ? { textFormat: { foregroundColor: colors.fg } }
                : {}),
            },
          },
          fields: colors
            ? "userEnteredFormat(backgroundColor,textFormat.foregroundColor)"
            : "userEnteredFormat(backgroundColor)",
        },
      });
    }

    if (formatRequests.length > 0) {
      await withRetry(() =>
        sheets.spreadsheets.batchUpdate({
          spreadsheetId: SPREADSHEET_ID(),
          requestBody: { requests: formatRequests },
        })
      );
    }
  }

  await syncSummaryTab(allTesters);
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

function scenarioCheckIds(scenario: Scenario): string[] {
  return scenario.steps.flatMap((step) => step.checks.map((c) => c.id));
}

async function findCheckRow(
  testerName: string,
  checkId: string
): Promise<number | null> {
  const sheets = getGoogleSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID(),
    range: `'${testerName}'!A:A`,
  });
  const col = res.data.values ?? [];
  for (let i = 0; i < col.length; i++) {
    if (col[i][0] === checkId) return i;
  }
  return null;
}
