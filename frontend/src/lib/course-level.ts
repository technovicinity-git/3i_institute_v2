export type CourseLevelKey = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL";

/** Maps a course level ("1"/"Beginner"…) to its `courseLevel.*` message key. */
export function levelKey(level: string): CourseLevelKey {
  const levels: Record<string, CourseLevelKey> = {
    "1": "BEGINNER",
    "2": "INTERMEDIATE",
    "3": "ADVANCED",
    Beginner: "BEGINNER",
    Intermediate: "INTERMEDIATE",
    Advanced: "ADVANCED",
  };
  return levels[level] ?? "ALL";
}
