import { Suspense } from "react";
import { Document, DocumentInput } from "langchain/document";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "langchain/text_splitter";

import {
	Counter,
	CounterMutation,
	CounterNesting,
	CounterPromise,
	CounterRPC,
} from "./Counter.js";
import { embedFor, getCounter, greet, increment, pdfData } from "./_rpc.js";
import { AskInput } from "./pages/input.js";

type ServerFunction<T> = T extends (...args: infer A) => infer R
	? (...args: A) => Promise<R>
	: never;

const loader = new PDFLoader("src/sample/phauf.pdf");

const pages = await loader.loadAndSplit();

const splitter = new CharacterTextSplitter({
	separator: ".\n",
	chunkSize: 400,
	// chunkOverlap: 3,
});

export type PDFData = Awaited<ReturnType<typeof pdfData>>;
export type EmbedQuery = Awaited<ReturnType<typeof embedFor>>;

function App({ name = "Anonymous" }) {
	const delayedMessage = new Promise<string>(async (resolve) => {
		// if (!pages[0]?.pageContent) return;
		// const output = await splitter.splitDocuments(pages);
		// // console.log({ output });

		// const dataSheet: { textos: string[]; embedding: number[] } = {
		//   textos: [],
		//   embedding: [],
		// };
		// for (const doc of output) {
		//   dataSheet.textos.push(doc.pageContent);
		//   dataSheet.embedding = Array(1536)
		//     .fill(undefined)
		//     .map(() => Math.random());
		// }
		// console.log({ dataSheet });

		setTimeout(() => resolve("Hello from server 💃💃!"), 2000);
	});

	return (
		<div style={{ border: "3px red dashed", margin: "1em", padding: "1em" }}>
			<h1>Hello {name}!!</h1>

			<AskInput
				embedFor={embedFor as unknown as ServerFunction<EmbedQuery>}
				pdfData={pdfData as unknown as ServerFunction<PDFData>}
			/>
			<h3>This is a server component.</h3>
			<Counter />

			{/* 02 async */}
			<Suspense fallback="Pending...">
				<ServerMessage />
			</Suspense>

			{/* 03 promise */}
			<CounterPromise delayedMessage={delayedMessage} />

			{/* 04 rpc */}
			<CounterRPC greet={greet as unknown as ServerFunction<typeof greet>} />

			{/* 05 mutation */}
			<p style={{ color: "red" }}>Server counter: {getCounter()}</p>
			<CounterMutation
				increment={increment as unknown as ServerFunction<typeof increment>}
			/>

			{/* 06 nesting server-client-server pattern */}
			<CounterNesting enableInnerApp />
		</div>
	);
}

const ServerMessage = (async () => {
	await new Promise((resolve) => setTimeout(resolve, 1000));
	return <p style={{ color: "red" }}>Hello from server!</p>;
}) as any; // FIXME how can we type async component?

export default App;
