import { NextResponse, type NextRequest } from "next/server";
import generateCSP from "./utils/generate-csp";

export async function middleware(request: NextRequest) {
  const nonce = crypto.randomUUID();
  const csp = generateCSP({ nonce });

  const requestHeaders = new Headers(request.headers);

  requestHeaders.set("x-nonce", nonce);

  const headerKey = "content-security-policy";

  requestHeaders.set(headerKey, csp);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set(headerKey, csp);

  return response;
}
