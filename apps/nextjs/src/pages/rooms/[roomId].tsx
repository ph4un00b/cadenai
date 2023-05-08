import { useRouter } from "next/router";

export default function RoomPage() {
	const { query } = useRouter();
	const roomId = query.roomId as string;
	return (
		<main className="flex h-screen flex-col items-center bg-gradient-to-b from-[#230053] to-[#101225] text-slate-50">
			<div className="container mt-12 flex flex-col items-center justify-center gap-4 px-4 py-8">
				<h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
					<span className="text-pink-500">CadenAI 🤗!</span>
				</h1>
				<div>welcome to {roomId}</div>
			</div>
		</main>
	);
}
