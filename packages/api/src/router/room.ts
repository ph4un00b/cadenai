import crypto from "crypto";
import { EventEmitter } from "events";
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

// from trpc example
interface MyEvents {
	add: (data: Message) => void;
	isTypingUpdate: () => void;
}
declare interface MyEventEmitter {
	on<TEv extends keyof MyEvents>(event: TEv, listener: MyEvents[TEv]): this;
	off<TEv extends keyof MyEvents>(event: TEv, listener: MyEvents[TEv]): this;
	once<TEv extends keyof MyEvents>(event: TEv, listener: MyEvents[TEv]): this;
	emit<TEv extends keyof MyEvents>(
		event: TEv,
		...args: Parameters<MyEvents[TEv]>
	): boolean;
}

class MyEventEmitter extends EventEmitter {}

// In a real app, you'd probably use Redis or something
const ee = new MyEventEmitter();
// ee.on("add", () => console.log("adding!"));

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

			const y = ctx.ee.emit("add", msg);
			console.log({ y });
			return true;
		}),
	onAdd: publicProcedure.subscription(({ ctx }) => {
		console.log("suscrito!! ❤");
		return observable<Message>((emit) => {
			const onAdd = (data: Message) => emit.next(data);
			ctx.ee.on("add", onAdd);
			return () => {
				ctx.ee.off("add", onAdd);
			};
		});
	}),
	onAdd2: publicProcedure.subscription(() => {
		console.log("suscrito!! ❤❤❤❤");
		// return an `observable` with a callback which is triggered immediately
		return observable<Message>((emit) => {
			const onAdd = (data: Message) => {
				// emit data to client
				emit.next(data);
			};
			// trigger `onAdd()` when `add` is triggered in our event emitter
			ee.on("add", onAdd);
			// unsubscribe function when client disconnects or stops subscribing
			return () => {
				ee.off("add", onAdd);
			};
		});
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
			const x = ee.emit("add", msg);
			console.log({ x });
			return true;
		}),
});
