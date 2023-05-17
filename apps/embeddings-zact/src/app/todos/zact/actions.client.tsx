"use client";

import { useRef, useTransition } from "react";
import { useZact } from "zact/client";

import {
	validatedAction,
	validatedActionAlt,
	validatedAddTodo,
	validatedNukeTodos,
} from "~/app/actions";

export function ValidateButton({ text }: { text?: string }) {
	const [pending, startTransition] = useTransition();

	return (
		<section>
			<button
				disabled={pending}
				onClick={() => {
					startTransition(() => {
						validatedAction({ stuff: "jamon!" })
							.then((val) => {
								console.log("done in server! 😎", val);
							})
							.catch(console.error);
					});
				}}
				className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20 disabled:bg-indigo-600"
			>
				{text ? text : "validate action 🥰"}
			</button>
		</section>
	);
}

export function ValidateHookButton({ text }: { text?: string }) {
	console.log("zact + hook");
	const action = useZact(validatedActionAlt);
	const [pending, startTransition] = useTransition();

	return (
		<section>
			<button
				disabled={pending}
				onClick={() => {
					startTransition(async () => {
						await action.mutate({ stuff: "jamon!" });
					});
				}}
				// onClick={async () => {
				// 	await action.mutate({ stuff: "jamon!" });
				// }}
				className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20 disabled:bg-indigo-600"
			>
				{text ? text : "validate zod action 🥰"}
			</button>
			{pending && <div>Loading...</div>}
			{/* {action.isLoading && <div>Loading...</div>} */}
			{action.data && <pre>{JSON.stringify(action.data, null, 2)}</pre>}
		</section>
	);
}

export function AddTodoButton() {
	const todo = useRef<HTMLInputElement>(null);
	const addTodo = useZact(validatedAddTodo);
	const [pending, startTransition] = useTransition();

	return (
		<section>
			<input ref={todo} type="text" name="todo" />
			<button
				disabled={pending}
				onClick={() => {
					const val = todo.current!.value;
					if (!val) return;

					startTransition(async () => {
						await addTodo.mutate(val);
					});
				}}
				className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20 disabled:bg-indigo-600"
			>
				submit
			</button>
		</section>
	);
}

export function NukeTodosButton() {
	const nukeTodos = useZact(validatedNukeTodos);
	const [pending, startTransition] = useTransition();

	return (
		<section>
			<button
				disabled={pending}
				onClick={() => {
					startTransition(async () => {
						await nukeTodos.mutate(undefined);
					});
				}}
				className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20 disabled:bg-indigo-600"
			>
				delete all 😨
			</button>
		</section>
	);
}

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
