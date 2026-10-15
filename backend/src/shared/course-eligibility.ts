// Age and subscription rules that decide whether a learner profile may enrol
// in a course (FR-ENR-03/04/05).

/** Max years a guardian can override a course's minimum age (FR-ENR-04). */
export const AGE_OVERRIDE_YEARS = 2;

export function calculateAge(dateOfBirth: Date, today = new Date()): number {
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
  ) {
    age--;
  }
  return age;
}

export type AgeCheckResult =
  | { eligible: true; age: number; overrideApplied: boolean }
  | {
      eligible: false;
      age: number;
      reason: "TOO_YOUNG" | "TOO_OLD" | "ADULTS_ONLY";
      message: string;
      /** True when a guardian override would make the profile eligible. */
      canOverride: boolean;
    };

export function checkCourseAge(
  dateOfBirth: Date,
  course: { minimumAge: number; maximumAge: number | null },
  ageOverride = false,
): AgeCheckResult {
  const age = calculateAge(dateOfBirth);

  // FR-ENR-05: No override into 18+ courses
  if (course.minimumAge >= 18 && age < 18) {
    return {
      eligible: false,
      age,
      reason: "ADULTS_ONLY",
      message: "This course is restricted to adults",
      canOverride: false,
    };
  }

  if (age < course.minimumAge) {
    const canOverride = age >= course.minimumAge - AGE_OVERRIDE_YEARS;
    if (canOverride && ageOverride) {
      return { eligible: true, age, overrideApplied: true };
    }
    return {
      eligible: false,
      age,
      reason: "TOO_YOUNG",
      message: `Learner does not meet the minimum age requirement of ${course.minimumAge}`,
      canOverride,
    };
  }

  if (course.maximumAge !== null && age > course.maximumAge) {
    return {
      eligible: false,
      age,
      reason: "TOO_OLD",
      message: `This course is for learners aged ${course.maximumAge} and under`,
      canOverride: false,
    };
  }

  return { eligible: true, age, overrideApplied: false };
}
