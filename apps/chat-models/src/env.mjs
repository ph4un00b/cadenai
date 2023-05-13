// src/env.mjs
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	/*
	 * Serverside Environment variables, not available on the client.
	 * Will throw if you access these variables on the client.
	 */
	server: {
		DATABASE_URL: z.string().url(),
		OPENAI_API_KEY: z.string().min(1),
		REDIS_ENDPOINT: z.string().url(),
		REDIS_TOKEN: z.string(),
		DATABASE_HOST: z.string(),
		DATABASE_USER: z.string(),
		DATABASE_PASS: z.string(),
	},
	/*
	 * Environment variables available on the client (and server).
	 *
	 * 💡 You'll get typeerrors if these are not prefixed with NEXT_PUBLIC_.
	 */
	client: {
		// NEXT_PUBLIC_WS_URL: z.string().min(1),
	},
	/*
	 * Due to how Next.js bundles environment variables on Edge and Client,
	 * we need to manually destructure them to make sure all are included in bundle.
	 *
	 * 💡 You'll get typeerrors if not all variables from `server` & `client` are included here.
	 */
	runtimeEnv: {
		DATABASE_URL: process.env.DATABASE_URL,
		OPENAI_API_KEY: process.env.OPENAI_API_KEY,
		// NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
		REDIS_ENDPOINT: process.env.REDIS_ENDPOINT,
		REDIS_TOKEN: process.env.REDIS_TOKEN,
		DATABASE_HOST: process.env.DATABASE_HOST,
		DATABASE_USER: process.env.DATABASE_USER,
		DATABASE_PASS: process.env.DATABASE_PASS,
	},
});
