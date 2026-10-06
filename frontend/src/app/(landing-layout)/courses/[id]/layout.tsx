import type { Metadata } from "next";
import { headers } from "next/headers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface PublicCourse {
  id: string;
  title: string;
  summary?: string | null;
  thumbnailUrl?: string | null;
  coverImageUrl?: string | null;
  status?: string;
  instructor?: { firstName?: string; lastName?: string } | null;
}

async function fetchCourse(id: string): Promise<PublicCourse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const body = await response.json();
    return (body?.data as PublicCourse) ?? null;
  } catch {
    return null;
  }
}

// Canonical origin for absolute share URLs.
async function siteOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  if (configured) return configured;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

// Rich link previews (WhatsApp, Facebook, X, LinkedIn, Slack, …) for shared
// course links. The page itself is a client component, so metadata lives here.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const [course, origin] = await Promise.all([fetchCourse(id), siteOrigin()]);
  const url = `${origin}/courses/${id}`;

  if (!course || (course.status && course.status !== "PUBLISHED")) {
    return {
      title: "Course",
      alternates: { canonical: url },
      robots: course ? { index: false } : undefined,
    };
  }

  const instructor = [course.instructor?.firstName, course.instructor?.lastName]
    .filter(Boolean)
    .join(" ");
  const description = truncate(
    course.summary?.trim() ||
      `Learn "${course.title}" at 3i International Islamic Institute.`,
    200,
  );
  const image = course.coverImageUrl || course.thumbnailUrl || undefined;

  return {
    title: course.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: "3i International Islamic Institute",
      url,
      title: course.title,
      description,
      ...(image
        ? { images: [{ url: image, alt: course.title }] }
        : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: course.title,
      description,
      ...(image ? { images: [image] } : {}),
    },
    ...(instructor ? { authors: [{ name: instructor }] } : {}),
  };
}

export default function CourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
