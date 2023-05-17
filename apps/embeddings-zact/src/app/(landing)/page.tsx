import CallBtn from "./action.client";
import call from "./fns/call.server";

export default function Embeds() {
	return (
		<div>
			<h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
				<span className="text-pink-500">CadenAI 🤗!</span>
			</h1>
			<br />
			<CallBtn action={call} />
		</div>
	);
}
