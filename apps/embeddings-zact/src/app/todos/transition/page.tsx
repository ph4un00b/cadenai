// "use server";

import { revalidatePath } from "next/cache";
import { Redis } from "@upstash/redis";

import { wait } from "@acme/shared";

import { env } from "~/env.mjs";
import { ClientButton } from "./disabled-btn";

const redis = new Redis({
	url: env.REDIS_ENDPOINT,
	token: env.REDIS_TOKEN,
});

type Todos = {
	todos: ReadonlyArray<string>;
};

export default async function Todos() {
	const { todos } = ((await redis.json.get("todos")) as Todos) ?? { todos: [] };
	if (todos.length == 0)
		await redis.json.set("todos", "$", { todos: ["jamon-1"] });

	async function addTodo(todo: string) {
		"use server";
		await redis.json.arrappend("todos", "$.todos", JSON.stringify(todo));
		await wait(1000); // this wil not show the loading.ts
		revalidatePath("/todos/transition");
	}
	const deleteAll = async () => {
		"use server";
		console.log("deleting!! 😫");
		await redis.del("todos");
		revalidatePath("/todos/transition");
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

			<ClientButton action={addTodo} text="submit" />
			<ClientButton action={deleteAll} type="delete" text="delete all 😨" />
			<ClientButton type="delete" />
		</div>
	);
}
