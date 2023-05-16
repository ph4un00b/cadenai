"use client";

export default function Error({
	error,
	reset,
}: {
	error: Error;
	reset: () => void;
}) {
	console.log({ error, reset });
	return error.stack;
}
