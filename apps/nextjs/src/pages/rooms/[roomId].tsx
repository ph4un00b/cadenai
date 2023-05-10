import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { type Session } from "next-auth";
import { useSession } from "next-auth/react";
import Pusher from "pusher-js";

import { type Message } from "@acme/api/src/router/room";

import { api } from "~/utils/api";

const pusher = new Pusher("e308934c387a668f59c0", {
	cluster: "us2",
	forceTLS: true,
});
const channel = pusher.subscribe("cadenai-development");

function PostItem({ message }: { message: Message; session: Session | null }) {
	return <li>{message.message}</li>;
}

export default function RoomPage() {
	// const utils = api.useContext();
	const sendMsgZod = api.room.sendMsgZod.useMutation();
	// const sendMsg = api.room.sendMsg.useMutation();

	const { query } = useRouter();
	const roomId = query.roomId as string;

	const { data: session } = useSession();

	// const [message, setMessage] = useState("");
	const [messages, setMessages] = useState<Message[]>([]);

	useEffect(() => {
		channel.bind("add-post", function (data: Message) {
			console.log(JSON.stringify(data));
			setMessages((p) => [...p, data]);
		});

		return () => {
			channel.unbind_all();
		};
	}, []);
	// if (!session) {
	// 	return <button onClick={() => void signIn()}>login</button>;
	// }

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
						// void postMessage("jamon");
						sendMsgZod.mutate({
							message: "hola",
							roomId,
						});
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
