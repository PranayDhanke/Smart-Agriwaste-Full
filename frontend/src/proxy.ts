import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const isProtectedRoute = createRouteMatcher(["/(hi|mr)?/page(.*)"]);

export default clerkMiddleware((auth, req) => {
  // 🔐 Protect selected routes
  if (isProtectedRoute(req)) auth.protect();

  // 🌍 Handle locale routing
  return intlMiddleware(req);
});

export const config = {
  matcher: [
    /*
     * Match all routes EXCEPT:
     * - static files (with extension)
     * - _next
     * - api
     */
    "/((?!api|_next|.*\\..*).*)",
  ],
};