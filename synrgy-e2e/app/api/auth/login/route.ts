import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { setTesterCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json();

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    const { data: existing } = await supabase
      .from("testers")
      .select("id, name, email")
      .eq("email", normalizedEmail)
      .single();

    let tester;

    if (existing) {
      if (existing.name !== trimmedName) {
        const { data: updated } = await supabase
          .from("testers")
          .update({ name: trimmedName })
          .eq("id", existing.id)
          .select("id, name, email")
          .single();
        tester = updated;
      } else {
        tester = existing;
      }
    } else {
      const { data: created, error } = await supabase
        .from("testers")
        .insert({ name: trimmedName, email: normalizedEmail })
        .select("id, name, email")
        .single();

      if (error) {
        return NextResponse.json(
          { error: "Failed to create tester" },
          { status: 500 }
        );
      }
      tester = created;
    }

    await setTesterCookie(tester!.id);

    return NextResponse.json({ tester });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
