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
	const inputRef = useRef<HTMLInputElement>(null);
	const baseData = useRef<OutPhauSentences["payload"]>(null!);
	const [pending, startTransition] = useTransition();
	const [data, setData] = useState<
		OutPhauSentences["payload"] | [string, number, readonly number[]][]
	>(null!);

	useEffect(() => {
		phauSentencesAction(undefined)
			.then((response) => {
				baseData.current = response.payload;
				setData(response.payload);
			})
			.catch(console.error);
	}, []);

	return (
		<>
			<div className="space-y-1">
				<Label htmlFor="ask">Question</Label>
				<Input
					ref={inputRef}
					id="ask"
					placeholder="ask me anything..."
					defaultValue=""
				/>
			</div>
			<br />
			<button
				disabled={pending}
				onClick={() => {
					const val = inputRef.current!.value;
					if (!val) return;

					startTransition(() => {
						forAction(val)
							.then((response) => {
								let high = -Infinity;
								let low = Infinity;

								const comparisons = baseData.current.map((x) => {
									const [texto, embed] = x;
									const similarity = cosineSimilarity(embed, response.payload);

									high = Math.max(high, similarity);
									low = Math.min(low, similarity);
									return [texto, similarity, embed] as [
										string,
										number,
										number[],
									];
								});

								setLowest(low);
								setHighest(high);
								setData(comparisons);
							})
							.catch(console.error);
					});
				}}
				className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20 disabled:bg-indigo-600/80"
			>
				ask the bot 🤖
			</button>
			<br />
			{data && <TableDemo data={data} lowest={lowest} highest={highest} />}
		</>
	);
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
						{/* <TableHead className="w-[100px]">Invoice</TableHead> */}

						<TableHead>Texto</TableHead>
						<TableHead>Embeddings</TableHead>

						{/* <TableHead className="text-right">Amount</TableHead> */}
					</TableRow>
				</TableHeader>
				<TableBody>
					{data?.map((text) => (
						<TableRow key={text[0]}>
							{/* <TableCell className="font-medium">{invoice.invoice}</TableCell> */}
							<TableCell>{text[0]}</TableCell>
							<TableCell>{text[1][0]}</TableCell>
							{/* <TableCell className="text-right">{invoice.totalAmount}</TableCell> */}
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
					{/* <TableHead className="w-[100px]">Invoice</TableHead> */}
					<TableHead>Texto</TableHead>
					<TableHead>Similitud</TableHead>
					<TableHead>Embeddings</TableHead>
					{/* <TableHead className="text-right">Amount</TableHead> */}
				</TableRow>
			</TableHeader>
			<TableBody>
				{data?.map((text) => (
					<TableRow key={text[0]}>
						{/* <TableCell className="font-medium">{invoice.invoice}</TableCell> */}
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
						{/* <TableCell className="text-right">{invoice.totalAmount}</TableCell> */}
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
