import { EventEmitter } from "node:events";

// type Handler<
// 	TEvents extends Record<string, unknown>,
// 	TName extends keyof TEvents,
// > = (...eventArgs: TEvents[TName][]) => void;

type Handler<TEvents extends Record<string, unknown>> = {
	[TName in keyof TEvents]?: (...eventArgs: TEvents[TName][]) => void;
};

type EE<TEvents extends Record<string, unknown>> = {
	emit<TName extends keyof TEvents>(
		eventName: TName,
		...args: TEvents[TName][]
	): boolean;
	on<TName extends keyof TEvents>(
		eventName: TName,
		handler: Handler<TEvents>[TName],
	): void;
	off<TName extends keyof TEvents>(
		eventName: TName,
		handler: Handler<TEvents>[TName],
	): void;
};

// export function createEventEmitter<
// 	TEvents extends Record<string, unknown>,
// >(): EE<TEvents> {
// 	const emitter = new EventEmitter();

// 	const emit = <TName extends keyof TEvents & string>(
// 		eventName: TName,
// 		...eventArgs: TEvents[TName][]
// 	): void => {
// 		emitter.emit(eventName, ...eventArgs);
// 	};

// 	const on = <TName extends keyof TEvents & string>(
// 		eventName: TName,
// 		handler: Handler<TEvents, TName>,
// 	): void => {
// 		emitter.on(eventName, handler);
// 	};

// 	const off = <TName extends keyof TEvents & string>(
// 		eventName: TName,
// 		handler: Handler<TEvents, TName>,
// 	): void => {
// 		emitter.off(eventName, handler);
// 	};

// 	return { emit, on, off };
// }
export function createEventEmitter<
	TEvents extends Record<string, unknown>,
>(): EE<TEvents> {
	// The emitter object is cast to
	// EventEmitterInterface<TEvents>
	// to avoid having to define a separate type for it.
	const emitter = new EventEmitter() as EE<TEvents>;

	return {
		emit: (eventName, ...args) => emitter.emit(eventName, ...args),
		on: (eventName, handler) => emitter.on(eventName, handler),
		off: (eventName, handler) => emitter.off(eventName, handler),
	};
}
