async function wait(ms: number) {
	return new Promise((resolve) => {
		globalThis.setTimeout(() => resolve("ok"), ms);
	});
}

export default async function Home() {
	await wait(3000);
	return (
		<div>
			<h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
				<span className="text-pink-500">CadenAI 🤗!</span>
			</h1>

			<button className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20">
				wait!
			</button>
		</div>
	);
}
