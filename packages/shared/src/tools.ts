export function phaubonacci(input: number): string {
	const emojis = ["😀", "😂", "😎", "🤔", "🤣", "😍", "🤩", "😜", "🥳"];
	let result = "";

	for (let i = 0; i < input; i++) {
		const emojisIndex = Math.floor(Math.random() * emojis.length);
		const emoji = emojis[emojisIndex];

		result += `fau${emoji}`;
	}

	return result;
}

export function phauencrypter(input: string) {
	const vowelMap: { [key: string]: string } = {
		a: "4",
		e: "3",
		i: "1",
		o: "0",
		u: "_",
	};

	const reversedChars = input.split("").reverse();

	const mappedChars = reversedChars.map((char) => {
		const lowerChar = char.toLowerCase();
		return vowelMap[lowerChar] || char;
	});

	return mappedChars.join("");
}

export function phaudecrypter(input: string): string {
	const vowelMap: { [key: string]: string } = {
		"4": "a",
		"3": "e",
		"1": "i",
		"0": "o",
		_: "u",
	};

	const reversedChars = input.split("").reverse();

	const mappedChars = reversedChars.map((char) => {
		const lowerChar = char.toLowerCase();
		return vowelMap[lowerChar] || char;
	});

	return mappedChars.join("");
}
