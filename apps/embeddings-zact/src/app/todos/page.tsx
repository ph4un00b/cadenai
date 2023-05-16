// "use server";

import { revalidatePath } from "next/cache";
import { Redis } from "@upstash/redis";

import { env } from "~/env.mjs";

const redis = new Redis({
	url: env.REDIS_ENDPOINT,
	token: env.REDIS_TOKEN,
});

type Todos = {
	todos: ReadonlyArray<string>;
};

async function wait(ms: number) {
	return new Promise((resolve) => {
		globalThis.setTimeout(() => resolve("ok"), ms);
	});
}

export default async function Todos() {
	const { todos } = ((await redis.json.get("todos")) as Todos) ?? { todos: [] };
	if (todos.length == 0)
		await redis.json.set("todos", "$", { todos: ["jamon-1"] });

	async function addTodo(data: FormData) {
		"use server";
		const todo = data.get("todo") as string;
		await redis.json.arrappend("todos", "$.todos", JSON.stringify(todo));
		await wait(1000); // this wil not show the loading.ts
		revalidatePath("/todos");
	}
	const deleteAll = async () => {
		"use server";
		await redis.del("todos");
		revalidatePath("/todos");
	};
	return (
		<div>
			<h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
				<span className="text-pink-500">todos 🤗!</span>
			</h1>
			<br />
			<ul>
				{todos.map((todo, index) => (
					<li key={index}>{todo}</li>
				))}
			</ul>
			<form action={addTodo}>
				<input type="text" name="todo" />
				<button
					type="submit"
					className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
				>
					submit
				</button>
			</form>
			<form action={deleteAll}>
				<button
					type="submit"
					className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
				>
					delete all 😨
				</button>
			</form>
		</div>
	);
}
