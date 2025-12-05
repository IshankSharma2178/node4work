import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";

import { execute } from "@/inngest/functions";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI();
// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [execute],
});
