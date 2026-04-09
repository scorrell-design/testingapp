import { cookies } from "next/headers";
import { supabase } from "./supabase";

const COOKIE_NAME = "tester_id";

export async function getTesterIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export async function setTesterCookie(testerId: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, testerId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90, // 90 days
  });
}

export async function clearTesterCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentTester() {
  const testerId = await getTesterIdFromCookie();
  if (!testerId) return null;

  const { data, error } = await supabase
    .from("testers")
    .select("id, name, email, role")
    .eq("id", testerId)
    .single();

  if (error || !data) return null;
  return data as { id: string; name: string; email: string; role: string };
}
