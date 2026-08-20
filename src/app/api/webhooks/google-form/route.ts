import { type NextRequest, NextResponse } from "next/server";
import { sendWorkflowExecution } from "@/inngest/utils";
import { enforceRateLimit, webhookGoogleFormLimiter } from "@/lib/rate-limit";

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

  const rateLimited = await enforceRateLimit(
    webhookGoogleFormLimiter,
    workflowId,
  );
  if (rateLimited) {
    return rateLimited;
  }

  try {
    const body = await request.json();

    const formData = {
      formId: body.formId,
      formTitle: body.formTitle,
      responseId: body.responseId,
      timestamp: body.timestamp,
      respondentEmail: body.respondentEmail,
      responses: body.responses,
      raw: body,
    };

    const result = await sendWorkflowExecution({
      workflowId,
      idempotencyKey: `google-form:${body.responseId}`,
      initialData: {
        googleForm: formData,
      },
    });

    if (!result) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true, status: 200 });
  } catch (error) {
    console.log("Google Form webhook error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process Google Form submission" },
      { status: 500 },
    );
  }
}
