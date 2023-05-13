import { appRouter } from "@/server/_app.server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

/**
 * @abstract
 * @see https://github.com/acdlite/rfcs/blob/first-class-promises/text/0000-first-class-support-for-promises.md
 *
 * @todo: research about cache!
 *
 * @param req
 * @returns
 */
const handler = (req: Request) =>
	fetchRequestHandler({
		endpoint: "/api/trpc",
		req,
		router: appRouter,
		createContext: () => ({}),
	});

export { handler as GET, handler as POST };
