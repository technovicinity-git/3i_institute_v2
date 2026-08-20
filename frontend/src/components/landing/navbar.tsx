"use client";

import Link from "next/link";

export function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-100 py-4 px-6 md:px-12 sticky top-0 z-50 flex items-center justify-between shadow-sm">
      <Link href="/" className="flex items-center gap-2">
        <svg
          className="w-8 h-8 text-green"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
        </svg>
        <span className="font-semibold text-xl tracking-tight text-brand-navy">
          3i Institute
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium">
        <a
          href="#courses"
          className="text-brand-navy hover:text-green transition-colors"
        >
          Courses
        </a>
        <a
          href="#pathways"
          className="text-brand-navy hover:text-green transition-colors"
        >
          Programs
        </a>
        <a
          href="#faculty"
          className="text-brand-navy hover:text-green transition-colors"
        >
          Instructors
        </a>
        <a
          href="#about"
          className="text-brand-navy hover:text-green transition-colors"
        >
          About
        </a>
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
