// /* eslint-disable @typescript-eslint/ban-ts-comment */
import "../styles/globals.css";
import type { AppType } from "next/app";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "~/utils/api";

const MyApp: AppType<{ session: Session | null }> = ({
	Component,
	pageProps: { session, ...pageProps },
}) => {
	return (
		<SessionProvider session={session}>
			{/** @ts-expect-error TODO: research more! */}
			<Component {...pageProps} />
		</SessionProvider>
	);
};

export default api.withTRPC(MyApp);
