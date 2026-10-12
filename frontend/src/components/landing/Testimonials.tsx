"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { useTestimonials } from "@/hooks/use-site";

/**
 * Real written reviews from learners. Learners can be minors, so a review is
 * attributed to its course, never to a person.
 */
export default function Testimonials() {
  const { data: testimonials } = useTestimonials();

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-brand-cream">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-brand-gold uppercase tracking-widest mb-2">
            Student Reviews
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-brand-navy">
            What Our Learners Say
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col"
            >
              <div className="flex gap-0.5 mb-4" aria-label={`${t.rating} out of 5 stars`}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < t.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 italic leading-relaxed mb-8 flex-grow line-clamp-6">
                &quot;{t.review}&quot;
              </p>
              <p className="text-xs text-gray-500">
                Learner review ·{" "}
                <Link
                  href={`/courses/${t.courseId}`}
                  className="font-semibold text-brand-navy hover:underline"
                >
                  {t.courseTitle}
                </Link>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
