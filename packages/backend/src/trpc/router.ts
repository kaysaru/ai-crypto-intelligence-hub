import { initTRPC } from '@trpc/server';
import { Context } from './context';
import { analysisRouter } from './routers/analysis.router';
import { reportsRouter } from './routers/reports.router';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const appRouter = router({
  analysis: analysisRouter,
  reports: reportsRouter,
});

export type AppRouter = typeof appRouter;
