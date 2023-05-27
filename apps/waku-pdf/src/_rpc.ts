"use server";

import { Document } from "langchain/document";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "langchain/text_splitter";

import { wait } from "@acme/shared";

export function greet(name: string) {
	console.log("hola! ", name);

	return `Hello ${name} from server!`;
}

// module state on server
let counter = 0;

export const getCounter = () => counter;

export const increment = () => {
	counter += 1;
};

const loader = new PDFLoader("src/sample/phauf.pdf");

const pages = await loader.loadAndSplit();

const splitter = new CharacterTextSplitter({
	separator: ".\n",
	chunkSize: 400,
	// chunkOverlap: 3,
});
export async function pdfData() {
	console.log("server!!");

	if (!pages[0]?.pageContent) return { payload: undefined };
	const output = await splitter.splitDocuments(pages);

	// console.log({ output });

	const dataSheet: { textos: string[]; embedding: Array<number[]> } = {
		textos: [],
		embedding: [],
	};
	for (const doc of output) {
		dataSheet.textos.push(doc.pageContent);
		dataSheet.embedding.push(
			Array(1536)
				.fill(undefined)
				.map(() => Math.random()),
		);
	}
	// console.log({ dataSheet });
	return { payload: dataSheet };
}

export async function embedFor(payload: string) {
	await wait(2000);
	// const configuration = new Configuration({
	// 	apiKey: env.OPENAI_API_KEY,
	// });
	// const openai = new OpenAIApi(configuration);

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
	console.log({ payload });

	return {
		payload: Array(1536)
			.fill(undefined)
			.map(() => Math.random()),
	};
}
