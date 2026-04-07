import { redirect } from "next/navigation";
import { getCurrentTester } from "@/lib/auth";

export default async function Home() {
  const tester = await getCurrentTester();

  if (tester) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
