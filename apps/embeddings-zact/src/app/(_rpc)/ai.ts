"use server";

import { Configuration, OpenAIApi } from "openai";
import { zact } from "zact/server";
import { z } from "zod";

import { env } from "~/env.mjs";

export const embedsAction = zact()(generateEmbeds);
async function generateEmbeds() {
	console.log("call");
	// await wait(3000);
	const words = ["jamon", "loro", "perro", "gato", "conejo"];

	const configuration = new Configuration({
		apiKey: env.OPENAI_API_KEY,
	});
	const openai = new OpenAIApi(configuration);

	const dict: Record<string, unknown> = {};
	const start = performance.now();
	// console.time("EMBED");
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
	// console.timeLog("EMBED"); // 3~5 sec
	const end = performance.now();
	console.log(`😱 embed - ${end - start} ms`);
}

const forSchema = z.string().min(3);
type ForIn = z.infer<typeof forSchema>;
export const forAction = zact(forSchema)(embedFor);
export type OutEmbedFor = Awaited<ReturnType<typeof embedFor>>;
async function embedFor(payload: ForIn) {
	const configuration = new Configuration({
		apiKey: env.OPENAI_API_KEY,
	});
	const openai = new OpenAIApi(configuration);

	const start = performance.now();
	const { data } = await openai.createEmbedding({
		input: payload,
		model: "text-embedding-ada-002",
	});
	const schema = z.number().array().length(1_536);
	const parsed = schema.parse(data.data[0]?.embedding);
	console.log(data.usage);

	const end = performance.now();
	console.log(`😱 embed-for:${payload} - ${end - start} ms`);

	return { payload: parsed };
}
