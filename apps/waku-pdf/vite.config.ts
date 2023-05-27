import path from "node:path";
import url from "node:url";
import topLevelAwait from "vite-plugin-top-level-await";
import { defineConfig } from "waku/config";

console.log("vite dev!!");
export default defineConfig({
	server: {
		host: "0.0.0.0",
	},
	optimizeDeps: {
		include: ["@acme/shared", "@acme/tailwind-config"],
	},
	plugins: [
		topLevelAwait({
			// The export name of top-level await promise for each chunk module
			promiseExportName: "__tla",
			// The function to generate import names of top-level await promise in each chunk module
			promiseImportName: (i) => `__tla_${i}`,
		}),
	],
	root: path.dirname(url.fileURLToPath(import.meta.url)),
});
