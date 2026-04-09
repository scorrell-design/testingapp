import { scenarios } from "./scenarios";

type FailureItem = {
  checkId: string;
  testerId: string;
  testerName: string;
  status: string;
  notes: string | null;
  scenarioId: string;
  scenarioTitle: string;
  stepTitle: string;
  stepIndex: number;
  platform: string;
  checkText: string;
};

export type FailureCluster = {
  id: string;
  title: string;
  platform: string;
  checkIds: string[];
  failures: FailureItem[];
  testerCount: number;
  keywords: string[];
};

const STOP_WORDS = new Set([
  "the", "is", "a", "an", "in", "on", "at", "to", "for", "of", "and", "or",
  "not", "should", "be", "are", "was", "were", "has", "have", "had", "will",
  "with", "from", "by", "that", "this", "it", "its", "as", "can", "all",
  "each", "when", "if", "after", "before", "then", "so", "no", "do", "does",
  "user", "tester", "check", "test", "screen", "page",
]);

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function sharedKeywords(a: string[], b: string[]): string[] {
  const setB = new Set(b);
  return [...new Set(a.filter((w) => setB.has(w)))];
}

export function buildClusters(
  results: Array<{
    tester_id: string;
    tester_name: string;
    check_id: string;
    status: string;
    notes: string | null;
  }>
): FailureCluster[] {
  const failures: FailureItem[] = [];

  const checkMeta: Record<
    string,
    { scenarioId: string; scenarioTitle: string; stepTitle: string; stepIndex: number; platform: string; text: string }
  > = {};

  for (const scenario of scenarios) {
    for (let si = 0; si < scenario.steps.length; si++) {
      const step = scenario.steps[si];
      for (const check of step.checks) {
        checkMeta[check.id] = {
          scenarioId: scenario.id,
          scenarioTitle: scenario.title,
          stepTitle: step.title,
          stepIndex: si,
          platform: step.platform,
          text: check.text,
        };
      }
    }
  }

  for (const r of results) {
    if (r.status !== "fail" && r.status !== "retest_fail") continue;
    const meta = checkMeta[r.check_id];
    if (!meta) continue;

    failures.push({
      checkId: r.check_id,
      testerId: r.tester_id,
      testerName: r.tester_name,
      status: r.status,
      notes: r.notes,
      scenarioId: meta.scenarioId,
      scenarioTitle: meta.scenarioTitle,
      stepTitle: meta.stepTitle,
      stepIndex: meta.stepIndex,
      platform: meta.platform,
      checkText: meta.text,
    });
  }

  const byPlatform = new Map<string, FailureItem[]>();
  for (const f of failures) {
    if (!byPlatform.has(f.platform)) byPlatform.set(f.platform, []);
    byPlatform.get(f.platform)!.push(f);
  }

  const clusters: FailureCluster[] = [];
  let clusterId = 0;

  for (const [platform, items] of byPlatform) {
    const uniqueChecks = [...new Set(items.map((i) => i.checkId))];
    const parent = new Map<string, string>();
    for (const cid of uniqueChecks) parent.set(cid, cid);

    function find(x: string): string {
      while (parent.get(x) !== x) {
        parent.set(x, parent.get(parent.get(x)!)!);
        x = parent.get(x)!;
      }
      return x;
    }

    function union(a: string, b: string) {
      const ra = find(a), rb = find(b);
      if (ra !== rb) parent.set(ra, rb);
    }

    for (let i = 0; i < uniqueChecks.length; i++) {
      for (let j = i + 1; j < uniqueChecks.length; j++) {
        const a = uniqueChecks[i], b = uniqueChecks[j];
        const metaA = checkMeta[a], metaB = checkMeta[b];
        if (!metaA || !metaB) continue;

        // Same step
        if (metaA.scenarioId === metaB.scenarioId && metaA.stepIndex === metaB.stepIndex) {
          union(a, b);
          continue;
        }

        // Shared keywords in checkpoint text
        const kwA = extractKeywords(metaA.text);
        const kwB = extractKeywords(metaB.text);
        if (sharedKeywords(kwA, kwB).length >= 2) {
          union(a, b);
          continue;
        }

        // Multiple testers failed same checkpoint
        const testersA = new Set(items.filter((f) => f.checkId === a).map((f) => f.testerId));
        const testersB = new Set(items.filter((f) => f.checkId === b).map((f) => f.testerId));
        const overlap = [...testersA].filter((t) => testersB.has(t));
        if (overlap.length >= 1 && sharedKeywords(kwA, kwB).length >= 1) {
          union(a, b);
        }
      }
    }

    const groups = new Map<string, string[]>();
    for (const cid of uniqueChecks) {
      const root = find(cid);
      if (!groups.has(root)) groups.set(root, []);
      groups.get(root)!.push(cid);
    }

    for (const [, checkIds] of groups) {
      const clusterFailures = items.filter((f) => checkIds.includes(f.checkId));
      const testerCount = new Set(clusterFailures.map((f) => f.testerId)).size;

      const allText = clusterFailures.map((f) => f.checkText + " " + (f.notes ?? "")).join(" ");
      const allKw = extractKeywords(allText);
      const kwCounts = new Map<string, number>();
      for (const kw of allKw) kwCounts.set(kw, (kwCounts.get(kw) ?? 0) + 1);
      const topKw = [...kwCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([w]) => w);

      const title = `${checkIds.length} failure${checkIds.length > 1 ? "s" : ""} in ${platform} — ${topKw.slice(0, 3).join(", ")}`;

      clusters.push({
        id: `auto-${clusterId++}`,
        title,
        platform,
        checkIds,
        failures: clusterFailures,
        testerCount,
        keywords: topKw,
      });
    }
  }

  clusters.sort((a, b) => b.failures.length - a.failures.length);
  return clusters;
}
