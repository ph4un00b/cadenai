"use client";

import { useRef } from "react";
import { useZact } from "zact/client";

import { cosineSimilarity, cosineSimilarity2 } from "@acme/shared";

import { embedsAction, forAction, type OutEmbedFor } from "../(_rpc)/ai";

export function EmbedCall() {
	const embeds = useZact(embedsAction);
	return (
		<>
			<button
				onClick={async () => {
					await embeds.mutate(undefined);
				}}
				className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
			>
				wait!
			</button>
			{/* <pre>{JSON.stringify(dict, null, 2)}</pre> */}
		</>
	);
}

export function EmbedCompare() {
	const embedForA = useZact(forAction);
	const embedForB = useZact(forAction);
	return (
		<>
			<EmbedInput action={embedForA} text={"embed a"} />
			<EmbedInput action={embedForB} text={"embed b"} />
			{embedForA.data && embedForB.data ? (
				<pre className="bg-slate-900 text-green-500">
					{cosineSimilarity(embedForA.data.payload, embedForB.data.payload)}
				</pre>
			) : (
				<></>
			)}
			{embedForA.data && embedForB.data ? (
				<pre className="bg-slate-900 text-green-500">
					{cosineSimilarity2(embedForA.data.payload, embedForB.data.payload)}
				</pre>
			) : (
				<></>
			)}
		</>
	);
}

type ZACT = ReturnType<typeof useZact>;
type Action = { [K in keyof ZACT]: ZACT[K] } & { data: OutEmbedFor | null };
function EmbedInput({ action, text }: { action: Action; text: string }) {
	const wordARef = useRef<HTMLInputElement>(null);
	return (
		<section className="flex flex-col">
			<input className="bg-slate-200" ref={wordARef} type="text" name="wordA" />
			<br />
			<textarea
				readOnly
				className="bg-slate-200"
				value={
					action.data?.payload ? JSON.stringify(action.data?.payload) : text
				}
			></textarea>
			<br />
			<button
				onClick={async () => {
					const val = wordARef.current!.value;
					console.log({ val });

					if (!val) return;
					await action.mutate(val);
				}}
				className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
			>
				get {text}
			</button>
			<br />
		</section>
	);
}
