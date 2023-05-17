"use server";

import { revalidatePath } from "next/cache";
import { zact } from "zact/server";
import { z } from "zod";

import { wait } from "@acme/shared";

import { nukeTodos, setTodo } from "~/services/todo";

/** default */
export const validatedAction = zact(z.object({ stuff: z.string().min(6) }))(
	async (input) => {
		await wait(1_000);
		// throw "hola";
		return { message: `hello ${input.stuff}` };
	},
);

/** refactored */
const schema = z.object({ stuff: z.string().min(6) });
type In = z.infer<typeof schema>;
export const validatedActionAlt = zact(schema)(fun);
async function fun(input: In) {
	await wait(1000);
	return { message: `hello ${input.stuff}` };
}

const todo = z.string().min(6);
export const validatedAddTodo = zact(todo)(addTodo);
async function addTodo(payload: z.infer<typeof todo>) {
	await setTodo(payload);

	revalidatePath("/todos/zact");
}

export const validatedNukeTodos = zact()(deleteAll);
async function deleteAll() {
	await nukeTodos();

	revalidatePath("/todos/zact");
}
