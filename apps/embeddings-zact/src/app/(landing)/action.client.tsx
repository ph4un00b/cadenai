"use client";

// import { useState } from "react";

export default function CallBtn({ action }: { action?: () => Promise<void> }) {
	// const [dict, setDict] = useState({});
	return (
		<>
			<button
				onClick={async () => {
					console.log("client-click");
					await action?.();
				}}
				className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
			>
				wait!
			</button>
			<button
				onClick={async () => {
					console.log("client-click");
					await action?.();
				}}
				className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
			>
				wait!
			</button>
			{/* <pre>{JSON.stringify(dict, null, 2)}</pre> */}
		</>
	);
}
