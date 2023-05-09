import { type QueryClientConfig } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
// import IsoWebSocket from "isomorphic-ws";
import superjson from "superjson";

import type { AppRouter } from "@acme/api";

const getBaseUrl = () => {
	if (typeof window !== "undefined") return ""; // browser should use relative url
	if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url

	return `http://localhost:3000`; // dev SSR should use localhost
};

const _getBaseWebSocketUrl = () => {
	if (process.env.NEXT_PUBLIC_WS_URL)
		return `https://${process.env.NEXT_PUBLIC_WS_URL}`;
	return `ws://localhost:3001`;
};

export const api = createTRPCNext<AppRouter>({
	config() {
		return {
			queryClientConfig,
			transformer: superjson,
			links,
		};
	},
	ssr: false,
});

// create persistent WebSocket connection
/**
 * @see https://trpc.io/docs/subscriptions#setting-trpcclient-to-use-websockets
 * @abstract
 * testing out nextjs limits!
 *
 * you should deploy on stateful environment.
 *
 * @link https://github.com/trpc/trpc/issues/3539
 */
// const wsClient = createWSClient({
// 	WebSocket: IsoWebSocket as unknown as typeof WebSocket,
// 	url: getBaseWebSocketUrl(),
// });

const links = [
	loggerLink({
		enabled: (opts) =>
			process.env.NODE_ENV === "development" ||
			(opts.direction === "down" && opts.result instanceof Error),
	}),
	httpBatchLink({
		url: `${getBaseUrl()}/api/trpc`,
	}),
	/**
	 * @see https://trpc.io/docs/links/splitLink#1-configure-client--utilstrpcts
	 */
	// splitLink({
	// 	condition(op) {
	// 		console.log({ op });
	// 		return op.type === "subscription";
	// 	},
	// 	// when condition is true, use ws request
	// 	true: wsLink({
	// 		client: wsClient,
	// 	}),
	// 	// when condition is false, use batching
	// 	false: httpBatchLink({
	// 		url: `${getBaseUrl()}/api/trpc`,
	// 	}),
	// }),
];

export { type RouterInputs, type RouterOutputs } from "@acme/api";

const queryClientConfig: QueryClientConfig = {
	defaultOptions: {
		// @todo: avoiding too many retries atm!
		// maybe change this on prod
		queries: {
			retry: false,
			enabled: true,
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
			staleTime: Infinity,
			cacheTime: Infinity,
		},
		mutations: {
			retry: false,
			// enabled: true,
			// refetchOnWindowFocus: false,
			// refetchOnReconnect: false,
			// staleTime: Infinity,
			cacheTime: Infinity,
		},
	},
};
