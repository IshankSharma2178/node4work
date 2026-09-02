import { NodeType, type Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type { Edge, Node } from "@xyflow/react";
import { generateSlug } from "random-word-slugs";
import z from "zod";
import { PAGINATION, WORKFLOW_LIMITS } from "@/config/constants";
import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";
import { isActiveSubscriber } from "@/lib/subscription";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const workflowsRouter = createTRPCRouter({
  execute: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });

      await inngest.send({
        name: "workflows/execute.workflow",
        data: { workflowId: input.id },
      });

      return workflow;
    }),
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.auth.user.id;

    // Free users are capped at WORKFLOW_LIMITS.FREE workflows. The count check
    // and insert run inside a transaction that locks the owning user row
    // (SELECT ... FOR UPDATE), so concurrent creates can never sneak past the
    // limit.
    const isPremium = await isActiveSubscriber(userId);

    return prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT 1 FROM "user" WHERE id = ${userId} FOR UPDATE`;

      if (!isPremium) {
        const workflowCount = await tx.workflow.count({ where: { userId } });

        if (workflowCount >= WORKFLOW_LIMITS.FREE) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `You've used all ${WORKFLOW_LIMITS.FREE} free workflows. Upgrade to Pro to create more.`,
          });
        }
      }

      return tx.workflow.create({
        data: {
          name: generateSlug(3),
          userId,
          nodes: {},
        },
      });
    });
  }),
  usage: protectedProcedure.query(async ({ ctx }) => {
    const [workflowCount, isPremium] = await Promise.all([
      prisma.workflow.count({ where: { userId: ctx.auth.user.id } }),
      isActiveSubscriber(ctx.auth.user.id),
    ]);

    return {
      workflowCount,
      freeLimit: WORKFLOW_LIMITS.FREE,
      isPremium,
    };
  }),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return prisma.workflow.delete({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        nodes: z.array(
          z.object({
            id: z.string(),
            type: z.string().nullish(),
            position: z.object({ x: z.number(), y: z.number() }),
            data: z.record(z.string(), z.any()).optional(),
          }),
        ),
        edges: z.array(
          z.object({
            source: z.string(),
            target: z.string(),
            sourceHandle: z.string().nullish(),
            targetHandle: z.string().nullish(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, nodes, edges } = input;

      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id, userId: ctx.auth.user.id },
        include: { nodes: true },
      });

      //Merge nodes instead of delete-all + recreate so existing node data is
      //never wiped when the client sends an incomplete snapshot.
      return await prisma.$transaction(async (tx) => {
        const existingNodeIds = new Set(workflow.nodes.map((node) => node.id));

        for (const node of nodes) {
          const updateData: Prisma.NodeUpdateWithoutWorkflowInput = {
            position: node.position,
          };

          if (node.type) {
            updateData.type = node.type as NodeType;
            updateData.name = node.type;
          }

          //Only overwrite data when the client actually sent data. An empty
          //object means the config wasn't loaded and we should keep what is in
          //the database.
          if (node.data && Object.keys(node.data).length > 0) {
            updateData.data = node.data;
          }

          await tx.node.upsert({
            where: { id: node.id },
            create: {
              id: node.id,
              workflowId: id,
              name: node.type || "unknown",
              type: (node.type || NodeType.INITIAL) as NodeType,
              position: node.position,
              data: node.data || {},
            },
            update: updateData,
          });
        }

        //Delete nodes that no longer exist (cascade deletes their connections)
        const removedNodeIds = [...existingNodeIds].filter(
          (nodeId) => !nodes.some((node) => node.id === nodeId),
        );
        if (removedNodeIds.length > 0) {
          await tx.node.deleteMany({
            where: { id: { in: removedNodeIds }, workflowId: id },
          });
        }

        //Replace connections
        await tx.connection.deleteMany({
          where: { workflowId: id },
        });

        if (edges.length > 0) {
          await tx.connection.createMany({
            data: edges.map((edge) => ({
              workflowId: id,
              fromNodeId: edge.source,
              toNodeId: edge.target,
              fromOutput: edge.sourceHandle || "main",
              toInput: edge.targetHandle || "main",
            })),
          });
        }

        //Update workflow updateAt timestamp
        await tx.workflow.update({
          where: { id },
          data: { updatedAt: new Date() },
        });

        return workflow;
      });
    }),
  updateName: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string().min(1) }))
    .mutation(({ ctx, input }) => {
      return prisma.workflow.update({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
        data: {
          name: input.name,
        },
      });
    }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
        include: {
          nodes: true,
          connections: true,
        },
      });

      //Transform server nodes to react-flow compatible nodes
      const nodes: Node[] = workflow.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position as { x: number; y: number },
        data: (node.data as Record<string, unknown>) || {},
      }));

      //Transform server connections to react-flow compatible edges
      const edges: Edge[] = workflow.connections.map((connection) => ({
        id: connection.id,
        source: connection.fromNodeId,
        target: connection.toNodeId,
        sourceHandle: connection.fromOutput,
        targetHandle: connection.toInput,
      }));

      return {
        id: workflow.id,
        name: workflow.name,
        nodes,
        edges,
      };
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;

      const [items, totalCount] = await Promise.all([
        prisma.workflow.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where: {
            userId: ctx.auth.user.id,
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
        }),
        prisma.workflow.count({
          where: {
            userId: ctx.auth.user.id,
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        items,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      };
    }),
});
