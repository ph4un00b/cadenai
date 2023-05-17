"use server";

import { Configuration, OpenAIApi } from "openai";
import { z } from "zod";

import { env } from "~/env.mjs";

export default async function call() {
	// await wait(3000);
	const words = ["jamon", "loro", "perro", "gato", "conejo"];

	const configuration = new Configuration({
		apiKey: env.OPENAI_API_KEY,
	});
	const openai = new OpenAIApi(configuration);

	const dict: Record<string, unknown> = {};
	console.time("EMBED");
	for (const word of words) {
		const { data } = await openai.createEmbedding({
			input: word,
			model: "text-embedding-ada-002",
		});
		const schema = z.number().array().length(1_536);
		const parsed = schema.parse(data.data[0]?.embedding);
		dict[word] = parsed;
		console.log(data.usage);
	}
	console.timeLog("EMBED"); // 3~5 sec
	// const response = await openai.listEngines();
	// console.log(response.data.object);
}
