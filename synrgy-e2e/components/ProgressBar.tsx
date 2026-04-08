export default function ProgressBar({
  percent,
  color,
  hasFails,
}: {
  percent: number;
  color: string;
  hasFails?: boolean;
}) {
  let fillColor = color;
  if (percent >= 100) fillColor = "#0F6E56";
  if (hasFails) fillColor = "#A32D2D";

  return (
    <div className="h-[3px] w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: fillColor }}
      />
    </div>
  );
}
