import { LLMChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

const schema = z.object({
	OPENAI_API_KEY: z.string(),
	DEV_MODE: z.coerce.boolean(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
	const { fieldErrors } = parsed.error.flatten();
	console.error("❌ Invalid environment variables in api/ai", fieldErrors);
	throw new Error("Invalid environment variables in api/ai");
}

const env = Object.freeze(parsed.data);

export const aiRouter = createTRPCRouter({
	call: publicProcedure.query(async () => {
		const model = new OpenAI({
			openAIApiKey: env.OPENAI_API_KEY,
			temperature: 0.9,
		});
		const res = await model.call(
			"What would be a good company name a company that makes colorful socks?",
		);
		return { payload: res };
	}),
	template: publicProcedure.query(async () => {
		const model = new OpenAI({
			openAIApiKey: env.OPENAI_API_KEY,
			temperature: 0.9,
		});
		const template = "What is a good name for a company that makes {product}?";
		const prompt = new PromptTemplate({
			template: template,
			inputVariables: ["product"],
		});
		const fmtPrompt = await prompt.format({ product: "colorful socks" });
		const res = await model.call(fmtPrompt);
		return { payload: res };
	}),
	chain: publicProcedure.query(async () => {
		const model = new OpenAI({
			openAIApiKey: env.OPENAI_API_KEY,
			temperature: 0.9,
		});
		const template = "What is a good name for a company that makes {product}?";
		const prompt = new PromptTemplate({
			template: template,
			inputVariables: ["product"],
		});

		const chain = new LLMChain({ llm: model, prompt });
		const { text } = await chain.call({ product: "colorful socks" });
		return { payload: text as string };
	}),
});
