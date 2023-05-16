/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds and Linting.
 */
// !process.env.SKIP_ENV_VALIDATION && (await import("./src/env.mjs"));

/** @type {import("next").NextConfig} */
const config = {
	webpack(config) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
		config.experiments = { ...config.experiments, topLevelAwait: true };
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return config;
	},
	experimental: { serverActions: true },
	reactStrictMode: true,
	/** Enables hot reloading for local packages without a build step */
	transpilePackages: ["@acme/shared"],
	/** We already do linting and typechecking as separate tasks in CI */
	eslint: { ignoreDuringBuilds: !!process.env.CI },
	typescript: { ignoreBuildErrors: !!process.env.CI },
};

export default config;
