/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 2. initialize our main router instance
 * @see https://trpc.io/docs/quickstart#2-add-a-query-procedure
 */

import { env } from "@/env.mjs";
import { Client } from "@planetscale/database";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { AgentExecutor, ChatAgent } from "langchain/agents";
import { LLMChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import {
	ChatPromptTemplate,
	HumanMessagePromptTemplate,
	SystemMessagePromptTemplate,
} from "langchain/prompts";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { DynamicTool, type Tool } from "langchain/tools";
import { Calculator } from "langchain/tools/calculator";
import { z } from "zod";

import { phaubonacci, phaudecrypter, phauencrypter } from "@acme/shared";

import { publicProcedure, router } from "./trpc";

// import { UpstashCache } from "@acme/shared";
const llm = new ChatOpenAI({
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
});

const db = new Client({
	fetch,
	host: env.DATABASE_HOST,
	username: env.DATABASE_USER,
	password: env.DATABASE_PASS,
});

const timerSchema = z.object({
	payload: z.object({
		completed: z.boolean(),
		timeLeft: z.coerce.number().nullish(),
		raw: z.string(),
	}),
});

/**
 * @todo
 * add rate limiter
 */
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
			const response = await llm.call(messages);
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
			const responseB = await llm.call(messages);
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
			const responseC = await llm.generate(messages);
			return { payload: JSON.stringify(responseC, null, 2) };
		}),
	chatTemplates: publicProcedure
		.output(z.object({ payload: z.string() }))
		.mutation(async ({}) => {
			const messages = [
				SystemMessagePromptTemplate.fromTemplate(
					"You are a helpful assistant that translates {input_language} to {output_language}.",
				),
				HumanMessagePromptTemplate.fromTemplate("{text}"),
			];
			const prompt = ChatPromptTemplate.fromPromptMessages(messages);
			const values = [
				await prompt.formatPromptValue({
					input_language: "English",
					output_language: "French",
					text: "I love programming.",
				}),
			];
			const responseA = await llm.generatePrompt(values);
			return { payload: JSON.stringify(responseA, null, 2) };
		}),
	/**
	 * prefer chain over template
	 *
	 * using chains seems to be cheaper?
	 * @todo research!
	 */
	chatChain: publicProcedure
		.output(z.object({ payload: z.string() }))
		.mutation(async ({}) => {
			const messages = [
				SystemMessagePromptTemplate.fromTemplate(
					"You are a helpful assistant that translates {input_language} to {output_language}.",
				),
				HumanMessagePromptTemplate.fromTemplate("{text}"),
			];
			const prompt = ChatPromptTemplate.fromPromptMessages(messages);
			const chain = new LLMChain({ prompt, llm });
			const responseB = await chain.call({
				input_language: "English",
				output_language: "French",
				text: "I love programming.",
			});
			return { payload: JSON.stringify(responseB, null, 2) };
		}),
	chatAgent: publicProcedure
		.output(z.object({ payload: z.string() }))
		.mutation(async ({}) => {
			const tools: Tool[] = [
				new Calculator(),
				new DynamicTool({
					name: "phaubonacci",
					description:
						"call this when you want to use the phaubonacci. input should be a single number.",
					func: async (input) => Promise.resolve(phaubonacci(Number(input))),
				}),
				new DynamicTool({
					name: "phauencrypter",
					description:
						"call this when you want to use phauencrypter. input should be a string of characters.",
					func: async (input) => Promise.resolve(phauencrypter(input)),
				}),
				new DynamicTool({
					name: "phaudecrypter",
					description:
						"call this when you want to use phaudecrypter. input should be a string of characters.",
					func: async (input) => Promise.resolve(phaudecrypter(input)),
				}),
			];
			// Create the agent from the chat model and the tools
			const agent = ChatAgent.fromLLMAndTools(llm, tools);
			// Create an executor, which calls to the agent until an answer is found
			const executor = AgentExecutor.fromAgentAndTools({ agent, tools });
			const responseG = await executor.run(
				"you have 2 + 2 elevate it to te power of 2",
			);
			return { payload: responseG };
		}),
	statusTimer: publicProcedure.output(timerSchema).query(async ({}) => {
		const threshold = 1; // minute
		const conn = db.connection();
		const { rows } = await conn.execute(
			`
		SELECT
			owner
			, status
			, startedAt
			, (startedAt + INTERVAL ${threshold} MINUTE) as endingAt
			, CURRENT_TIMESTAMP() AS serverTime
			, TIME_TO_SEC(
				TIMEDIFF(
					(startedAt + INTERVAL ${threshold} MINUTE)
					, CURRENT_TIMESTAMP()
				)
			) AS timeDifference
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
			timeDifference: z.coerce.number(),
			isReady: z.coerce.boolean(),
		});

		const [data] = rows;
		const parsed = schema.parse(data);
		const payload = {
			completed: parsed.isReady,
			timeLeft: parsed.isReady ? 0 : parsed.timeDifference,
			raw: JSON.stringify(parsed, null, 2),
		};
		return { payload };
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
		const payload = {
			completed: rowsAffected === 0 ? false : true,
			raw: JSON.stringify({ affected: rowsAffected }, null, 2),
		};
		return { payload };
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
		const payload = {
			completed: rowsAffected === 0 ? false : true,
			raw: JSON.stringify({ affected: rowsAffected }, null, 2),
		};
		return { payload };
	}),
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;

/**
 * Inference helpers for input types
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>;

// type MyRouterType = ReturnType<typeof createRouter>
// export MyRouterLike = RouterLike<MyRouterType>
// export MyRouterUtilsLike = UtilsLike<MyRouterType>
