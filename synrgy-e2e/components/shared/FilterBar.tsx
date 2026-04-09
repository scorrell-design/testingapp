"use client";

type FilterOption = { value: string; label: string };

export default function FilterBar({
  filters,
  values,
  onChange,
}: {
  filters: Array<{
    id: string;
    label: string;
    options: FilterOption[];
  }>;
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter) => (
        <div key={filter.id} className="flex items-center gap-1">
          <label className="text-[10px] font-medium text-gray-500">
            {filter.label}:
          </label>
          <select
            value={values[filter.id] ?? ""}
            onChange={(e) => onChange(filter.id, e.target.value)}
            className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 outline-none focus:border-brand-navy"
          >
            <option value="">All</option>
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ))}
      {Object.values(values).some(Boolean) && (
        <button
          onClick={() => {
            for (const f of filters) onChange(f.id, "");
          }}
          className="text-[10px] text-gray-400 hover:text-gray-600"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
