import { getOrCreateDoc } from "@y-sweet/sdk";

import { CONNECTION_STRING } from "~/lib/config";
import { YDocProvider } from "~/lib/react-yjs";
import { Presence } from "./Presence";

type HomeProps = {
	searchParams: Record<string, string>;
};

export default async function Home({ searchParams }: HomeProps) {
	const clientToken = await getOrCreateDoc(searchParams.doc, CONNECTION_STRING);

	return (
		<YDocProvider clientToken={clientToken} setQueryParam="doc">
			<Presence />
		</YDocProvider>
	);
}
