import { timingSafeEqual } from "node:crypto";
import { NodeType } from "@prisma/client";
import { NextResponse } from "next/server";
import { sendWorkflowExecution } from "@/inngest/utils";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { telegramRequest, telegramWebhookSecret } from "@/lib/telegram";

type Params = { workflowId: string };

export async function POST(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  const { workflowId } = await params;

  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    include: { nodes: true },
  });

  if (!workflow) {
    return NextResponse.json(
      { success: false, error: "Workflow not found" },
      { status: 404 },
    );
  }

  const triggerNode = workflow.nodes.find(
    (node) => node.type === NodeType.TELEGRAM_TRIGGER,
  );

  const credentialId = (
    triggerNode?.data as { credentialId?: string } | undefined
  )?.credentialId;

  if (!triggerNode || !credentialId) {
    return NextResponse.json(
      { success: false, error: "Telegram trigger not configured" },
      { status: 400 },
    );
  }

  const credential = await prisma.credential.findUnique({
    where: { id: credentialId },
  });

  if (!credential) {
    return NextResponse.json(
      { success: false, error: "Credential not found" },
      { status: 500 },
    );
  }

  const token = decrypt(credential.value);

  const expected = Buffer.from(telegramWebhookSecret(token, workflowId), "hex");
  const receivedSecret = request.headers.get("x-telegram-bot-api-secret-token");
  const received = Buffer.from(receivedSecret ?? "", "hex");

  if (
    !receivedSecret ||
    expected.length !== received.length ||
    !timingSafeEqual(expected, received)
  ) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();

    if (body.callback_query) {
      const callbackQuery = body.callback_query;

      await telegramRequest(token, "answerCallbackQuery", {
        callback_query_id: callbackQuery.id,
      });

      return NextResponse.json({ success: true });
    }

    if (body.message) {
      const message = body.message;

      const telegramData = {
        chat: {
          id: message.chat.id,
          type: message.chat.type,
          title: message.chat.title ?? undefined,
          username: message.chat.username ?? undefined,
        },
        text: message.text ?? "",
        from: {
          id: message.from?.id,
          username: message.from?.username,
          first_name: message.from?.first_name,
          last_name: message.from?.last_name,
        },
        date: message.date,
        messageId: message.message_id,
        raw: message,
      };

      await sendWorkflowExecution({
        workflowId,
        initialData: {
          telegram: telegramData,
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true, ignored: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Webhook error",
      },
      { status: 500 },
    );
  }
}
