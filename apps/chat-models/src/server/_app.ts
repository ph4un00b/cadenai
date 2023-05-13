/**
 * 2. initialize our main router instance
 * @see https://trpc.io/docs/quickstart#2-add-a-query-procedure
 */

import { env } from "@/env.mjs";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { z } from "zod";

import { publicProcedure, router } from "./trpc";

const aiOpts = {
	cache: new UpstashCache({
		url: env.REDIS_ENDPOINT,
		token: env.REDIS_TOKEN,
	}),
	openAIApiKey: env.OPENAI_API_KEY,
	temperature: 0,
	maxRetries: 1,
	// maxConcurrency
};

export const appRouter = router({
	alo: publicProcedure.input(z.string()).query(({ input }) => {
		return "... from server! 🎈 " + input;
	}),
	chat: publicProcedure.input(z.string()).query(async ({}) => {
		const chat = new ChatOpenAI(aiOpts);
		const messages = [
			new HumanChatMessage(
				"Translate this sentence from English to French. I love programming.",
			),
		];
		const response = await chat.call(messages);
		return { payload: response };
	}),
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
