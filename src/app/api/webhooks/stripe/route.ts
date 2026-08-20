import { type NextRequest, NextResponse } from "next/server";
import { sendWorkflowExecution } from "@/inngest/utils";
import { enforceRateLimit, webhookStripeLimiter } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const workflowId = url.searchParams.get("workflowId");

  if (!workflowId) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing required query parameter: workflowId",
      },
      { status: 400 },
    );
  }

  const rateLimited = await enforceRateLimit(webhookStripeLimiter, workflowId);
  if (rateLimited) {
    return rateLimited;
  }

  try {
    const body = await request.json();
    const stripeData = {
      eventId: body.id,
      eventType: body.type,
      timestamp: body.created,
      livemode: body.livemode,
      raw: body.data?.object,
    };

    const result = await sendWorkflowExecution({
      workflowId,
      idempotencyKey: `stripe:${body.id}`,
      initialData: {
        stripe: stripeData,
      },
    });

    if (!result) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true, status: 200 });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process Stripe event",
      },
      { status: 500 },
    );
  }
}
