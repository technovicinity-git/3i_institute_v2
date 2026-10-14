import Link from "next/link";
import { greeting, serif } from "./utils";

export function GreetingHeader({
  displayName,
  hasCourses,
  studiedToday,
}: {
  displayName: string;
  hasCourses: boolean;
  studiedToday: boolean;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl md:text-[36px] text-[#0C1F33]" style={serif}>
          {greeting()}, {displayName}
        </h1>
        <p className="text-base text-[#64748B]">
          {!hasCourses
            ? "Find your first course to start learning."
            : studiedToday
              ? "Nice work today — keep the momentum going."
              : "Pick up where you left off."}
        </p>
      </div>
      <Link
        href="/courses"
        className="text-sm font-semibold text-[#12304E] border border-[#E3E8EF] bg-white px-4 py-2 rounded-lg hover:bg-gray-50"
      >
        Browse courses
      </Link>
    </div>
  );
}
