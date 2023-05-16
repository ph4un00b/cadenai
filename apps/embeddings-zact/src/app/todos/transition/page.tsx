// "use server";

import { revalidatePath } from "next/cache";

import { wait } from "@acme/shared";

import { getTodos, nukeTodos, setTodo } from "~/services/todo";
import { ClientButton } from "./disabled-btn";

export default async function Todos() {
	const todos = await getTodos();
	async function addTodo(todo: string) {
		"use server";
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

			<ClientButton action={addTodo} text="submit" />
			<ClientButton action={deleteAll} type="delete" text="delete all 😨" />
			<ClientButton type="delete" />
		</div>
	);
}
