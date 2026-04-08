import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getTesterIdFromCookie } from "@/lib/auth";

export async function GET() {
  const testerId = await getTesterIdFromCookie();
  if (!testerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("tester_devices")
    .select("id, device_name, os, os_version, is_primary, created_at")
    .eq("tester_id", testerId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ devices: data ?? [] });
}

export async function POST(request: NextRequest) {
  const testerId = await getTesterIdFromCookie();
  if (!testerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { device_name, os, os_version, is_primary } = await request.json();

  if (!device_name?.trim() || !os?.trim()) {
    return NextResponse.json(
      { error: "device_name and os are required" },
      { status: 400 }
    );
  }

  if (!["iOS", "Android"].includes(os)) {
    return NextResponse.json(
      { error: "os must be 'iOS' or 'Android'" },
      { status: 400 }
    );
  }

  if (is_primary) {
    await supabase
      .from("tester_devices")
      .update({ is_primary: false })
      .eq("tester_id", testerId);
  }

  const { data, error } = await supabase
    .from("tester_devices")
    .insert({
      tester_id: testerId,
      device_name: device_name.trim(),
      os: os.trim(),
      os_version: os_version?.trim() || null,
      is_primary: is_primary ?? false,
    })
    .select("id, device_name, os, os_version, is_primary, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ device: data });
}

export async function PUT(request: NextRequest) {
  const testerId = await getTesterIdFromCookie();
  if (!testerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { device_id, is_primary } = await request.json();

  if (!device_id) {
    return NextResponse.json(
      { error: "device_id is required" },
      { status: 400 }
    );
  }

  if (is_primary) {
    await supabase
      .from("tester_devices")
      .update({ is_primary: false })
      .eq("tester_id", testerId);
  }

  const { error } = await supabase
    .from("tester_devices")
    .update({ is_primary: is_primary ?? false })
    .eq("id", device_id)
    .eq("tester_id", testerId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const testerId = await getTesterIdFromCookie();
  if (!testerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("tester_devices")
    .delete()
    .eq("id", id)
    .eq("tester_id", testerId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
