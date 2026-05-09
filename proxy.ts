import { NextResponse } from "next/server";

export function proxy() {
  // Since we are using localStorage for auth in Phase 1 (client-side only),
  // we can't easily check auth status in middleware (server-side) without a cookie.
  // For now, we'll let the client-side AuthProvider handle redirects.
  // In Phase 2, we would check for an 'auth_token' cookie here.

  return NextResponse.next();
}

// Optionally, exclude static files and api routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - bgycc_logo.svg (logo)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|bgycc_logo.svg).*)",
  ],
};
