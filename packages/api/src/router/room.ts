/* eslint-disable @typescript-eslint/no-unused-vars */
import crypto from "crypto";
import { type } from "arktype";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

const schema = z.object({
	OPENAI_API_KEY: z.string(),
	REDIS_ENDPOINT: z.string().url(),
	REDIS_TOKEN: z.string(),
	DEV_MODE: z.coerce.boolean(),
	DATABASE_HOST: z.string(),
	DATABASE_USER: z.string(),
	DATABASE_PASS: z.string(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
	const { fieldErrors } = parsed.error.flatten();
	console.error("❌ Invalid environment variables in api/ai", fieldErrors);
	throw new Error("Invalid environment variables in api/ai");
}

// const env = Object.freeze(p arsed.data);

const messageSchema = z.object({
	id: z.string(),
	message: z.string(),
	roomId: z.string(),
	sendAt: z.string(),
	sender: z.object({
		name: z.string(),
	}),
});

export type Message = z.infer<typeof messageSchema>;

export const roomRouter = createTRPCRouter({
	sendMsg: publicProcedure
		.input(
			type({
				roomId: "string",
				message: "string",
			}).assert,
		)
		// .output(z.object({ payload: z.string() }))
		.mutation(({ input, ctx }) => {
			const msg: Message = {
				id: crypto.randomUUID(),
				...input,
				sendAt: new Date().toISOString(),
				sender: { name: ctx.session?.user.name ?? "ghost" },
			};

			// const y = ctx.ee.emit("add", msg);
			return true;
		}),
	sendMsgZod: publicProcedure
		.input(
			z.object({
				roomId: z.string(),
				message: z.string(),
			}),
		)
		// .output(z.object({ payload: z.string() }))
		.mutation(({ input, ctx }) => {
			const msg: Message = {
				id: crypto.randomUUID(),
				...input,
				sendAt: new Date().toISOString(),
				sender: { name: ctx.session?.user.name ?? "ghost" },
			};

			// unsubscribe function when client disconnects or stops subscribing
			/**
			 * nextjs seems to create more than one process
			 * even on local development
			 * hence when it's time to emit
			 * it has no listeners
			 */
			// const x = ee.emit("add", msg);
			return true;
		}),
});
