import { ClientToken } from "@y-sweet/sdk";
import type { Awareness } from "y-protocols/awareness";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";

// * @see https://github.com/drifting-in-space/y-sweet/tree/f0ce685c636e242f27714f2b270f2dd59d4745c0/js-pkg/react
/**
 * Given a {@link ClientToken}, create a {@link WebsocketProvider} for it.
 *
 * @param doc
 * @param clientToken
 * @param extraOptions
 * @returns
 */
export function createYjsProvider(
	doc: Y.Doc,
	clientToken: ClientToken,
	extraOptions: Partial<WebsocketProviderParams> = {},
) {
	const params = clientToken.token ? { token: clientToken.token } : undefined;

	const provider = new WebsocketProvider(
		clientToken.url,
		clientToken.doc,
		doc,
		{
			params,
			...extraOptions,
		},
	);

	return provider;
}

// Taken from y-websocket.d.ts
export type WebsocketProviderParams = {
	connect?: boolean | undefined;
	awareness?: Awareness | undefined;
	params?:
		| {
				[x: string]: string;
		  }
		| undefined;
	WebSocketPolyfill?:
		| {
				new (
					url: string | URL,
					protocols?: string | string[] | undefined,
				): WebSocket;
				prototype: WebSocket;
				readonly CLOSED: number;
				readonly CLOSING: number;
				readonly CONNECTING: number;
				readonly OPEN: number;
		  }
		| undefined;
	resyncInterval?: number | undefined;
	maxBackoffTime?: number | undefined;
	disableBc?: boolean | undefined;
};
