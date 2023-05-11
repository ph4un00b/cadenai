/**
 * 1.
 * @see https://trpc.io/docs/quickstart#1-create-a-router-instance
 */
import { initTRPC } from "@trpc/server";
import superjson from "superjson";

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.create({ transformer: superjson });
/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;
