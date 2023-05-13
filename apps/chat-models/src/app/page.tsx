"use client";

import { useState } from "react";
import { api } from "@/client/trpc-client";

export default function Home() {
	const utils = api.useContext();
	const [newTimerData, setNewTimerData] = useState("");
	const hello = api.alo.useQuery("phau!");
	const statusTimer = api.statusTimer.useQuery();

	const endTimer = api.endTimer.useMutation({
		onError(err) {
			console.log(err);
		},
		async onSuccess(data) {
			console.log({ data });
			if (data.payload.completed) {
				await utils.statusTimer.invalidate();
			}
		},
	});

	const newTimer = api.newTimer.useMutation({
		onError(err) {
			console.log(err);
		},
		async onSuccess(data) {
			console.log({ data });
			if (data.payload.completed) {
				await utils.statusTimer.invalidate();
			}
			setNewTimerData(JSON.stringify(JSON.parse(data.payload.raw)));
		},
	});

	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
				<p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
					left&nbsp;
					<code className="font-mono font-bold">código bien recio.</code>
				</p>
				<div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
					derecha!
				</div>
			</div>

			<div className="before:bg-gradient-radial after:bg-gradient-conic relative flex flex-col place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px]">
				{/* <Image
					className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
					src="/next.svg"
					alt="Next.js Logo"
					width={180}
					height={37}
					priority
				/> */}
				{hello.isLoading ? <p>🌌🌌 thinking...</p> : <p>Hello, {hello.data}</p>}

				<ActionButton
					text={"create-timer ⚡"}
					handler={() => newTimer.mutate()}
					payload={newTimerData}
				/>
				{statusTimer.isLoading ? (
					<p>🌌🌌 thinking...</p>
				) : (
					<div>
						<span className="flex flex-row text-2xl">
							time remaining:&nbsp;&nbsp;
							<pre className="text-emerald-400">
								{statusTimer.data?.payload.timeLeft}
							</pre>
						</span>
						{/* <pre>{statusTimer.data?.payload.raw}</pre> */}
					</div>
				)}
				<ActionButton text="end-timer 🚫" handler={() => endTimer.mutate()} />
				<Chat />
				<Chat2 />
				<Chat3 />
			</div>

			<div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
				hola mundo 😉!
			</div>
		</main>
	);
}

function ActionButton({
	text,
	handler,
	payload = "",
}: {
	text: string;
	handler: () => void;
	payload?: string;
}) {
	return (
		<div>
			<button
				onClick={handler}
				className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline hover:bg-white/20"
			>
				{text}
			</button>{" "}
			{payload}
		</div>
	);
}
function Chat() {
	const chat = api.chat.useMutation();
	return (
		<section>
			{chat.isLoading ? (
				<p>thinking...</p>
			) : (
				<ActionButton
					text="AI chat-call:"
					handler={() => {
						chat.mutate();
					}}
					payload={chat.data?.payload ?? ""}
				/>
			)}
		</section>
	);
}
function Chat2() {
	const chat2 = api.chat2.useMutation();
	return (
		<section>
			{chat2.isLoading ? (
				<p>thinking...</p>
			) : (
				<ActionButton
					text="AI chat2-call:"
					handler={() => {
						chat2.mutate();
					}}
					payload={chat2.data?.payload ?? ""}
				/>
			)}
		</section>
	);
}
function Chat3() {
	const chat3 = api.chat3.useMutation();
	return (
		<section>
			{chat3.isLoading ? (
				<p>thinking...</p>
			) : (
				<ActionButton
					text="AI chat3-call:"
					handler={() => {
						chat3.mutate();
					}}
					payload={chat3.data?.payload ?? ""}
				/>
			)}
		</section>
	);
}
