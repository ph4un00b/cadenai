import { observable } from "@trpc/server/observable";
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

			ctx.ee.emit("event-1", msg);
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

			ctx.ee.emit("event-1", msg);
			return true;
		}),
	onMsg: publicProcedure
		.input(messageSchema)
		// .output(z.object({ payload: z.string() }))
		.subscription(({ ctx, input }) => {
			return observable<Message>((emit) => {
				const onMessage = (data: Message) => {
					if (input.roomId !== data.roomId) return;
					// emit data to client
					emit.next(data);
				};
				// trigger `onMessage()` when `add` is triggered in our event emitter
				ctx.ee.on("event-1", onMessage);
				// unsubscribe function when client disconnects or stops subscribing
				return () => {
					ctx.ee.off("event-1", onMessage);
				};
			});
		}),
});
