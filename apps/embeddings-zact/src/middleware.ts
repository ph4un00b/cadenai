import { NextResponse, type NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
	console.log("🐋", request.nextUrl.pathname);
	console.log("🍪", request.cookies);
	// return NextResponse.redirect(new URL("/home", request.url));
	return NextResponse.next();
}

export const config = {
	matcher: "/todos/zact",
};
