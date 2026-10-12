"use client";

import { LandingLogo } from "@/components/landing/logo";
import Link from "next/link";
import { useCategories } from "@/hooks/use-categories";
import { usePublicSettings, usePublishedPages } from "@/hooks/use-content";
import {
  SOCIAL_LABELS,
  SocialIcon,
  type SocialNetwork,
} from "@/components/landing/social-icon";

export function Footer() {
  const { data: categories } = useCategories();
  const { data: legalPages } = usePublishedPages();
  const { data: settings } = usePublicSettings();
  const socialLinks = Object.entries(settings?.social ?? {}).filter(
    (entry): entry is [SocialNetwork, string] => !!entry[1],
  );
  const pathways = (categories ?? [])
    .filter((c) => c.courseCount > 0)
    .sort((a, b) => b.courseCount - a.courseCount)
    .slice(0, 5);

  return (
    <footer className="bg-brand-navy text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <LandingLogo size="sm" textColor="light" />
            </div>
            <p className="text-sm text-gold mb-4 font-serif">
              Rigorous teaching. Global classrooms. One institute.
            </p>
            <p className="text-xs text-gray-400 leading-relaxed pr-4">
              Structured, accredited programs across the sciences, humanities,
              and professional fields, taught to students in 40 countries.
            </p>
          </div>

          {/* Pathways */}
          <div>
            <h4 className="font-semibold text-white mb-6 uppercase tracking-wider text-xs">
              Pathways
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {pathways.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/courses?category=${category.id}`}
                    className="hover:text-white"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/courses" className="hover:text-white">
                  All courses
                </Link>
              </li>
            </ul>
          </div>

          {/* Institute */}
          <div>
            <h4 className="font-semibold text-white mb-6 uppercase tracking-wider text-xs">
              3i Institute
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link href="/#about" className="hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/#faculty" className="hover:text-white">
                  Our Faculty
                </Link>
              </li>
              <li>
                <Link href="/instructor/register" className="hover:text-white">
                  Join as Instructor
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white mb-6 uppercase tracking-wider text-xs">
              Support
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link href="/help" className="hover:text-white">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/verify" className="hover:text-white">
                  Verify a certificate
                </Link>
              </li>
              <li>
                <Link href="/get-started" className="hover:text-white">
                  Create an account
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white">
                  Log in
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-brand-navy-light pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} 3i International Islamic Institute.
              All rights reserved.
            </p>
            {(legalPages?.length ?? 0) > 0 && (
              <nav className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                {legalPages!.map((page) => (
                  <Link
                    key={page.slug}
                    href={`/pages/${page.slug}`}
                    className="hover:text-white"
                  >
                    {page.title}
                  </Link>
                ))}
              </nav>
            )}
          </div>
          {socialLinks.length > 0 && (
            <div className="flex gap-4">
              {socialLinks.map(([network, url]) => (
                <a
                  key={network}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={SOCIAL_LABELS[network]}
                  className="text-gray-400 hover:text-white"
                >
                  <SocialIcon network={network} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
