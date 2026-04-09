"use client";

type RetestRequest = {
  id: string;
  reason: string;
  what_to_verify: string;
  original_notes: string | null;
  requester: { name: string } | null;
};

export default function RetestBanner({
  request,
  onComplete,
}: {
  request: RetestRequest;
  onComplete: (result: "pass" | "fail", notes: string) => void;
}) {
  return (
    <div className="mb-3 -mx-4 -mt-4 rounded-t-xl border-b border-amber-200 bg-amber-50 px-4 py-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-amber-800">
          🔄 Retest requested
        </span>
        {request.requester?.name && (
          <span className="text-xs text-amber-600">
            by {request.requester.name}
          </span>
        )}
      </div>

      <div className="rounded bg-white/60 px-3 py-2 space-y-1.5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-700">
            What changed
          </p>
          <p className="text-xs text-gray-700">{request.reason}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
            What to verify
          </p>
          <p className="text-xs text-gray-700">{request.what_to_verify}</p>
        </div>
        {request.original_notes && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              Your original report
            </p>
            <p className="text-xs text-gray-600">{request.original_notes}</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onComplete("pass", "")}
          className="rounded-lg bg-status-pass px-3 py-1.5 text-xs font-medium text-white"
        >
          ✅ Fixed
        </button>
        <button
          onClick={() => {
            const notes = prompt("Describe the current state:");
            onComplete("fail", notes || "");
          }}
          className="rounded-lg bg-status-fail px-3 py-1.5 text-xs font-medium text-white"
        >
          ❌ Still broken
        </button>
      </div>
    </div>
  );
}
