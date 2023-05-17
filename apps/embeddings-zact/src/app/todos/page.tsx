// "use server";

import { revalidatePath } from "next/cache";

import { wait } from "@acme/shared";

import { getTodos, nukeTodos, setTodo } from "~/services/todo";
import { ClientButton } from "./button.client";

export default async function Todos() {
	const todos = await getTodos();
	async function addTodo(data: FormData) {
		"use server";
		const todo = data.get("todo") as string;
		await setTodo(todo);
		await wait(1000); // this wil not show the loading.ts
		revalidatePath("/todos/transition");
	}
	const deleteAll = async () => {
		"use server";
		await nukeTodos();
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
			<form action={addTodo}>
				<input type="text" name="todo" />
				<ClientButton text="submit" />
			</form>
			<form action={deleteAll}>
				<button
					type="submit"
					className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
				>
					delete all 😨
				</button>
			</form>
			<ClientButton />
		</div>
	);
}
