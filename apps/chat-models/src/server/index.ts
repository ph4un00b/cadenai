/**
 * 2. initialize our main router instance
 * @see https://trpc.io/docs/quickstart#2-add-a-query-procedure
 */
import { publicProcedure, router } from "./trpc";

const appRouter = router({
	alo: publicProcedure.query(() => {
		return "alo jamon!🎈";
	}),
});
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
