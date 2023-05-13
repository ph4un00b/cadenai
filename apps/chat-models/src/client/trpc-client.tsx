"use client";

/**
 * 3. create trpc hooks
 * @see https://github.com/trpc/trpc/issues/3297
 *
 * @see https://trpc.io/docs/reactjs/setup#2-create-trpc-hooks
 */
import { useState } from "react";
import { type AppRouter } from "@/server/_app.server";
import {
	QueryClient,
	QueryClientProvider,
	type QueryClientConfig,
} from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";

export const api = createTRPCReact<AppRouter>({
	unstable_overrides: {
		useMutation: {
			async onSuccess(opts) {
				await opts.originalFn();
				await opts.queryClient.invalidateQueries();
			},
		},
	},
});

function getBaseUrl() {
	if (typeof window !== "undefined")
		// browser should use relative path
		return "";
	if (process.env.VERCEL_URL)
		// reference for vercel.com
		return `https://${process.env.VERCEL_URL}`;
	// if (process.env.RENDER_INTERNAL_HOSTNAME)
	// reference for render.com
	// return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`;
	// assume localhost
	return `http://localhost:${process.env.PORT ?? 3000}`;
}

const config: QueryClientConfig = {
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

export function ClientProvider(props: { children: React.ReactNode }) {
	const [queryClient] = useState(() => new QueryClient(config));
	const [trpcClient] = useState(() =>
		api.createClient({
			links: [
				loggerLink({ enabled: () => true }),
				httpBatchLink({ url: `${getBaseUrl()}/api/trpc` }),
			],

			//in initTRPC.create @ server/trpc should be the same!
			transformer: superjson,
		}),
	);
	return (
		<api.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
				{props.children}
			</QueryClientProvider>
		</api.Provider>
	);
}
