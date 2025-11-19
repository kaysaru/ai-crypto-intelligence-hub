import { z } from 'zod';
import { router, publicProcedure } from '../router';
import { analyses, agentMessages } from '../../db';
import { desc, eq } from 'drizzle-orm';
import { createAnalysisSchema } from '@crypto-intel/shared';

export const analysisRouter = router({
  // Create new analysis
  create: publicProcedure
    .input(createAnalysisSchema)
    .mutation(async ({ input, ctx }) => {
      // Insert analysis record
      const [analysis] = await ctx.db
        .insert(analyses)
        .values({
          cryptocurrency: input.cryptocurrency,
          status: 'pending',
          metadata: input.newsSources ? { newsSources: input.newsSources } : undefined,
        })
        .returning();

      // Emit WebSocket event
      ctx.io.emit('analysis:started', { analysisId: analysis.id });

      // TODO: Trigger LangGraph workflow here
      console.log(`Analysis ${analysis.id} created for ${input.cryptocurrency}`);

      return analysis;
    }),

  // Get analysis by ID
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const analysis = await ctx.db.query.analyses.findFirst({
        where: eq(analyses.id, input.id),
      });

      if (!analysis) {
        throw new Error('Analysis not found');
      }

      // Get associated agent messages
      const messages = await ctx.db.query.agentMessages.findMany({
        where: eq(agentMessages.analysisId, input.id),
        orderBy: [desc(agentMessages.timestamp)],
      });

      return {
        ...analysis,
        messages,
      };
    }),

  // List all analyses
  list: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).default(20),
          offset: z.number().min(0).default(0),
        })
        .optional()
    )
    .query(async ({ input, ctx }) => {
      const limit = input?.limit ?? 20;
      const offset = input?.offset ?? 0;

      const allAnalyses = await ctx.db.query.analyses.findMany({
        orderBy: [desc(analyses.startedAt)],
        limit,
        offset,
      });

      return allAnalyses;
    }),

  // Delete analysis
  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db.delete(analyses).where(eq(analyses.id, input.id));

      return { success: true };
    }),
});
