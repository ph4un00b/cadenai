import { useEffect, useRef } from "react";

import { pusherClient } from "./pusher.service";

export function useSubscription<TMessage>(
	eventName: string,
	callback: (data: TMessage) => void,
) {
	const stableCallback = useRef(callback);
	useEffect(() => {
		stableCallback.current = callback;
	}, [callback]);

	const channel = useRef(pusherClient.subscribe("cadenai-development")).current;

	useEffect(() => {
		// console.log({ Pusher });
		// if (Pusher.instances.length > 0) return;
		const reference = (data: TMessage) => {
			stableCallback.current(data);
		};

		pusherClient.connect();
		channel.bind(eventName, reference);

		return () => {
			/**
			 * @todo
			 * find out what's the correct hook to use here
			 */

			channel.unbind(eventName, reference);
			channel.unsubscribe();
			channel.unbind_all();

			pusherClient.disconnect();
		};
	}, [eventName, channel]);
}
