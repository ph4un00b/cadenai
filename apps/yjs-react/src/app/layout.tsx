import "./globals.css";
import type { Metadata } from "next";

import Sidebar from "~/components/Sidebar";

export const metadata: Metadata = {
	title: "y-sweet demos",
	description: "Demos of y-sweet.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className="bg-[radial-gradient(at_bottom_left,_var(--tw-gradient-stops))] from-emerald-50 to-emerald-900">
				<Sidebar>
					<div className="absolute top-0 h-full w-full bg-[radial-gradient(at_bottom_left,_var(--tw-gradient-stops))] from-white/10 via-emerald-400/90 to-emerald-800/90 pt-14 sm:mr-2 sm:rounded-lg lg:relative lg:w-auto lg:pt-0">
						{children}
					</div>
				</Sidebar>
			</body>
		</html>
	);
}
