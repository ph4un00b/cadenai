import { aiRouter } from "./router/ai";
import { authRouter } from "./router/auth";
import { postRouter } from "./router/post";
import { roomRouter } from "./router/room";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
	post: postRouter,
	auth: authRouter,
	ai: aiRouter,
	room: roomRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
