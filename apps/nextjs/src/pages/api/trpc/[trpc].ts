import { createNextApiHandler } from "@trpc/server/adapters/next";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";

import { appRouter, createTRPCContext } from "@acme/api";

// export API handler
export default createNextApiHandler({
	router: appRouter,
	createContext: createTRPCContext,
	onError({ error, type, path }) {
		const status = getHTTPStatusCodeFromError(error);
		console.log({ status });

		if (status === 429) {
			console.error(
				`😱😱 limit reached on llm, ${type} - ${path ?? "<no-path>"}`,
			);
		} else if (error.code === "INTERNAL_SERVER_ERROR") {
			// send to bug reporting
			console.error(
				`${error.code} 🔥🔥 tRPC failed on ${type} - ${path ?? "<no-path>"}: ${
					error.message
				}`,
			);
		}
		console.error("Something went wrong", error);
	},
});

// If you need to enable cors, you can do so like this:
// const handler = async (req: NextApiRequest, res: NextApiResponse) => {
//   // Enable cors
//   await cors(req, res);

//   // Let the tRPC handler do its magic
//   return createNextApiHandler({
//     router: appRouter,
//     createContext,
//   })(req, res);
// };

// export default handler;
