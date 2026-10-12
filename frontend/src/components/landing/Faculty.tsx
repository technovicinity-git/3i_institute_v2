"use client";

import Image from "next/image";
import { useFaculty } from "@/hooks/use-site";

/** Real instructors with published courses, most-enrolled first. */
export default function Faculty() {
  const { data: faculty, isLoading } = useFaculty();

  if (!isLoading && (faculty?.length ?? 0) === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-white scroll-mt-20" id="faculty">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <p className="text-xs font-semibold text-brand-gold uppercase tracking-widest mb-2">
            Faculty of Distinction
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-brand-navy">
            Learn from Qualified Faculty
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  className="h-[300px] rounded-xl border border-gray-100 bg-gray-50 animate-pulse"
                />
              ))
            : faculty!.map((member) => (
                <div
                  key={member.id}
                  className="border border-gray-100 rounded-xl overflow-hidden flex flex-col"
                >
                  <div className="relative w-full h-48 bg-[#F9F6F0] flex items-center justify-center">
                    {member.avatarUrl ? (
                      <Image
                        src={member.avatarUrl}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="font-serif text-5xl text-[#B8912F]">
                        {member.name
                          .split(" ")
                          .map((p) => p[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="p-6 flex flex-col gap-1 flex-1">
                    <h3 className="font-serif text-lg text-brand-navy">
                      {member.name}
                    </h3>
                    {member.mainCategory && (
                      <p className="text-xs font-semibold text-brand-gold uppercase tracking-wide">
                        {member.mainCategory}
                      </p>
                    )}
                    {member.bio && (
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 mt-1">
                        {member.bio}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-auto pt-3">
                      {member.courseCount} course
                      {member.courseCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
