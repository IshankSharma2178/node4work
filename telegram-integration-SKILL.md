# Telegram Integration Skill — Node4Work

## Purpose
This skill describes how to implement Telegram Bot API integration as a set of workflow nodes inside Node4Work (an n8n-style, self-hosted workflow automation platform built with Next.js, tRPC, Prisma, Inngest, and React Flow). It covers one trigger node and two action nodes, matching the MVP scope decided for this feature.

## Scope (MVP)
Implement exactly three node types:
1. **Trigger: New Telegram Message** — starts a workflow when a message is received in a chat the bot is part of.
2. **Action: Send Telegram Message** — sends a plain/formatted text message to a chat.
3. **Action: Send Telegram Message with Buttons** — sends a message with inline keyboard buttons (for approvals, choices).

Do not implement polling-based triggers, photo/document sending, polls, or message editing in this pass — those are future scope.

## Prerequisites
- A Telegram bot token, created via [@BotFather](https://t.me/BotFather) using `/newbot`. Free, no cost, no paid tiers.
- A publicly reachable HTTPS endpoint for the webhook (e.g. your deployed Next.js app's API route). Required for the trigger node — Telegram will not push updates to `localhost`.
- Rate limits to respect: ~30 messages/sec across different chats, ~1 message/sec to the same chat. No payment required at any volume within these limits.

## Architecture Overview
Follow the same pattern already used for other node types in Node4Work (e.g. the Gemini/OpenAI node) so the Telegram node is consistent with the rest of the codebase:

1. **Node schema/type definition** — describes the node's config fields, inputs, and outputs so it can render on the React Flow canvas.
2. **Node registry entry** — registers the node type + its UI component (config form) in whatever central registry existing nodes use.
3. **Execution handler** — an Inngest function (or equivalent) that runs when the workflow reaches this node, performing the actual Telegram API call.
4. **Credential storage** — the bot token stored encrypted, scoped per user/workflow, not hardcoded.
5. **Webhook route** (trigger only) — a Next.js API route that receives Telegram updates and kicks off the relevant workflow run via Inngest.

## 1. Credential Storage
- Add a `TelegramCredential` (or reuse an existing generic `Credential` model) in Prisma with fields: `id`, `userId`, `botToken` (encrypted at rest), `botUsername`, `createdAt`.
- Encrypt `botToken` before storing (reuse whatever encryption utility already secures other API keys, e.g. Gemini/OpenAI keys, in the codebase).
- Each user should be able to connect their own bot — do not share a single global bot token across users.

## 2. Trigger Node: New Telegram Message

### Setup flow
1. User provides their bot token in the node config UI (or selects a saved credential).
2. On save, call Telegram's `setWebhook` API to register the webhook URL for that bot:
   ```
   POST https://api.telegram.org/bot<TOKEN>/setWebhook
   Body: { "url": "https://yourapp.com/api/telegram/webhook/<workflowId>" }
   ```
   Include a per-workflow or per-bot identifier in the webhook path so incoming updates can be routed to the correct workflow.
3. Do not run `getUpdates` (polling) simultaneously with an active webhook — Telegram will reject one method if the other is active.

### Webhook handler (Next.js API route)
- Route: `/api/telegram/webhook/[workflowId]` (or similar, matching however other webhook-triggered workflows are routed in the existing codebase).
- Steps:
  1. Verify the request is genuinely from Telegram (optionally use a secret token param on the webhook URL for basic verification, since Telegram doesn't sign requests by default).
  2. Parse the incoming `Update` object — extract `message.chat.id`, `message.text`, `message.from`, etc.
  3. Trigger the corresponding workflow run via Inngest, passing the parsed message data as the initial trigger payload.
  4. Respond `200 OK` quickly (Telegram expects a fast response; do heavy processing async via Inngest, not inline in the webhook handler).

### Node output (available to downstream nodes)
- `chat_id`
- `message_text`
- `from.username` / `from.id`
- `date`

## 3. Action Node: Send Telegram Message

### Config fields (node UI)
- Credential/bot selector
- `chat_id` (can be a static value or interpolated from a previous node's output, e.g. `{{trigger.chat_id}}`)
- `text` (supports variable interpolation from upstream node outputs, same templating mechanism used elsewhere in Node4Work)
- `parse_mode` (optional dropdown: None / Markdown / HTML)

### Execution (Inngest function)
```
POST https://api.telegram.org/bot<TOKEN>/sendMessage
Body: {
  "chat_id": "<resolved chat_id>",
  "text": "<resolved text after variable interpolation>",
  "parse_mode": "Markdown"   // omit if None
}
```
- Resolve any `{{...}}` template variables against the workflow's current execution context before sending, using the same interpolation utility already used for other action nodes.
- On non-200 response from Telegram, throw/log the error through the existing error-handling path (Sentry), and mark the node execution as failed so the workflow run reflects it.

## 4. Action Node: Send Telegram Message with Buttons

### Config fields (node UI)
- Same base fields as the plain send-message node (credential, chat_id, text, parse_mode)
- Buttons list — an array editable in the UI, each entry with:
  - `label` (button text)
  - `value` or `callback_data` (string sent back to your bot when tapped, max 64 bytes per Telegram's limit)

### Execution (Inngest function)
```
POST https://api.telegram.org/bot<TOKEN>/sendMessage
Body: {
  "chat_id": "<resolved chat_id>",
  "text": "<resolved text>",
  "reply_markup": {
    "inline_keyboard": [
      [
        { "text": "Approve", "callback_data": "approve_<runId>" },
        { "text": "Reject", "callback_data": "reject_<runId>" }
      ]
    ]
  }
}
```
- Structure `inline_keyboard` as an array of rows, each row an array of button objects — this maps naturally to a simple UI where users add buttons and optionally group them into rows.
- Encode enough context in `callback_data` (e.g. workflow run ID + action) so that when the button is tapped, the webhook handler (see below) can resume or branch the correct workflow run. Keep under Telegram's 64-byte limit — use short IDs, not full JSON.

### Handling button taps (callback queries)
- Telegram sends `callback_query` updates to the same webhook endpoint used for messages.
- In the webhook handler, check `update.callback_query` vs `update.message` to distinguish a button tap from a regular message, and route accordingly (e.g. resume a paused Inngest workflow run waiting on approval, or trigger a new one).
- After handling, call `answerCallbackQuery` to remove the loading spinner on the user's Telegram button:
  ```
  POST https://api.telegram.org/bot<TOKEN>/answerCallbackQuery
  Body: { "callback_query_id": "<id from the update>" }
  ```

## 5. Frontend (React Flow) Integration
- Add three new entries to the node type registry, matching the pattern of an existing node (e.g. the Gemini node's registry entry):
  - `telegram-trigger`
  - `telegram-send-message`
  - `telegram-send-buttons`
- Each needs: an icon (Telegram logo), a config form component, and default/empty config values.
- Config forms should reuse existing shared form primitives already used for other nodes' config panels (credential selector, text input with variable-picker, etc.) rather than building new UI patterns from scratch.

## 6. Testing Checklist
- [ ] Bot token saved and encrypted correctly
- [ ] Webhook registers successfully (`setWebhook` returns `ok: true`)
- [ ] Sending a message to the bot triggers the workflow with correct payload
- [ ] Send-message action successfully delivers a message, including variable interpolation from a prior node
- [ ] Send-buttons action delivers correctly formatted inline buttons
- [ ] Tapping a button triggers `callback_query` handling and calls `answerCallbackQuery`
- [ ] Errors from Telegram's API (bad token, invalid chat_id, rate limit) are caught and surfaced via existing error-handling/Sentry path
- [ ] Two workflows with different bots don't cross-trigger each other's webhooks

## Notes / Things to Get Right
- Telegram webhooks require valid HTTPS with a real certificate — self-signed certs need to be explicitly uploaded via `setWebhook`'s `certificate` param; this generally isn't a concern on Vercel/standard hosting.
- `chat_id` can be negative for group chats — don't assume it's always a positive integer when validating input.
- If a user's bot is removed from a chat, sendMessage calls will start failing — surface this clearly in the workflow run's error state rather than failing silently.
- Keep the webhook handler thin: parse + hand off to Inngest, don't do heavy logic inline, since Telegram expects fast webhook responses.
