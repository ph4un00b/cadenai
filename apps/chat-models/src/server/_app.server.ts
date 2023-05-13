/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 2. initialize our main router instance
 * @see https://trpc.io/docs/quickstart#2-add-a-query-procedure
 */

import { env } from "@/env.mjs";
import { Client } from "@planetscale/database";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { z } from "zod";

import { UpstashCache } from "@acme/shared";

import { publicProcedure, router } from "./trpc";

const aiOpts = {
	// cache: new UpstashCache({
	// 	url: env.REDIS_ENDPOINT,
	// 	token: env.REDIS_TOKEN,
	// }),
	cache: true,
	openAIApiKey: env.OPENAI_API_KEY,
	temperature: 0,
	maxRetries: 1,
	verbose: true,
	concurrency: 1,
	maxConcurrency: 1,
};

const chat = new ChatOpenAI(aiOpts);

const db = new Client({
	fetch,
	host: env.DATABASE_HOST,
	username: env.DATABASE_USER,
	password: env.DATABASE_PASS,
});

const timerSchema = z.object({
	payload: z.object({
		completed: z.boolean(),
		timeLeft: z.string().nullish(),
		raw: z.string(),
	}),
});
export const appRouter = router({
	alo: publicProcedure.input(z.string()).query(({ input }) => {
		return "... from server! 🎈 " + input;
	}),
	/**
	 * @see https://platform.openai.com/docs/guides/chat/chat-vs-completions
	 *
	 * Translate the following English text to French: "{text}"
	 *
	 * [
	 * 	{"role": "user", "content": 'Translate the following English text to French: "{text}"'}
	 * ]
	 *
	 * [
	 * 	{"role": "system", "content": "You are a helpful assistant that translates English to French."},
	 * 	{"role": "user", "content": 'Translate the following English text to French: "{text}"'}
	 * ]
	 */
	chat: publicProcedure
		.output(z.object({ payload: z.string() }))
		.mutation(async ({}) => {
			// const chat = new ChatOpenAI(aiOpts);
			const messages = [
				new HumanChatMessage(
					"Translate this sentence from English to French. I love programming.",
				),
			];
			const response = await chat.call(messages);
			return { payload: JSON.stringify(response, null, 2) };
		}),
	chat2: publicProcedure
		.output(z.object({ payload: z.string() }))
		.mutation(async ({}) => {
			// const chat = new ChatOpenAI(aiOpts);
			const messages = [
				new SystemChatMessage(
					"You are a helpful assistant that translates English to French.",
				),
				new HumanChatMessage("Translate: I love programming."),
			];
			const responseB = await chat.call(messages);
			return { payload: JSON.stringify(responseB, null, 2) };
		}),
	chat3: publicProcedure
		.output(z.object({ payload: z.string() }))
		.mutation(async ({}) => {
			// const chat = new ChatOpenAI(aiOpts);
			const messages = [
				[
					new SystemChatMessage(
						"You are a helpful assistant that translates English to French.",
					),
					new HumanChatMessage(
						"Translate this sentence from English to French. I love programming.",
					),
				],
				[
					new SystemChatMessage(
						"You are a helpful assistant that translates English to French.",
					),
					new HumanChatMessage(
						"Translate this sentence from English to French. I love artificial intelligence.",
					),
				],
			];
			// got 429!
			const responseC = await chat.generate(messages);
			return { payload: JSON.stringify(responseC, null, 2) };
		}),
	statusTimer: publicProcedure.output(timerSchema).query(async ({}) => {
		const threshold = 10;
		const conn = db.connection();
		const { rows } = await conn.execute(
			`
			SELECT
				owner
				, status
				, startedAt
				, (startedAt + INTERVAL ${threshold} MINUTE) as endingAt
				, CURRENT_TIMESTAMP() AS serverTime
				, TIMEDIFF((startedAt + INTERVAL ${threshold} MINUTE), CURRENT_TIMESTAMP()) AS timeDifference
				, IF(CURRENT_TIMESTAMP() BETWEEN startedAt AND (startedAt + INTERVAL ${threshold} MINUTE)
					, NULL
					, 1
				) AS isReady
			FROM
				QueueTest
			WHERE
				LOWER(payload) = "chat model"
			LIMIT 1;
			`,
		);

		const schema = z.object({
			owner: z.number(),
			status: z.string(),
			startedAt: z.string(),
			endingAt: z.string(),
			serverTime: z.string(),
			timeDifference: z.string(),
			isReady: z.coerce.boolean(),
		});

		const [data] = rows;
		const parsed = schema.parse(data);
		return {
			payload: {
				completed: parsed.isReady,
				timeLeft: parsed.isReady ? "00:00" : parsed.timeDifference,
				raw: JSON.stringify(parsed, null, 2),
			},
		};
	}),
	newTimer: publicProcedure.output(timerSchema).mutation(async ({}) => {
		const conn = db.connection();
		const { rows, rowsAffected } = await conn.execute(
			`
			UPDATE QueueTest
			SET

				owner = 1111, -- hardcoded chat-model id owner
				available = 1,
				status = 'IN_PROGRESS',
				startedAt = NOW()
			WHERE
				payload = "CHAT MODEL"
			AND
				available = 0
			LIMIT 1;
			`,
		);
		return {
			payload: {
				completed: rowsAffected === 0 ? false : true,
				raw: JSON.stringify({ affected: rowsAffected }, null, 2),
			},
		};
	}),
	endTimer: publicProcedure.output(timerSchema).mutation(async ({}) => {
		const conn = db.connection();
		const { rows, rowsAffected } = await conn.execute(
			`
			UPDATE QueueTest
			SET
				available = 0,
				status = 'COMPLETED',
				finishedAt = NOW()
			WHERE
				payload = "CHAT MODEL"
			AND
				available = 1
			LIMIT 1;
			`,
		);
		return {
			payload: {
				completed: rowsAffected === 0 ? false : true,
				raw: JSON.stringify({ affected: rowsAffected }, null, 2),
			},
		};
	}),
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
