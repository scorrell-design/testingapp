import type { Path } from "./scenarios";

export type PathDefinition = {
  id: Path;
  label: string;
  color: string;
  bg: string;
  description: string;
};

export const PATH_DEFINITIONS: PathDefinition[] = [
  {
    id: "core",
    label: "Core",
    color: "#6b7280",
    bg: "#f3f4f6",
    description: "The happy path — every tester completes all core checkpoints.",
  },
  {
    id: "path-a",
    label: "Path A",
    color: "#dc2626",
    bg: "#fef2f2",
    description: "Rejection & failure flows — invalid inputs, denied requests, errors.",
  },
  {
    id: "path-b",
    label: "Path B",
    color: "#7c3aed",
    bg: "#f5f3ff",
    description: "Alternate routes — non-default but valid user journeys.",
  },
  {
    id: "path-c",
    label: "Path C",
    color: "#d97706",
    bg: "#fffbeb",
    description: "Edge cases & recovery — deactivation, deletion, mid-cycle changes.",
  },
];

export function getPathDef(pathId: Path): PathDefinition {
  return PATH_DEFINITIONS.find((p) => p.id === pathId) ?? PATH_DEFINITIONS[0];
}

export function getAssignablePaths(): PathDefinition[] {
  return PATH_DEFINITIONS.filter((p) => p.id !== "core");
}
