import { EmbedCall, EmbedCompare } from "../(ui)/action.client";

export default function Embeds() {
	return (
		<div className="text-gray-900">
			<h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
				<span className="text-pink-500">CadenAI 🤗!</span>
			</h1>
			<br />
			<EmbedCall />
			<EmbedCompare />
		</div>
	);
}
