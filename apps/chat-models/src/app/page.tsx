"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/client/trpc-client";

export default function Home() {
	const utils = api.useContext();
	const [newTimerData, setNewTimerData] = useState("");
	const hello = api.alo.useQuery("phau!");

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
				{hello.isLoading ? <p>🌌🌌 thinking...</p> : <p>Hello, {hello.data}</p>}

				<ActionButton
					text={"create-timer ⚡"}
					handler={() => newTimer.mutate()}
					payload={newTimerData}
				/>

				<Remaining />

				<ActionButton text="end-timer 🚫" handler={() => endTimer.mutate()} />

				<Chat />
				<Chat2 />
				<Chat3 />
				<ChatTemplates />
				<ChatChain cheap={true} />
				<ChatAgent />
			</div>

			<div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
				hola mundo 😉!
			</div>
		</main>
	);
}

function Remaining() {
	const [remaining, setRemaining] = useState(0);
	const [isRunning, setIsRunning] = useState(false);
	const statusTimer = api.statusTimer.useQuery(undefined, {
		onSuccess(data) {
			const time = data.payload.timeLeft ?? 0;
			if (time > 0) {
				setRemaining(time);
				setIsRunning(true);
			}
		},
	});

	useEffect(() => {
		if (remaining <= 0) setIsRunning(false);
	}, [remaining]);

	useInterval(() => setRemaining((r) => r - 1), isRunning ? 1000 : null);

	return (
		<>
			{statusTimer.isLoading ? (
				<p>🌌🌌 thinking...</p>
			) : (
				<div>
					<span className="flex flex-row text-2xl">
						time remaining for next chat slot:&nbsp;&nbsp;
						<pre className="text-emerald-400">
							{formatTime({ seconds: remaining })}
						</pre>
					</span>
					{/* <pre>{statusTimer.data?.payload.raw}</pre> */}
				</div>
			)}
		</>
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
function ChatTemplates() {
	const utils = api.useContext();

	const template = api.chatTemplates.useMutation({
		async onSuccess() {
			await utils.client.endTimer.mutate();
			await utils.client.newTimer.mutate();
		},
	});
	return (
		<section>
			{template.isLoading ? (
				<p>thinking...</p>
			) : (
				<div>
					<button
						onClick={() => template.mutate()}
						className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline hover:bg-white/20"
					>
						AI template-call:
					</button>{" "}
					{template.data?.payload ?? ""}
				</div>
			)}
		</section>
	);
}
function ChatChain({ cheap = false }: { cheap: boolean }) {
	const utils = api.useContext();

	const chain = api.chatChain.useMutation({
		async onSuccess() {
			console.log({ cheap });
			await utils.client.endTimer.mutate();
			await utils.client.newTimer.mutate();
		},
	});
	return (
		<section>
			{chain.isLoading ? (
				<p>thinking...</p>
			) : (
				<div>
					<button
						onClick={() => chain.mutate()}
						className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline hover:bg-green-400/20"
					>
						AI chain-call:
					</button>{" "}
					{chain.data?.payload ?? ""}
				</div>
			)}
		</section>
	);
}

function ChatAgent() {
	const utils = api.useContext();

	const agent = api.chatAgent.useMutation({
		onError(err) {
			console.error(err);
		},
		async onSuccess() {
			await utils.client.endTimer.mutate();
			await utils.client.newTimer.mutate();
		},
	});
	return (
		<section>
			{agent.isLoading ? (
				<p>thinking...</p>
			) : (
				<div>
					<button
						onClick={() => agent.mutate()}
						className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline hover:bg-white/20"
					>
						AI agent-call:
					</button>{" "}
					{agent.data?.payload ?? ""}
				</div>
			)}
		</section>
	);
}

function Chat() {
	const utils = api.useContext();

	const chat = api.chat.useMutation({
		async onSuccess() {
			await utils.client.endTimer.mutate();
			await utils.client.newTimer.mutate();
		},
	});
	return (
		<section>
			{chat.isLoading ? (
				<p>thinking...</p>
			) : (
				<div>
					<button
						onClick={() => chat.mutate()}
						className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline hover:bg-white/20"
					>
						AI chat-call:
					</button>{" "}
					{chat.data?.payload ?? ""}
				</div>
			)}
		</section>
	);
}
function Chat2() {
	const utils = api.useContext();

	const chat2 = api.chat2.useMutation({
		async onSuccess() {
			await utils.client.endTimer.mutate();
			await utils.client.newTimer.mutate();
		},
	});
	return (
		<section>
			{chat2.isLoading ? (
				<p>thinking...</p>
			) : (
				<div>
					<button
						onClick={() => chat2.mutate()}
						className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline hover:bg-white/20"
					>
						AI chat2-call:
					</button>{" "}
					{chat2.data?.payload ?? ""}
				</div>
			)}
		</section>
	);
}
function Chat3() {
	const utils = api.useContext();

	const chat3 = api.chat3.useMutation({
		async onSuccess() {
			await utils.client.endTimer.mutate();
			await utils.client.newTimer.mutate();
		},
	});
	return (
		<section>
			{chat3.isLoading ? (
				<p>thinking...</p>
			) : (
				<div>
					<button
						onClick={() => chat3.mutate()}
						className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline hover:bg-white/20"
					>
						AI chat3-call:
					</button>{" "}
					{chat3.data?.payload ?? ""}
				</div>
			)}
		</section>
	);
}

function formatTime({ seconds = 0 }: { seconds?: number | null }): string {
	if (!seconds) return "00:00:00";
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainingSeconds = Math.floor(seconds % 60);

	return `${hours.toString().padStart(2, "0")}:${minutes
		.toString()
		.padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

/** @link https://overreacted.io/making-setinterval-declarative-with-react-hooks/ */
export function useInterval(callback: () => void, delay: number | null) {
	const savedCallback = useRef<() => void>(null!);

	useEffect(() => {
		savedCallback.current = callback;
	});

	useEffect(() => {
		function tick() {
			savedCallback.current();
		}

		if (delay !== null) {
			const id = window.setInterval(tick, delay);
			return () => window.clearInterval(id);
		}
	}, [delay]);
}

export function useTimeout(callback: () => void, delay: number) {
	const savedCallback = useRef<() => void>(null!);

	useEffect(() => {
		savedCallback.current = callback;
	});

	useEffect(() => {
		function tick() {
			savedCallback.current();
		}

		const id = window.setTimeout(tick, delay);
		return () => window.clearTimeout(id);
	}, [delay]);
}
