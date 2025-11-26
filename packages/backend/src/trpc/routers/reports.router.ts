import { z } from 'zod';
import { router, publicProcedure } from '../procedures';
import { reports, analyses } from '../../db';
import { desc, eq } from 'drizzle-orm';

export const reportsRouter = router({
  // Get report by ID
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const report = await ctx.db.query.reports.findFirst({
        where: eq(reports.id, input.id),
      });

      if (!report) {
        throw new Error('Report not found');
      }

      return report;
    }),

  // Get report by analysis ID
  getByAnalysisId: publicProcedure
    .input(z.object({ analysisId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const report = await ctx.db.query.reports.findFirst({
        where: eq(reports.analysisId, input.analysisId),
      });

      return report;
    }),

  // List all reports
  list: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).default(20),
          offset: z.number().min(0).default(0),
          cryptocurrency: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input, ctx }) => {
      const limit = input?.limit ?? 20;
      const offset = input?.offset ?? 0;

      const allReports = await ctx.db.query.reports.findMany({
        where: input?.cryptocurrency
          ? eq(reports.cryptocurrency, input.cryptocurrency)
          : undefined,
        orderBy: [desc(reports.generatedAt)],
        limit,
        offset,
      });

      return allReports;
    }),
});
