"use client";

import { useRef } from "react";
import { useZact } from "zact/client";

import { csvEmbedAction } from "~/app/(_rpc)/ai";

export function BotRules({ text }: { text: string }) {
	const embeds = useZact(csvEmbedAction);
	const areaRef = useRef<HTMLTextAreaElement>(null);
	return (
		<section className="flex flex-col">
			<textarea
				ref={areaRef}
				cols={60}
				rows={16}
				className="bg-slate-200 text-gray-900"
				defaultValue={text}
			></textarea>
			<button
				onClick={async () => {
					const val = areaRef.current!.value;
					console.log({ val });

					if (!val) return;
					await embeds.mutate(val);
				}}
				className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
			>
				create
			</button>
			{/* <pre>{JSON.stringify(dict, null, 2)}</pre> */}
		</section>
	);
}
