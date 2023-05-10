/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1)
 * 2. You want to create a new middleware or type of procedure (see Part 3)
 *
 * tl;dr - this is where all the tRPC server stuff is created and plugged in.
 * The pieces you will need to use are documented accordingly near the end
 */

import { type EventEmitter } from "node:events";
import { type IncomingMessage } from "node:http";
import { TRPCError, initTRPC, type inferAsyncReturnType } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { type NodeHTTPCreateContextFnOptions } from "@trpc/server/adapters/node-http";
import superjson from "superjson";
import type ws from "ws";
import { ZodError } from "zod";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getReactSession, getServerSession, type Session } from "@acme/auth";
import { prisma } from "@acme/db";

import { ee } from "./utils/eventemitter.class";

// import { createEventEmitter } from "./utils/eventemitter.classless";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API
 *
 * These allow you to access things like the database, the session, etc, when
 * processing a request
 *
 */
type CreateContextOptions = {
	session: Session | null;
	req: IncomingMessage | null;
	res: ws | null;
};

/**
 * This helper generates the "internals" for a tRPC context. If you need to use
 * it, you can export it from here
 *
 * Examples of things you may need it for:
 * - testing, so we dont have to mock Next.js' req/res
 * - trpc's `createSSGHelpers` where we don't have req/res
 * @see https://create.t3.gg/en/usage/trpc#-servertrpccontextts
 */

// const ee = new EventEmitter();
// const ee = createEventEmitter<{ bar: () => void }>();
const createInnerTRPCContext = (opts: CreateContextOptions) => {
	console.log({ session: opts.session });
	return {
		session: opts.session,
		req: opts.req,
		res: opts.res,
		prisma,
		ee,
	};
};

/**
 * This is the actual context you'll use in your router. It will be used to
 * process every request that goes through your tRPC endpoint
 * @link https://trpc.io/docs/context
 */

function isAPIRequest(
	maybe: unknown,
): maybe is CreateNextContextOptions["req"] {
	return (maybe as EventEmitter).emit === undefined;
}
function isAPIResponse(
	maybe: unknown,
): maybe is CreateNextContextOptions["res"] {
	return (maybe as EventEmitter).emit === undefined;
}

export const createTRPCContext = async (
	opts:
		| CreateNextContextOptions
		| NodeHTTPCreateContextFnOptions<IncomingMessage, ws>,
) => {
	let req: CreateNextContextOptions["req"];
	let _res: CreateNextContextOptions["res"];
	console.log(opts);
	if (isAPIResponse(opts.res) && isAPIRequest(opts.req)) {
		console.log(">>>>>> SERVER");
		// res = opts.res;
		req = opts.req;
		// Get the session from the server using the unstable_getServerSession wrapper function
		// const session = await getServerSession({ req, res });
		const session = await getReactSession({ req });
		return createInnerTRPCContext({ session, req: null, res: null });
	}

	if (!isAPIResponse(opts.res) && !isAPIRequest(opts.req)) {
		console.log("<<<<<<<< WS");
		// console.log({ opts });

		return createInnerTRPCContext({
			session: null,
			req: opts.req,
			res: opts.res,
		});
	}

	return createInnerTRPCContext({ session: null, req: null, res: null });
};

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
type Context = inferAsyncReturnType<typeof createTRPCContext>;

const t = initTRPC.context<Context>().create({
	transformer: superjson,
	errorFormatter({ shape, error }) {
		const data = {
			...shape.data,
			zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
		};
		const formatted = { ...shape, data };
		return formatted;
	},
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

const logger = t.middleware(async ({ path, type, next }) => {
	const start = performance.now();

	// const callName = `${path}-${type}😱`;
	// console.time(callName);
	const result = await next();
	// console.timeEnd(callName);

	const end = performance.now();
	const elapsed = end - start;
	console.log(`😱 ${path}-${type} Elapsed time: ${elapsed} milliseconds`);
	return result;
});

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure.use(logger);

/**
 * Reusable middleware that enforces users are logged in before running the
 * procedure
 */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
	if (!ctx.session?.user) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}
	return next({
		ctx: {
			// infers the `session` as non-nullable
			session: { ...ctx.session, user: ctx.session.user },
		},
	});
});

/**
 * Protected (authed) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use
 * this. It verifies the session is valid and guarantees ctx.session.user is not
 * null
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
