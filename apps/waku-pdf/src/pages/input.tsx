"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { cosineSimilarity } from "@acme/shared";

import { type EmbedQuery, type PDFData } from "../App.js";

type Ask = {
	embedFor: (data: string) => Promise<EmbedQuery>;
	pdfData: () => Promise<PDFData>;
};

export function AskInput({ pdfData, embedFor }: Ask) {
	const askInput = useRef<HTMLInputElement>(null);
	const [lowest, setLowest] = useState(Infinity);
	const [highest, setHighest] = useState(-Infinity);
	const [isPending, startTransition] = useTransition();
	const { reply, setReply, initialData } = useData({ pdfData });

	const handleClick = () => {
		const val = askInput.current!.value;
		if (!val) return;

		startTransition(() => {
			embedFor(val)
				.then((res) => {
					const { payload } = res;
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
				})
				.catch(console.error);
		});
	};

	return (
		<div
		// style={{ border: "3px blue dashed", margin: "1em", padding: "1em" }}
		>
			<p>ask pdf</p>
			<input ref={askInput} type="text" minLength={30} />

			<Button
				disabled={isPending}
				style={{
					backgroundColor: isPending ? "whitesmoke" : "royalblue",
					cursor: isPending ? "not-allowed" : "",
					opacity: "0.8",
					color: isPending ? "black" : "whitesmoke",
				}}
				onClick={handleClick}
			>
				ask ✨
			</Button>

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

	useEffect(() => {
		pdfData()
			.then((response) => {
				setData(response?.payload);
			})
			.catch(console.error);
	}, [pdfData]);

	return { reply, setReply, initialData };
}

const buttonVariants = cva(
	"inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/90",
				destructive:
					"bg-destructive text-destructive-foreground hover:bg-destructive/90",
				outline:
					"border border-input hover:bg-accent hover:text-accent-foreground",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-secondary/80",
				ghost: "hover:bg-accent hover:text-accent-foreground",
				link: "underline-offset-4 hover:underline text-primary",
			},
			size: {
				default: "h-10 py-2 px-4",
				sm: "h-9 px-3 rounded-md",
				lg: "h-11 px-8 rounded-md",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			/>
		);
	},
);
Button.displayName = "Button";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
