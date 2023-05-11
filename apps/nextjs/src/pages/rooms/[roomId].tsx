import { useState } from "react";
import { useRouter } from "next/router";
import { type Session } from "next-auth";
import { useSession } from "next-auth/react";

import { type Message } from "@acme/api/src/router/room";

import { api } from "~/utils/api";
import { useSubscription } from "~/utils/pusher.hook";

function PostItem({ message }: { message: Message; session: Session | null }) {
	return <li>{JSON.stringify(message)}</li>;
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

	useSubscription<Message>("add-post", (data) => {
		console.log(JSON.stringify(data));
		setMessages((p) => [...p, data]);
	});

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
