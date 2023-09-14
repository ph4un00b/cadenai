import { YDocProvider } from "@/app/react-yjs";
import { getOrCreateDoc } from "@y-sweet/sdk";

import { TextEditor } from "./text-editor";

type HomeProps = {
	searchParams: Record<string, string>;
};

export default async function Home({ searchParams }: HomeProps) {
	const clientToken = await getOrCreateDoc(
		searchParams.doc,
		"ys://0.0.0.0:8080",
	);

	return (
		<YDocProvider clientToken={clientToken} setQueryParam="doc">
			<TextEditor />
		</YDocProvider>
	);
}
