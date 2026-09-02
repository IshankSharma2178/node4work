import { workbench } from "@getworkbench/next";
import { getEmailQueue } from "@/lib/queue/email-queue";

export const runtime = "nodejs";

const emailQueue = getEmailQueue();

const auth = process.env.QUEUE_DASHBOARD_USER
  ? {
      username: process.env.QUEUE_DASHBOARD_USER,
      password: process.env.QUEUE_DASHBOARD_PASSWORD ?? "",
    }
  : null;

// Never expose the dashboard unauthenticated in production.
const handlers =
  emailQueue && (process.env.NODE_ENV !== "production" || auth)
    ? workbench({
        queues: [emailQueue],
        basePath: "/admin/queues",
        title: "Nodebase · Queue",
        tags: ["email"],
        ...(auth ? { auth } : {}),
      })
    : null;

const disabled = () =>
  new Response("Queue dashboard is not available", { status: 404 });

export function GET(request: Request) {
  return handlers ? handlers.GET(request) : disabled();
}

export function POST(request: Request) {
  return handlers ? handlers.POST(request) : disabled();
}

export function PUT(request: Request) {
  return handlers ? handlers.PUT(request) : disabled();
}

export function PATCH(request: Request) {
  return handlers ? handlers.PATCH(request) : disabled();
}

export function DELETE(request: Request) {
  return handlers ? handlers.DELETE(request) : disabled();
}
