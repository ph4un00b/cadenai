import Link from "next/link";
import { Redis } from "@upstash/redis";

import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { env } from "~/env.mjs";
import { BotRules } from "./(ui)/rules";

const textoBot = `phau_bot
"no trabajo los fines de semana."
"estoy disponible de 09:00 a 13:00 (CST | UTC-6)."
"vamos a charlar, agéndame una cita en el siguiente enlace."
"servicios y habilidades: desarrollo de aplicaciones web con TypeScript, MySQL, Next, React Native y Frontend."
"no tengo servicios de PHP, Rails, C#."
"recibo pagos por hora o por semana."
`;

export default function Todos() {
	return (
		<div>
			<h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
				<span className="text-pink-500">bot 🤗!</span>
			</h1>
			<br />
			<BotRules text={textoBot} />
			<br />
			<Link
				href="/bot/ask"
				className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
			>
				ask ✨
			</Link>
			<TableDemo />
		</div>
	);
}

const redis = new Redis({
	url: env.REDIS_ENDPOINT,
	token: env.REDIS_TOKEN,
});

type BotEmbeds = {
	embeds: Record<string, ReadonlyArray<number>>;
	// embeds: ReadonlyMap<string, ReadonlyArray<number>>;
};

const { embeds } = ((await redis.json.get("phaubot:embeds")) as BotEmbeds) ?? {
	embeds: {},
};

const sentences = Object.entries(embeds);

function TableDemo() {
	return (
		<Table>
			<TableCaption>A list of your bot memory.</TableCaption>
			<TableHeader>
				<TableRow>
					{/* <TableHead className="w-[100px]">Invoice</TableHead> */}
					<TableHead>Texto</TableHead>
					<TableHead>Embeddings</TableHead>
					{/* <TableHead className="text-right">Amount</TableHead> */}
				</TableRow>
			</TableHeader>
			<TableBody>
				{sentences.map((text) => (
					<TableRow key={text[0]}>
						{/* <TableCell className="font-medium">{invoice.invoice}</TableCell> */}
						<TableCell>{text[0]}</TableCell>
						<TableCell>{text[1][0]}</TableCell>
						{/* <TableCell className="text-right">{invoice.totalAmount}</TableCell> */}
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
