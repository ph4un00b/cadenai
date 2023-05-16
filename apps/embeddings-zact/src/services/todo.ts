import { Redis } from "@upstash/redis";

import { env } from "~/env.mjs";

const redis = new Redis({
	url: env.REDIS_ENDPOINT,
	token: env.REDIS_TOKEN,
});

type Todos = {
	todos: ReadonlyArray<string>;
};

export async function nukeTodos() {
	await redis.del("todos");
}

export async function setTodo(todo: string) {
	await redis.json.arrappend("todos", "$.todos", JSON.stringify(todo));
}

export async function getTodos() {
	const { todos } = ((await redis.json.get("todos")) as Todos) ?? { todos: [] };
	if (todos.length == 0)
		await redis.json.set("todos", "$", { todos: ["jamon-1"] });

	return todos;
}
