"use client";

import { useState } from "react";
import { Layers, Users } from "lucide-react";
import {
  BroadcastComposer,
  OptionCard,
} from "@/components/notifications/broadcast/broadcast-composer";
import { BroadcastHistory } from "@/components/notifications/broadcast/broadcast-history";
import {
  useInstructorBroadcastPreview,
  useSendInstructorBroadcast,
} from "@/hooks/use-broadcasts";
import { useInstructorCourses } from "@/hooks/use-instructor-courses";
import { useCourseBatches } from "@/hooks/use-batches";

const selectClass =
  "w-full rounded-lg border border-[#E3E8EF] bg-white px-3 py-2.5 text-sm text-[#334155] outline-none focus:border-[#0D2B45] focus:ring-2 focus:ring-[#0D2B45]/10";

export default function InstructorSendNotificationPage() {
  const [courseId, setCourseId] = useState("");
  const [target, setTarget] = useState<"COURSE" | "BATCH">("COURSE");
  const [batchId, setBatchId] = useState("");

  const { data: courses, isLoading: coursesLoading } = useInstructorCourses();
  const course = courses?.find((c) => c.id === courseId);
  // Online classes (and mixed courses) are taught in batches.
  const hasBatches = Boolean(course && course.type !== "REGULAR");
  const { data: batches, isLoading: batchesLoading } = useCourseBatches(
    hasBatches ? courseId : "",
  );

  const byBatch = hasBatches && target === "BATCH";
  const selectedBatch = batches?.find((b) => b.id === batchId);
  const ready = Boolean(course) && (!byBatch || Boolean(selectedBatch));

  const preview = useInstructorBroadcastPreview(
    ready ? courseId : "",
    byBatch ? batchId : undefined,
  );
  const send = useSendInstructorBroadcast();

  const audienceLabel = !course
    ? "your students"
    : byBatch && selectedBatch
      ? `students in ${selectedBatch.name} (${course.title})`
      : `all students of ${course.title}`;

  const selectCourse = (id: string) => {
    setCourseId(id);
    setTarget("COURSE");
    setBatchId("");
  };

  return (
    <div className="p-6 md:p-10">
      <div className="mb-6">
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Send Notification
        </h1>
        <p className="text-base text-[#64748B]">
          Notify the students of one of your courses.
        </p>
      </div>

      <BroadcastComposer
        audienceLabel={audienceLabel}
        ready={ready}
        preview={ready ? preview.data : undefined}
        previewLoading={ready && preview.isLoading}
        onSend={(content) =>
          send.mutateAsync({
            ...content,
            courseId,
            ...(byBatch ? { batchId } : {}),
          })
        }
        audience={
          <div className="space-y-4">
            <div>
              <label
                htmlFor="broadcast-course"
                className="mb-1.5 block text-sm font-medium text-[#334155]"
              >
                Course
              </label>
              <select
                id="broadcast-course"
                value={courseId}
                onChange={(e) => selectCourse(e.target.value)}
                disabled={coursesLoading}
                className={selectClass}
              >
                <option value="">
                  {coursesLoading ? "Loading courses…" : "Select a course"}
                </option>
                {courses?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                    {c.type === "REGULAR" ? "" : " · Online class"}
                  </option>
                ))}
              </select>
              {courses && courses.length === 0 && (
                <p className="mt-1.5 text-xs text-[#94A3B8]">
                  You don&apos;t have any courses yet.
                </p>
              )}
            </div>

            {hasBatches && (
              <>
                <div
                  role="radiogroup"
                  aria-label="Recipients"
                  className="grid gap-3 sm:grid-cols-2"
                >
                  <OptionCard
                    icon={Users}
                    label="All students"
                    description="Everyone enrolled in this course."
                    selected={target === "COURSE"}
                    onClick={() => setTarget("COURSE")}
                  />
                  <OptionCard
                    icon={Layers}
                    label="Specific batch"
                    description="Only students in one batch."
                    selected={target === "BATCH"}
                    onClick={() => setTarget("BATCH")}
                  />
                </div>

                {target === "BATCH" && (
                  <div>
                    <label
                      htmlFor="broadcast-batch"
                      className="mb-1.5 block text-sm font-medium text-[#334155]"
                    >
                      Batch
                    </label>
                    <select
                      id="broadcast-batch"
                      value={batchId}
                      onChange={(e) => setBatchId(e.target.value)}
                      disabled={batchesLoading}
                      className={selectClass}
                    >
                      <option value="">
                        {batchesLoading ? "Loading batches…" : "Select a batch"}
                      </option>
                      {batches
                        ?.filter((b) => b.status !== "CANCELLED")
                        .map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} · {b.status.toLowerCase()}
                          </option>
                        ))}
                    </select>
                    {batches && batches.length === 0 && (
                      <p className="mt-1.5 text-xs text-[#94A3B8]">
                        This course has no batches yet.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        }
      />

      <BroadcastHistory scope="instructor" />
    </div>
  );
}
