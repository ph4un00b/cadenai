import { AskBot } from "./(ui)/ask-bot";

export default function AskBotPage() {
	return (
		<div>
			<h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
				<span className="text-pink-500">ask bot 🤗!</span>
			</h1>
			<br />
			<AskBot />
		</div>
	);
}
