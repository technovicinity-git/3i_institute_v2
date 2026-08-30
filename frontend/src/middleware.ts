import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication (learner dashboard)
const protectedRoutes = [
  "/dashboard",
  "/my-courses",
  "/certificates",
  "/notifications",
  "/chat",
  "/notes",
  "/settings",
  "/exams",
  "/profiles",
  "/seats",
  "/live-classes",
  "/assignments",
  "/wishlist",
];

// Routes that only instructors can access (protected)
const instructorProtectedRoutes = [
  "/instructor/dashboard",
  "/instructor/courses",
  "/instructor/live-classes",
  "/instructor/assignments",
  "/instructor/exams",
  "/instructor/certificates",
  "/instructor/students",
  "/instructor/settings",
];

// Instructor public routes (not protected)
const instructorPublicRoutes = ["/instructor/login", "/instructor/register"];

// Public auth routes — redirect authenticated users away
const authRoutes = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  const isInstructorProtected = instructorProtectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  const isInstructorPublic = instructorPublicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  // If learner protected route and no token → redirect to login
  if (isProtected && !refreshToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If instructor protected route and no token → redirect to instructor login
  if (isInstructorProtected && !refreshToken) {
    const loginUrl = new URL("/instructor/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If auth route and already logged in → redirect to dashboard
  // But skip instructor public routes (login/register)
  if (isAuthRoute && refreshToken && !isInstructorPublic) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

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
