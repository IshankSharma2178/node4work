import { inngest } from "@/inngest/client";
import { createTRPCRouter, protectedProcedure } from "../init";
import prisma from "@/lib/db";

export const appRouter = createTRPCRouter({
  getWorkflows: protectedProcedure.query(({ ctx }) => {
    return prisma.workflow.findMany();
  }),
  createWorkflow: protectedProcedure.mutation(async () => {
    const workflow = await prisma.workflow.create({
      data: {
        name: `Workflow ${new Date().toISOString()}`,
      },
    });

    await inngest.send({
      name: "test/hello.world",
      data: {
        email: "Ishank@example.com",
      },
    });

    return workflow;
  }),
});
