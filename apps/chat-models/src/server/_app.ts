/**
 * 2. initialize our main router instance
 * @see https://trpc.io/docs/quickstart#2-add-a-query-procedure
 */

import { z } from "zod";

import { publicProcedure, router } from "./trpc";

export const appRouter = router({
	alo: publicProcedure.input(z.string()).query(({ input }) => {
		return "alo jamon! 🎈 " + input;
	}),
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
