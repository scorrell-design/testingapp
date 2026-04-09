"use client";

export const STATUS_STYLES = {
  pass: {
    label: "Pass",
    activeBg: "#0F6E56",
    activeBorder: "#5DCAA5",
    hoverBg: "#E1F5EE",
    hoverText: "#0F6E56",
  },
  fail: {
    label: "Fail",
    activeBg: "#A32D2D",
    activeBorder: "#F09595",
    hoverBg: "#FCEBEB",
    hoverText: "#A32D2D",
  },
  blocked: {
    label: "Blocked",
    activeBg: "#854F0B",
    activeBorder: "#FAC775",
    hoverBg: "#FAEEDA",
    hoverText: "#854F0B",
  },
  skip: {
    label: "Skip",
    activeBg: "#5F5E5A",
    activeBorder: "#B4B2A9",
    hoverBg: "#F1EFE8",
    hoverText: "#5F5E5A",
  },
  acknowledged: {
    label: "Acknowledged",
    activeBg: "#1A5FB4",
    activeBorder: "#6AACF0",
    hoverBg: "#E6F1FB",
    hoverText: "#1A5FB4",
  },
  fix_in_progress: {
    label: "Fix in Progress",
    activeBg: "#6C3BAA",
    activeBorder: "#B49AE8",
    hoverBg: "#F0EBFE",
    hoverText: "#6C3BAA",
  },
  ready_for_retest: {
    label: "Ready for Re-test",
    activeBg: "#A66B0A",
    activeBorder: "#F5C842",
    hoverBg: "#FEF3D5",
    hoverText: "#A66B0A",
  },
  retest_pass: {
    label: "Re-test Pass",
    activeBg: "#0F6E56",
    activeBorder: "#5DCAA5",
    hoverBg: "#E1F5EE",
    hoverText: "#0F6E56",
  },
  retest_fail: {
    label: "Re-test Fail",
    activeBg: "#A32D2D",
    activeBorder: "#F09595",
    hoverBg: "#FCEBEB",
    hoverText: "#A32D2D",
  },
} as const;

export type Status = keyof typeof STATUS_STYLES;

export default function StatusButton({
  status,
  isActive,
  onClick,
  size = "default",
}: {
  status: Status;
  isActive: boolean;
  onClick: () => void;
  size?: "default" | "sm";
}) {
  const s = STATUS_STYLES[status];
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs";

  return (
    <button
      onClick={onClick}
      className={`rounded font-medium transition-all ${sizeClasses}`}
      style={
        isActive
          ? {
              backgroundColor: s.activeBg,
              borderColor: s.activeBorder,
              borderWidth: 1,
              color: "#fff",
            }
          : {
              backgroundColor: "transparent",
              borderColor: "#e5e7eb",
              borderWidth: 1,
              color: "#6b7280",
            }
      }
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = s.hoverBg;
          e.currentTarget.style.color = s.hoverText;
          e.currentTarget.style.borderColor = s.hoverText;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "#6b7280";
          e.currentTarget.style.borderColor = "#e5e7eb";
        }
      }}
    >
      {s.label}
    </button>
  );
}
