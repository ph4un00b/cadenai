"use client";

import { useRef, useTransition } from "react";

export function ClientButton({
	action,
	type = "post",
	text,
}: {
	text?: string;
	type?: "post" | "delete";
	action?: (payload: string) => Promise<void>;
}) {
	const todo = useRef<HTMLInputElement>(null);
	const [pending, startTransition] = useTransition();

	if (type == "post") {
		return (
			<section>
				<input ref={todo} type="text" name="todo" />
				<button
					disabled={pending}
					onClick={() => {
						const val = todo.current!.value;
						if (!val) return;

						startTransition(async () => {
							await action?.(val);
						});
					}}
					className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20 disabled:bg-indigo-600"
				>
					{text ? text : "client button"}
				</button>
			</section>
		);
	}

	return (
		<section>
			<button
				disabled={pending}
				onClick={() => {
					startTransition(async () => {
						await action?.("");
					});
				}}
				className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20 disabled:bg-indigo-600"
			>
				{text ? text : "delete button"}
			</button>
		</section>
	);
}
