/**
 * @abstract for prototyping!
 *
 * taken from
 * @see https://github.com/cmtoomey/langchainjs/blob/main/langchain/src/memory/redis_memory.ts
 * @see https://github.com/hwchase17/langchainjs/pull/951/files
 *
 * updated to:
 * @see https://python.langchain.com/en/latest/_modules/langchain/chains/sequential.html#SequentialChain
 * @see https://github.com/hwchase17/langchainjs/pull/868/files
 */

import { Redis, type RedisConfigNodejs } from "@upstash/redis";
import {
	BaseChatMemory,
	getBufferString,
	type BaseChatMemoryInput,
} from "langchain/memory";

import "@total-typescript/ts-reset";
import { z } from "zod";

export type InputValues = Record<string, unknown>;
export type OutputValues = Record<string, unknown>;
export type MemoryVariables = Record<string, unknown>;

export interface RedisMemoryMessage {
	role: string;
	content: string;
}

export type RedisMemoryInput = BaseChatMemoryInput & {
	sessionId: string;
	memoryKey?: string;
	memoryTTL?: number;
};

const schema = z.array(z.object({ role: z.string(), content: z.string() }));

export class RedisMemory extends BaseChatMemory {
	private readonly client: Redis;
	private readonly memoryKey: string;
	private readonly sessionId: string;
	private readonly memoryTTL: number;

	constructor(clientOpts: RedisConfigNodejs, fields: RedisMemoryInput) {
		const {
			memoryKey = "history",
			sessionId,
			memoryTTL = 300,
			...rest
		} = fields;
		super(rest);
		this.memoryKey = memoryKey;
		this.sessionId = this.memoryKey + sessionId;
		this.memoryTTL = memoryTTL;
		this.client = new Redis(clientOpts);
	}

	get memoryKeys() {
		return [this.memoryKey];
	}

	async init() {
		try {
			const data = await this.client.lrange(this.sessionId, 0, -1);
			const messages = schema.parse(data);
			console.log(`✅ Retrieved ${messages.length} messages from Redis.`);
			const orderedMessages = messages.map((message) => message).reverse();
			this.buildHistory(orderedMessages);
		} catch (error) {
			console.error(`❌ Failed to retrieve chat history from Redis. ${error}`);
			throw new Error(`❌${error}`);
		}
	}

	private buildHistory(orderedMessages: ReadonlyArray<RedisMemoryMessage>) {
		orderedMessages.forEach((message) => {
			const add =
				message.role === "AI"
					? this.chatHistory.addAIChatMessage.bind(this.chatHistory)
					: this.chatHistory.addUserMessage.bind(this.chatHistory);

			add(message.content).catch((error: Error) =>
				console.error(`❌ Error adding ${message.role} message. ${error}`),
			);
		});
	}

	async loadMemoryVariables(_values: InputValues) {
		const messages = await this.chatHistory.getMessages();
		if (this.returnMessages) return { [this.memoryKey]: messages };
		return { [this.memoryKey]: getBufferString(messages) };
	}

	async saveContext(inputValues: InputValues, outputValues: OutputValues) {
		const messagesToAdd = [
			JSON.stringify({ role: "Human", content: inputValues.input }),
			JSON.stringify({ role: "AI", content: outputValues.response }),
		];
		try {
			await this.client.lpush(this.sessionId, ...messagesToAdd);
			await this.client.expire(this.sessionId, this.memoryTTL);
			await super.saveContext(inputValues, outputValues);
		} catch (error) {
			console.log(`❌ ${error}`);
			throw new Error("❌ Failed to save context");
		}
	}
}
