import Pusher from "pusher-js";

const globalForPusher = globalThis as { pusher?: Pusher };
export const pusherClient =
	globalForPusher.pusher ||
	new Pusher("e308934c387a668f59c0", {
		cluster: "us2",
		forceTLS: true,
	});
globalForPusher.pusher = pusherClient;
