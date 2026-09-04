import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { serve } from "inngest/next";

import { executeWorkflow } from "@/inngest/functions";
import { inngest } from "../../../inngest/client";

const _google = createGoogleGenerativeAI();
// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [executeWorkflow],
});
