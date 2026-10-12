"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import type { CurriculumModule } from "@/types/course-details";

export function CourseCurriculum({
  modules,
}: {
  modules: CurriculumModule[];
}) {
  // Tracks the open module; lesson lists are hidden for now.
  const [openModule, setOpenModule] = useState<number>(0);

  return (
    <div>
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-sm font-bold text-[#0C1F33] mb-3">
            Detailed Syllabus
          </p>
          <h2 className="font-serif text-[40px] leading-[48px] text-[#0C1F33]">
            Curriculum
          </h2>
        </div>
      </div>

      <div className="space-y-1">
        {modules.map((mod, idx) => {
          const videoLesson = mod.lessonsList.find(
            (lesson) => lesson.type?.toLowerCase() === "video",
          );

          return (
            <div
              key={idx}
              className="border border-[#E3E8EF] rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenModule(openModule === idx ? -1 : idx)}
                className="w-full flex items-start justify-between gap-4 px-5 py-3 text-left bg-white hover:bg-[#F5F0E8] transition-colors"
              >
                <div className="flex items-start gap-5 min-w-0 flex-1">
                  <span className="font-serif text-[#B8912F] leading-6 shrink-0 min-w-[1.75rem]">
                    {mod.moduleNum}
                  </span>
                  <span className="font-serif text-[#0C1F33] leading-6 min-w-0 break-words">
                    {mod.title}
                  </span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="inline-flex items-center gap-1.5 text-sm leading-6 text-[#64748B] whitespace-nowrap">
                    {videoLesson ? (
                      <>
                        <Clock className="h-4 w-4" />
                        Video · {videoLesson.duration}
                      </>
                    ) : (
                      "Pdf"
                    )}
                  </span>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
