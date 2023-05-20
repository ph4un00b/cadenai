"use server";

import { Redis } from "@upstash/redis";
import { zact } from "zact/server";

import { env } from "~/env.mjs";

const redis = new Redis({
	url: env.REDIS_ENDPOINT,
	token: env.REDIS_TOKEN,
});

type BotEmbeds = {
	embeds: Record<string, ReadonlyArray<number>>;
	// embeds: ReadonlyMap<string, ReadonlyArray<number>>;
};

// const forSchema = z.string().min(3);
export const phauSentencesAction = zact()(getSentences);
// type InPhauSentences = z.infer<typeof forSchema>;
export type OutPhauSentences = Awaited<ReturnType<typeof getSentences>>;
async function getSentences() {
	const start = performance.now();

	const { embeds } = ((await redis.json.get(
		"phaubot:embeds",
	)) as BotEmbeds) ?? {
		embeds: {},
	};

	console.log(`😱 phau-sentences - ${performance.now() - start} ms`);

	return { payload: Object.entries(embeds) };
}
