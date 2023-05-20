export { UpstashCache } from "./src/langchain.upstash_cache";
export { phaubonacci, phaudecrypter, phauencrypter } from "./src/tools";

export async function wait(ms: number) {
	return new Promise((resolve) => globalThis.setTimeout(resolve, ms));
}

export const cosineSimilarity = (
	A: readonly number[],
	B: readonly number[],
): number => {
	let dotProduct = 0;
	let mA = 0;
	let mB = 0;

	const start = performance.now();

	for (let i = 0; i < A.length; i++) {
		dotProduct += A[i]! * B[i]!;
		mA += A[i]! * A[i]!;
		mB += B[i]! * B[i]!;
	}

	mA = Math.sqrt(mA);
	mB = Math.sqrt(mB);
	const similarity = dotProduct / (mA * mB);

	const end = performance.now();
	console.log(`😱 cos-1 - ${end - start} ms`);

	return similarity;
};

export const cosineSimilarity2 = (
	A: number[] = [],
	B: number[] = [],
): number => {
	let dotProduct = 0;
	let mA = 0;
	let mB = 0;

	const start = performance.now();

	A.forEach((a, i) => {
		dotProduct += a * B[i]!;
		mA += a ** 2;
		mB += B[i]! ** 2;
	});

	const similarity = dotProduct / (Math.sqrt(mA) * Math.sqrt(mB));

	const end = performance.now();
	console.log(`😱 cos-2 - ${end - start} ms`);
	return similarity;
};
