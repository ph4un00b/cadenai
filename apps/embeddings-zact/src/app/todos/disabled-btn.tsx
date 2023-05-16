"use client";

import { experimental_useFormStatus as useStatus } from "react-dom";

export function ClientButton({
	action,
	text,
}: {
	text?: string;
	action?: () => Promise<unknown>;
}) {
	console.log({ action });
	const { pending } = useStatus();
	// const [dict, setDict] = useState({});
	return (
		<button
			disabled={pending}
			type="submit"
			className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20 disabled:bg-indigo-600"
		>
			{text ? text : "client button"}
		</button>
	);
}
