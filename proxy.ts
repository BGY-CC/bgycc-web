import { NextResponse } from "next/server";

export function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api(?:/|$)|_next(?:/|$)|favicon.ico$|bgycc_logo(?:\\.svg|\\.png)$).*)",
  ],
};
