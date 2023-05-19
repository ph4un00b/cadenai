"use server";

import { Redis } from "@upstash/redis";
import csv from "csvtojson";
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

const redis = new Redis({
	url: env.REDIS_ENDPOINT,
	token: env.REDIS_TOKEN,
});

const csvEmbedSchemaIn = z.string().min(20);
type CSVEmbedIn = z.infer<typeof csvEmbedSchemaIn>;
export const csvEmbedAction = zact(csvEmbedSchemaIn)(csvEmbed);
export type OutCSVEmbed = Awaited<ReturnType<typeof csvEmbed>>;
async function csvEmbed(payload: CSVEmbedIn) {
	if ((await redis.exists("phaubot:embeds")) > 0) return;

	const configuration = new Configuration({
		apiKey: env.OPENAI_API_KEY,
	});
	const openai = new OpenAIApi(configuration);

	const start = performance.now();
	const data = await csv({}).fromString(payload);
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
	const phrases = data.map((x) => x["phau_bot"]) as string[];

	const dict: Record<string, unknown> = {};
	// console.time("EMBED");
	for (const sentence of phrases) {
		const { data } = await openai.createEmbedding({
			input: sentence,
			model: "text-embedding-ada-002",
		});
		console.log({ sentence });

		const schema = z.number().array().length(1_536);
		const parsed = schema.parse(data.data[0]?.embedding);
		dict[sentence] = parsed;
		console.log(data.usage);
	}

	console.log(`😱 embed-csv - ${performance.now() - start} ms`);
	await redis.json.set("phaubot:embeds", "$", { embeds: dict });
	// const start = performance.now();
	// const { data } = await openai.createEmbedding({
	// 	input: payload,
	// 	model: "text-embedding-ada-002",
	// });
	// const schema = z.number().array().length(1_536);
	// const parsed = schema.parse(data.data[0]?.embedding);
	// console.log(data.usage);

	// const end = performance.now();
	// console.log(`😱 embed-for:${payload} - ${end - start} ms`);

	// return { payload: parsed };
}
