import { Redis, type RedisConfigNodejs } from "@upstash/redis";
import { BaseCache, type Generation } from "langchain/schema";
import hash from "object-hash";

/**
 * @see https://github.com/hwchase17/langchainjs/blob/main/langchain/src/cache/base.ts
 * This cache key should be consistent across all versions of langchain.
 * It is currently NOT consistent across versions of langchain.
 *
 * A huge benefit of having a remote cache (like redis) is that you can
 * access the cache from different processes/machines. The allows you to
 * seperate concerns and scale horizontally.
 *
 * TODO: Make cache key consistent across versions of langchain.
 */
function getCacheKey(...strings: string[]) {
	return hash(strings.join("_"));
}

export class UpstashCache extends BaseCache {
	private readonly redisClient: Redis;

	constructor(clientOpts: RedisConfigNodejs) {
		super();
		this.redisClient = new Redis(clientOpts);
	}

	public async lookup(prompt: string, llmKey: string) {
		let idx = 0;
		let key = getCacheKey(prompt, llmKey, String(idx));
		let value = await this.redisClient.get<string>(key);
		// console.log({ key: "👀👀👀👀👀👀", prompt, llmKey });
		console.log({ state: "👀👀👀👀👀👀", key, llmKey });
		console.log({ value });
		const generations: Generation[] = [];

		while (value) {
			if (!value) {
				break;
			}

			generations.push({ text: value });
			idx += 1;
			key = getCacheKey(prompt, llmKey, String(idx));
			value = await this.redisClient.get(key);
		}

		return generations.length > 0 ? generations : null;
	}

	public async update(prompt: string, llmKey: string, value: Generation[]) {
		console.log({ key: "🐋🐋🐋🐋🐋🐋", llmKey });
		for (const [i, val] of value.entries()) {
			const key = getCacheKey(prompt, llmKey, String(i));
			await this.redisClient.set(key, val.text);
		}
	}
}
