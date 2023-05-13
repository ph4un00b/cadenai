/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 2. initialize our main router instance
 * @see https://trpc.io/docs/quickstart#2-add-a-query-procedure
 */

import { env } from "@/env.mjs";
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
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
