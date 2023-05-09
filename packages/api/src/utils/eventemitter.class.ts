/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { EventEmitter } from "events";

import { type Message } from "../router/room";

type Handler<TEvents extends Record<string, unknown>> = {
	[TName in keyof TEvents]?: (event: TEvents[TName]) => void;
};

export class TypedEventEmitter<
	TEvents extends Record<string, unknown>,
> extends EventEmitter {
	private readonly id: string;

	constructor() {
		super();
		this.id = `TypedEventEmitter_${Date.now()}_${Math.random()
			.toString(36)
			.substring(7)}`;
		console.log({ id: this.id });
	}

	emit<TEventName extends keyof TEvents & string>(
		eventName: TEventName,
		eventArg: TEvents[TEventName],
	): boolean {
		console.log(
			`[${this.id}] 🌌🌌🌌🌌🌌🌌🌌 emitting "${eventName}" with args`,
			eventArg,
		);
		return super.emit(eventName, eventArg);
	}

	on<TName extends keyof TEvents & string>(
		eventName: TName,
		handler: Handler<TEvents>[TName],
	): this {
		console.log(
			`[${this.id}] 🌌🌌🌌🌌🌌🌌🌌 registering handler for "${eventName}"`,
		);
		return super.on(eventName, handler as any);
	}

	off<TName extends keyof TEvents & string>(
		eventName: TName,
		handler: Handler<TEvents>[TName],
	): this {
		console.log(
			`[${this.id}] 🌌🌌🌌🌌🌌🌌🌌 unregistering handler for "${eventName}"`,
		);
		return super.off(eventName, handler as any);
	}
}

//
//
// type RoomEvents = {
// 	"event-1": Message;
// };
//
//

type MyEvents = {
	add: Message;
	isTypingUpdate: () => void;
};

const globalForEE = globalThis as { ee?: EventEmitter };
export const ee = globalForEE.ee || new TypedEventEmitter<MyEvents>();
console.log("🌌🌌🌌🌌🌌🌌🌌 init!", ee);
if (process.env.NODE_ENV !== "production") globalForEE.ee = ee;
