import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { serve } from "waku/client";

import "./index.css";

const root = createRoot(document.getElementById("root")!);

const App = serve<{ name: string }>("App");
root.render(
	<StrictMode>
		<App name="Waku" />
	</StrictMode>,
);
