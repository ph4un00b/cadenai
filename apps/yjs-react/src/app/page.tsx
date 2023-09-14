import Image from "next/image";

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center p-24">
			<div className="z-10 w-full max-w-5xl font-mono text-sm">
				<p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
					Get started by editing&nbsp;
					<code className="font-mono font-bold">src/app/page.tsx</code>
				</p>
			</div>

			<div className="flex text-center">
				<h2 className={`mb-3 text-2xl font-semibold`}>
					YJS{" "}
					<span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
						-&gt;
					</span>
				</h2>
			</div>
		</main>
	);
}
