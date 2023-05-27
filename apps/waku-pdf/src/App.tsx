import { Suspense } from "react";

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

export type PDFData = Awaited<ReturnType<typeof pdfData>>;
export type EmbedQuery = Awaited<ReturnType<typeof embedFor>>;

function App({ name = "Anonymous" }) {
	const delayedMessage = new Promise<string>((resolve) => {
		setTimeout(() => resolve("Hello from server 💃💃!"), 2000);
	});

	return (
		<div
			className="mx-auto w-[90%] border-2 border-dashed border-rose-700 bg-slate-700"
			// style={{ border: "3px red dashed", margin: "1em", padding: "1em" }}
		>
			<h1 className="text-4xl">Hello {name}!!</h1>

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

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const ServerMessage = (async () => {
	await new Promise((resolve) => setTimeout(resolve, 1000));
	return <p style={{ color: "red" }}>Hello from server!</p>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any; // FIXME how can we type async component?

export default App;
