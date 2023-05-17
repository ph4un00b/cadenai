// "use server";

import { getTodos } from "~/services/todo";
import {
	AddTodoButton,
	ClientButton,
	NukeTodosButton,
	ValidateButton,
	ValidateHookButton,
} from "./actions.client";

const todos = await getTodos();
export default function Todos() {
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
