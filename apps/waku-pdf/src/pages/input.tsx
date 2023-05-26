"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { type EmbedQuery, type PDFData } from "../App.js";

export function AskInput({
	pdfData,
	embedFor,
}: {
	embedFor: (data: string) => Promise<EmbedQuery>;
	pdfData: () => Promise<PDFData>;
}) {
	const askInput = useRef<HTMLInputElement>(null);
	const [lowest, setLowest] = useState(Infinity);
	const [highest, setHighest] = useState(-Infinity);

	const [isPending, startTransition] = useTransition();

	const { reply, setReply, initialData } = useData({ pdfData });

	const handleClick = () => {
		const val = askInput.current!.value;
		if (!val) return;

		startTransition(async () => {
			try {
				const { payload } = await embedFor(val);
				let high = -Infinity;
				let low = Infinity;

				if (!initialData) return;

				const comparisons: Reply = initialData.embedding.map((x, idx) => {
					const similarity = cosineSimilarity(x, payload);
					high = Math.max(high, similarity);
					low = Math.min(low, similarity);

					return [initialData.textos[idx]!, similarity];
				});

				setLowest(low);
				setHighest(high);
				setReply(comparisons);
			} catch (error) {
				console.error(error);
			}
		});
	};

	return (
		<div style={{ border: "3px blue dashed", margin: "1em", padding: "1em" }}>
			<p>ask pdf</p>
			<input ref={askInput} type="text" minLength={30} />
			<button onClick={handleClick}>ask ✨</button>

			{reply && <pre>lowest: {lowest}</pre>}
			{reply && <pre>highest: {highest}</pre>}
			{reply && <pre>{JSON.stringify(reply, null, 2)}</pre>}
		</div>
	);
}
type Reply = [string, number][];

function useData({ pdfData }: { pdfData: () => Promise<PDFData> }) {
	const [initialData, setData] = useState<PDFData["payload"]>(null!);
	const [reply, setReply] = useState<Reply>(null!);
	//   const ref = useRef<PDFData["payload"]>(null!);

	useEffect(() => {
		pdfData()
			.then((response) => {
				// ref.current = response?.payload;
				setData(response?.payload);
			})
			.catch(console.error);
	}, []);

	return { reply, setReply, initialData };
}

export function cosineSimilarity(a: number[], b: number[]) {
	return dotProduct(a, b) / (magnitude(a) * magnitude(b));
}

function dotProduct(a: number[], b: number[]) {
	return a.reduce(
		(acc: number, val: number, i: number) => acc + val * b[i]!,
		0,
	);
}

function magnitude(a: number[]) {
	return Math.sqrt(dotProduct(a, a));
}
