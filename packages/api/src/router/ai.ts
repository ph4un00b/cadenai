import { OpenAI } from "langchain/llms/openai";
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
	hi: publicProcedure.query(async () => {
		const model = new OpenAI({
			openAIApiKey: env.OPENAI_API_KEY,
			temperature: 0.9,
		});
		const res = await model.call(
			"What would be a good company name a company that makes colorful socks?",
		);
		return { payload: res };
	}),
});
