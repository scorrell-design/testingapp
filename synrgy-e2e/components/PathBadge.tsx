"use client";

import type { Path } from "@/lib/scenarios";
import { getPathDef } from "@/lib/paths";

export default function PathBadge({
  path,
  size = "sm",
}: {
  path: Path;
  size?: "xs" | "sm";
}) {
  const def = getPathDef(path);

  const sizeClasses =
    size === "xs"
      ? "px-1.5 py-0.5 text-[10px]"
      : "px-2 py-0.5 text-xs";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium leading-tight ${sizeClasses}`}
      style={{ backgroundColor: def.bg, color: def.color }}
    >
      {def.label}
    </span>
  );
}
