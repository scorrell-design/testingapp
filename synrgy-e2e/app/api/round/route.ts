import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getTesterIdFromCookie } from "@/lib/auth";

export async function GET() {
  const testerId = await getTesterIdFromCookie();
  if (!testerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("testers")
    .select("current_round")
    .eq("id", testerId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ current_round: data?.current_round ?? 1 });
}

export async function POST() {
  const testerId = await getTesterIdFromCookie();
  if (!testerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: tester } = await supabase
    .from("testers")
    .select("current_round")
    .eq("id", testerId)
    .single();

  const currentRound = tester?.current_round ?? 1;
  const newRound = currentRound + 1;

  const { error } = await supabase
    .from("testers")
    .update({ current_round: newRound })
    .eq("id", testerId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ current_round: newRound });
}
