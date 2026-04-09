"use client";

const VARIANT_STYLES: Record<string, { bg: string; text: string }> = {
  admin: { bg: "#E6F1FB", text: "#185FA5" },
  tester: { bg: "#F3F4F6", text: "#6B7280" },
  pass: { bg: "#E1F5EE", text: "#0F6E56" },
  fail: { bg: "#FCEBEB", text: "#A32D2D" },
  blocked: { bg: "#FAEEDA", text: "#854F0B" },
  skip: { bg: "#F1EFE8", text: "#5F5E5A" },
  pending: { bg: "#FEF3D5", text: "#A66B0A" },
  urgent: { bg: "#FCEBEB", text: "#A32D2D" },
  info: { bg: "#E6F1FB", text: "#185FA5" },
};

export default function Badge({
  variant = "info",
  children,
}: {
  variant?: keyof typeof VARIANT_STYLES | string;
  children: React.ReactNode;
}) {
  const style = VARIANT_STYLES[variant] ?? VARIANT_STYLES.info;
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {children}
    </span>
  );
}
