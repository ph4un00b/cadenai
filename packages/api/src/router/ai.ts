import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { LLMChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { DynamicTool, Tool } from "langchain/tools";
import { Calculator } from "langchain/tools/calculator";
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
		const llm = new OpenAI({
			openAIApiKey: env.OPENAI_API_KEY,
			temperature: 0.9,
		});
		const res = await llm.call(
			"What would be a good company name a company that makes colorful socks?",
		);
		return { payload: res };
	}),
	template: publicProcedure.query(async () => {
		const llm = new OpenAI({
			openAIApiKey: env.OPENAI_API_KEY,
			temperature: 0.9,
		});

		const prompt = new PromptTemplate({
			template: "What is a good name for a company that makes {product}?",
			inputVariables: ["product"],
		});

		const fmtPrompt = await prompt.format({ product: "colorful socks" });
		const res = await llm.call(fmtPrompt);
		return { payload: res };
	}),
	chain: publicProcedure.query(async () => {
		const llm = new OpenAI({
			openAIApiKey: env.OPENAI_API_KEY,
			temperature: 0.9,
		});

		const prompt = new PromptTemplate({
			template: "What is a good name for a company that makes {product}?",
			inputVariables: ["product"],
		});

		const chain = new LLMChain({ llm, prompt });
		const { text } = await chain.call({ product: "colorful socks" });
		return { payload: text as string };
	}),
	agent: publicProcedure.query(async () => {
		const llm = new OpenAI({
			openAIApiKey: env.OPENAI_API_KEY,
			temperature: 0,
		});
		const tools: Tool[] = [
			new Calculator(),
			new DynamicTool({
				name: "phaubonacci",
				description:
					"call this when you want to calculate the phaubonacci. input should be a single number.",
				func: async (input) => Promise.resolve(phaubonacci(Number(input))),
			}),
			new DynamicTool({
				name: "phauencrypter",
				description:
					"call this when you want to use phauencrypter. input should be a string of characters.",
				func: async (input) => Promise.resolve(phauencrypter(input)),
			}),
			new DynamicTool({
				name: "phaudecrypter",
				description:
					"call this when you want to use phaudecrypter. input should be a string of characters.",
				func: async (input) => Promise.resolve(phaudecrypter(input)),
			}),
		];

		const executor = await initializeAgentExecutorWithOptions(tools, llm, {
			agentType: "zero-shot-react-description",
			verbose: true,
		});

		console.log("Loaded agent.");

		const input =
			"apply me the phaudecrypter for hola mundo! and append to the result the phaubonacci of 10";
		console.log(`Executing with input "${input}"...`);

		const { output } = await executor.call({ input });
		// console.log({ output });
		return { payload: output as string };
	}),
});

function phaubonacci(input: number): string {
	const emojis = ["😀", "😂", "😎", "🤔", "🤣", "😍", "🤩", "😜", "🥳"];
	let result = "";

	for (let i = 0; i < input; i++) {
		const emojisIndex = Math.floor(Math.random() * emojis.length);
		const emoji = emojis[emojisIndex];

		result += `fau${emoji}`;
	}

	return result;
}

function phauencrypter(input: string) {
	const vowelMap: { [key: string]: string } = {
		a: "4",
		e: "3",
		i: "1",
		o: "0",
		u: "_",
	};

	const reversedChars = input.split("").reverse();

	const mappedChars = reversedChars.map((char) => {
		const lowerChar = char.toLowerCase();
		return vowelMap[lowerChar] || char;
	});

	return mappedChars.join("");
}

function phaudecrypter(input: string): string {
	const vowelMap: { [key: string]: string } = {
		"4": "a",
		"3": "e",
		"1": "i",
		"0": "o",
		_: "u",
	};

	const reversedChars = input.split("").reverse();

	const mappedChars = reversedChars.map((char) => {
		const lowerChar = char.toLowerCase();
		return vowelMap[lowerChar] || char;
	});

	return mappedChars.join("");
}

class _MyTool extends Tool {
	name = "My Tool";
	description = "A tool that does something...";

	async _call() {
		// Do something with the input...
		return Promise.resolve("Success!");
	}
}
