import { EventEmitter } from "node:events";

type Handler<TEvents extends Record<string, unknown>> = {
	[TName in keyof TEvents]?: (event: TEvents[TName]) => void;
};

export class TypedEventEmitter<TEvents extends Record<string, unknown>> {
	private emitter = new EventEmitter();

	emit<TEventName extends keyof TEvents & string>(
		eventName: TEventName,
		eventArg: TEvents[TEventName],
	) {
		this.emitter.emit(eventName, ...(eventArg as []));
	}

	on<TName extends keyof TEvents & string>(
		eventName: TName,
		handler: Handler<TEvents>[TName],
	) {
		this.emitter.on(eventName, handler as any);
	}

	off<TName extends keyof TEvents & string>(
		eventName: TName,
		handler: Handler<TEvents>[TName],
	) {
		this.emitter.off(eventName, handler as any);
	}
}
