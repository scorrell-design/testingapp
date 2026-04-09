import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import {
  sendAssignmentEmail,
  sendCompletionEmail,
  sendRetestRequestedEmail,
  sendRetestCompletedEmail,
} from "@/lib/email";

export async function POST(request: NextRequest) {
  const { error, tester } = await requireAdmin();
  if (error) return error;

  const { type } = await request.json();

  const email = tester!.email;
  const name = tester!.name;

  try {
    switch (type) {
      case "assignment":
        await sendAssignmentEmail({
          testerEmail: email,
          testerName: name,
          adminName: name,
          scenarioTitles: [
            { title: "Admin creates & manages broker", summary: "Full broker onboarding and management flow" },
            { title: "Member enrollment", summary: "End-to-end member sign-up and benefits selection" },
          ],
          persona: "Admin",
          adminNotes: "This is a test email — please verify formatting and links.",
        });
        break;

      case "completion":
        await sendCompletionEmail({
          testerName: name,
          testerEmail: email,
          testerId: tester!.id,
          scenarioTitle: "Admin creates & manages broker",
          passed: 18,
          failed: 3,
          blocked: 1,
          skipped: 0,
          total: 22,
          failedChecks: [
            { id: "broker-create-1", text: "Broker appears in the broker list after creation" },
            { id: "broker-edit-2", text: "Edited fields persist after page refresh" },
            { id: "broker-delete-3", text: "Deleted broker is removed from the list" },
          ],
          assignerEmail: email,
        });
        break;

      case "retest-request":
        await sendRetestRequestedEmail({
          testerEmail: email,
          testerName: name,
          adminName: name,
          checkpointText: "Broker appears in the broker list after creation",
          reason: "Fixed the query that was filtering out newly created brokers. The broker list now refreshes properly after creation.",
          whatToVerify: "Create a new broker and confirm it appears in the broker list immediately without needing to refresh the page.",
          originalNotes: "After clicking 'Create Broker' and filling out the form, the new broker does not show up in the list. Had to manually refresh to see it.",
          scenarioId: "admin-broker",
          stepIndex: 2,
          checkId: "broker-create-1",
        });
        break;

      case "retest-complete":
        await sendRetestCompletedEmail({
          testerName: name,
          testerId: tester!.id,
          checkpointText: "Broker appears in the broker list after creation",
          result: "fail",
          retestNotes: "Still not showing up immediately. I created a broker named 'Test Co' and had to wait about 10 seconds before it appeared. Slightly better but not instant.",
          whatToVerify: "Create a new broker and confirm it appears in the broker list immediately without needing to refresh the page.",
          adminEmail: email,
        });
        break;

      default:
        return NextResponse.json({ error: "Invalid type. Use: assignment, completion, retest-request, retest-complete" }, { status: 400 });
    }

    return NextResponse.json({ ok: true, sent_to: email });
  } catch (err) {
    console.error("Test email failed:", err);
    return NextResponse.json({ error: "Failed to send test email" }, { status: 500 });
  }
}
