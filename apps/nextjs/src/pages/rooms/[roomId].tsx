import { useState } from "react";
import { useRouter } from "next/router";
import { type Session } from "next-auth";
import { signIn, useSession } from "next-auth/react";

import { type Message } from "@acme/api/src/router/room";

import { api } from "~/utils/api";

function PostItem({ message }: { message: Message; session: Session }) {
	return <li>{message.message}</li>;
}

export default function RoomPage() {
	// const utils = api.useContext();
	const sendMsgZod = api.room.sendMsgZod.useMutation();
	const sendMsg = api.room.sendMsg.useMutation();

	const { query } = useRouter();
	const roomId = query.roomId as string;

	// console.log({ roomId });
	api.room.onAdd.useSubscription(undefined, {
		onData(newPost) {
			console.log({ newPost });
			// setMessages((all) => [...all, newPost]);
		},
		onError(err) {
			console.error("Subscription error:", err);
			// we might have missed a message - invalidate cache
			// utils.room.infinite.invalidate();
		},
	});
	api.room.onAdd2.useSubscription(undefined, {
		onData(newPost) {
			console.log({ newPost });
			// setMessages((all) => [...all, newPost]);
		},
		onError(err) {
			console.error("Subscription error:", err);
			// we might have missed a message - invalidate cache
			// utils.room.infinite.invalidate();
		},
	});

	const { data: session } = useSession();

	// const [message, setMessage] = useState("");
	const [messages, _setMessages] = useState<Message[]>([]);
	if (!session) {
		return <button onClick={() => void signIn()}>login</button>;
	}

	// const addMessages = useCallback((incoming?: Message[]) => {
	// 	setMessages((current) => {
	// 		const map: Record<Message["id"], Message> = {};
	// 		for (const msg of current ?? []) {
	// 			map[msg.id] = msg;
	// 		}
	// 		for (const msg of incoming ?? []) {
	// 			map[msg.id] = msg;
	// 		}
	// 		return Object.values(map).sort(
	// 			(a, b) => a.sendAt.getTime() - b.sendAt.getTime(),
	// 		);
	// 	});
	// }, []);

	async function postMessage(msg: string) {
		try {
			await sendMsgZod.mutateAsync({
				message: msg,
				roomId,
			});
			await sendMsg.mutateAsync({
				message: msg,
				roomId,
			});
			// setMessage("");
		} catch (err) {
			console.error(err);
		}
	}

	return (
		<main className="flex h-screen flex-col items-center bg-gradient-to-b from-[#230053] to-[#101225] text-slate-50">
			<div className="container mt-12 flex flex-col items-center justify-center gap-4 px-4 py-8">
				<h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
					<span className="text-pink-500">CadenAI 🤗!</span>
				</h1>
				<div>welcome to {roomId}</div>

				<ul>
					{messages.map((post) => {
						return <PostItem key={post.id} message={post} session={session} />;
					})}
				</ul>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						void postMessage("jamon");
					}}
				>
					<textarea
						name=""
						placeholder="share your mind"
						cols={30}
						rows={10}
					></textarea>

					<button type="submit">send!</button>
				</form>
			</div>
		</main>
	);
}
