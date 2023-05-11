import { useEffect, useRef } from "react";

import { pusherClient } from "./pusher.service";

/**
 * me lo robé de
 * @see https://github.com/pingdotgg/uploadthing/blob/main/packages/react/src/component.tsx
 */
type DontForget<TMessage extends void | unknown> = void extends TMessage
	? "YOU FORGOT TO PASS THE GENERIC 👀👀"
	: TMessage;

export function useSubscription<TMessage extends void | unknown = void>(
	eventName: string,
	callback: (data: DontForget<TMessage>) => void,
) {
	const stableCallback = useRef(callback);
	useEffect(() => {
		stableCallback.current = callback;
	}, [callback]);

	const channel = useRef(pusherClient.subscribe("cadenai-development")).current;

	useEffect(() => {
		// console.log({ Pusher });
		// if (Pusher.instances.length > 0) return;
		const reference = (data: DontForget<TMessage>) => {
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
