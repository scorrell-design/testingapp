"use client";

const STATUS_STYLES = {
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
} as const;

type Status = keyof typeof STATUS_STYLES;

export default function StatusButton({
  status,
  isActive,
  onClick,
}: {
  status: Status;
  isActive: boolean;
  onClick: () => void;
}) {
  const s = STATUS_STYLES[status];

  return (
    <button
      onClick={onClick}
      className="rounded px-3 py-1 text-xs font-medium transition-all"
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
