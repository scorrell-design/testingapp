import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getTesterIdFromCookie } from "@/lib/auth";

export async function GET() {
  const testerId = await getTesterIdFromCookie();
  if (!testerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("path_assignments")
    .select("path_id")
    .eq("tester_id", testerId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const paths = (data ?? []).map((r) => r.path_id);
  return NextResponse.json({ paths });
}

export async function PUT(request: NextRequest) {
  const testerId = await getTesterIdFromCookie();
  if (!testerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { path_id, action } = await request.json();

  if (!path_id || !action) {
    return NextResponse.json(
      { error: "path_id and action are required" },
      { status: 400 }
    );
  }

  const validPaths = ["path-a", "path-b", "path-c"];
  if (!validPaths.includes(path_id)) {
    return NextResponse.json({ error: "Invalid path_id" }, { status: 400 });
  }

  if (action === "assign") {
    const { error } = await supabase
      .from("path_assignments")
      .upsert(
        { tester_id: testerId, path_id },
        { onConflict: "tester_id,path_id" }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else if (action === "remove") {
    const { error } = await supabase
      .from("path_assignments")
      .delete()
      .eq("tester_id", testerId)
      .eq("path_id", path_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    return NextResponse.json(
      { error: "action must be 'assign' or 'remove'" },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
