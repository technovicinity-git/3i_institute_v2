import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = [
  // "/dashboard",
  "/my-courses",
  "/certificates",
  "/notifications",
  "/chat",
  "/notes",
  "/settings",
  "/exams",
];

// Routes that only instructors can access
const instructorRoutes = ["/instructor"];

// Routes that only admins can access
const adminRoutes = ["/admin"];

// Public routes — redirect authenticated users away
const authRoutes = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
  const isInstructorRoute = instructorRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // If protected route and no refresh token, redirect to login
  if (isProtected && !refreshToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If admin route and no token, redirect
  // if (isAdminRoute && !refreshToken) {
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }
  if (!refreshToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If auth route and already logged in, redirect to dashboard
  // if (isAuthRoute && refreshToken) {
  //   return NextResponse.redirect(new URL("/dashboard", request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
