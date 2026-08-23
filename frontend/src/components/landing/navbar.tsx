"use client";

import Link from "next/link";
import { LandingLogo } from "@/components/landing/logo";
export function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-100 py-4 px-6 md:px-12 sticky top-0 z-50 flex items-center justify-between shadow-sm">
      <Link href="/" className="flex items-center gap-2">
        <LandingLogo asLink={false} size="sm" textColor="dark" />
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium">
        <Link
          href="/courses"
          className="text-brand-navy hover:text-green transition-colors"
        >
          Courses
        </Link>

        <Link
          href="#pathways"
          className="text-brand-navy hover:text-green transition-colors"
        >
          Programs
        </Link>

        <Link
          href="#faculty"
          className="text-brand-navy hover:text-green transition-colors"
        >
          Instructors
        </Link>

        <Link
          href="#about"
          className="text-brand-navy hover:text-green transition-colors"
        >
          About
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="text-sm font-medium text-brand-navy hover:text-green"
        >
          Log in
        </Link>
        <Link
          href="/get-started"
          className="bg-green hover:bg-green-dark text-white text-sm font-medium py-2 px-5 rounded-md transition-colors shadow-sm"
        >
          Get started
        </Link>
      </div>
    </nav>
  );
}
