// "use server";

import { getTodos } from "~/services/todo";
import {
	AddTodoButton,
	ClientButton,
	NukeTodosButton,
	ValidateButton,
	ValidateHookButton,
} from "./(ui)/actions.client";

/**
 * @todo This 'todos' is cached; conduct further research.
 * export const revalidate = 60; does not seem to work here
 */
// const todos = await getTodos();

export default async function Todos() {
	const todos = await getTodos();
	console.log("zact-todos!");
	return (
		<div>
			<h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
				<span className="text-pink-500">todos with Zact🤗!</span>
			</h1>
			<br />
			<ul>
				{todos.map((todo, index) => (
					<li key={index}>{todo}</li>
				))}
			</ul>
			<AddTodoButton />
			<NukeTodosButton />
			<ValidateButton />
			<ValidateHookButton />
			<ClientButton type="delete" />
		</div>
	);
}
