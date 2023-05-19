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
		</div>
	);
}
