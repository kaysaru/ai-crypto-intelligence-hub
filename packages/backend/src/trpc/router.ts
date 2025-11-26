import { router } from './procedures';
import { analysisRouter } from './routers/analysis.router';
import { reportsRouter } from './routers/reports.router';

export const appRouter = router({
  analysis: analysisRouter,
  reports: reportsRouter,
});

export type AppRouter = typeof appRouter;
