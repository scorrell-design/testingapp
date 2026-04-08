import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getTesterIdFromCookie } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const testerId = await getTesterIdFromCookie();
  if (!testerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const scenarioId = searchParams.get("scenario_id");
  const stepIndex = searchParams.get("step_index");

  if (!scenarioId || stepIndex === null) {
    return NextResponse.json(
      { error: "scenario_id and step_index are required" },
      { status: 400 }
    );
  }

  const { data } = await supabase
    .from("test_notes")
    .select("note")
    .eq("tester_id", testerId)
    .eq("scenario_id", scenarioId)
    .eq("step_index", parseInt(stepIndex))
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return NextResponse.json({ note: data?.note ?? null });
}

export async function PUT(request: NextRequest) {
  const testerId = await getTesterIdFromCookie();
  if (!testerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { scenario_id, step_index, note } = await request.json();

  if (!scenario_id || step_index === undefined || step_index === null) {
    return NextResponse.json(
      { error: "scenario_id and step_index are required" },
      { status: 400 }
    );
  }

  // Delete existing note for this tester/scenario/step, then insert new one
  await supabase
    .from("test_notes")
    .delete()
    .eq("tester_id", testerId)
    .eq("scenario_id", scenario_id)
    .eq("step_index", step_index);

  if (note?.trim()) {
    const { error } = await supabase.from("test_notes").insert({
      tester_id: testerId,
      scenario_id,
      step_index,
      note: note.trim(),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
