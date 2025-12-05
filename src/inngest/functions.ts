import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { inngest } from "./client";
import { generateText } from "ai";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEYs,
});
// const openAi = createOpenAI();
// const anthropic = createAnthropic();

export const execute = inngest.createFunction(
  { id: "execute-ai" },
  { event: "execute/ai" },
  async ({ event, step }) => {
    const { steps: geminiSteps } = await step.ai.wrap(
      "gemini-generate-text",
      generateText,
      {
        model: google("gemini-2.5-flash"),
        system: "You are a helpful assistant.",
        prompt: "What is 2 + 2?",
      }
    );

    // const { steps: openaiSteps } = await step.ai.wrap(
    //   "openai-generate-text",
    //   generateText,
    //   {
    //     model: openAi("gpt-4"),
    //     system: "You are a helpful assistant.",
    //     prompt: "What is 2 + 2?",
    //   }
    // );

    // const { steps: anthropicSteps } = await step.ai.wrap(
    //   "anthropic-generate-text",
    //   generateText,
    //   {
    //     model: anthropic("claude-sonnet-4-0"),
    //     system: "You are a helpful assistant.",
    //     prompt: "What is 2 + 2?",
    //   }
    // );

    return {
      geminiSteps,
      // openaiSteps,
      // anthropicSteps,
    };
  }
);
