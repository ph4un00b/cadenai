"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { cosineSimilarity } from "@acme/shared";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { forAction } from "~/app/(_rpc)/ai";
import {
	phauSentencesAction,
	type OutPhauSentences,
} from "~/app/(_rpc)/phau-bot";

export function AskBot() {
	const [lowest, setLowest] = useState(Infinity);
	const [highest, setHighest] = useState(-Infinity);
	const askInput = useRef<HTMLInputElement>(null);
	const [pending, startTransition] = useTransition();
	const { data, setData, ref: initialData } = useBotSentences();

	const handleClick = () => {
		const val = askInput.current!.value;
		if (!val) return;

		startTransition(async () => {
			try {
				const { payload } = await forAction(val);
				let high = -Infinity;
				let low = Infinity;

				const comparisons = initialData.current.map(([texto, embed]) => {
					const similarity = cosineSimilarity(embed, payload);
					high = Math.max(high, similarity);
					low = Math.min(low, similarity);
					return [texto, similarity, embed] as [string, number, number[]];
				});

				setLowest(low);
				setHighest(high);
				setData(comparisons);
			} catch (error) {
				console.error(error);
			}
		});
	};

	return (
		<>
			<div className="space-y-1">
				<Label htmlFor="ask">Question</Label>
				<Input
					ref={askInput}
					id="ask"
					placeholder="ask me anything..."
					defaultValue=""
				/>
			</div>
			<br />
			<button
				disabled={pending}
				onClick={handleClick}
				className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20 disabled:bg-indigo-600/80"
			>
				ask the bot 🤖
			</button>
			<br />
			{data && <TableDemo data={data} lowest={lowest} highest={highest} />}
		</>
	);
}

function useBotSentences() {
	const [data, setData] = useState<
		OutPhauSentences["payload"] | [string, number, readonly number[]][]
	>(null!);
	const ref = useRef<OutPhauSentences["payload"]>(null!);

	useEffect(() => {
		phauSentencesAction(undefined)
			.then((response) => {
				ref.current = response.payload;
				setData(response.payload);
			})
			.catch(console.error);
	}, []);

	return { data, setData, ref };
}

function TableDemo({
	data,
	lowest,
	highest,
}: {
	data: OutPhauSentences["payload"] | [string, number, readonly number[]][];
	lowest: number;
	highest: number;
}) {
	if (isInitialPayload(data)) {
		return (
			<Table>
				<TableCaption>A list of your bot memory.</TableCaption>
				<TableHeader>
					<TableRow>
						<TableHead>Texto</TableHead>
						<TableHead>Embeddings</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data?.map((text) => (
						<TableRow key={text[0]}>
							<TableCell>{text[0]}</TableCell>
							<TableCell>{text[1][0]}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		);
	}

	return (
		<Table>
			<TableCaption>A list of your bot memory.</TableCaption>
			<TableHeader>
				<TableRow>
					<TableHead>Texto</TableHead>
					<TableHead>Similitud</TableHead>
					<TableHead>Embeddings</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{data?.map((text) => (
					<TableRow key={text[0]}>
						<TableCell>{text[0]}</TableCell>
						<TableCell
							className={
								lowest === text[1]
									? "text-red-400"
									: highest === text[1]
									? "text-green-500"
									: ""
							}
						>
							{text[1]}
						</TableCell>
						<TableCell>{text[2][0]}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

function isInitialPayload(
	maybe: Array<unknown>[],
): maybe is OutPhauSentences["payload"] {
	return maybe[0]!.length === 2;
}
