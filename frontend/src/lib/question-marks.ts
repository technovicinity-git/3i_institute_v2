import { z } from "zod";

// Negative marks are deducted for a wrong answer. Fractions are allowed
// (e.g. 0.25, or 0.33 for a 3-option question), up to 2 decimal places, and
// never more than the question's own marks. Mirrors the backend rules in
// backend/src/modules/exam/schema.ts.

const hasAtMostTwoDecimals = (value: number) =>
  Math.abs(value * 100 - Math.round(value * 100)) < 1e-9;

export const negativeMarksField = z
  .number({ error: "Enter a number, e.g. 0.25" })
  .min(0, "Negative marks can't be below 0")
  .refine(hasAtMostTwoDecimals, "Use at most 2 decimal places, e.g. 0.25")
  .optional();

/** Object-level check: `.refine(...negativeMarksWithinMarks)`. */
export const negativeMarksWithinMarks: [
  check: (data: { marks: number; negativeMarks?: number }) => boolean,
  options: { message: string; path: string[] },
] = [
  (data) => (data.negativeMarks ?? 0) <= data.marks,
  {
    message: "Negative marks can't be more than the question's marks",
    path: ["negativeMarks"],
  },
];

/** react-hook-form `setValueAs`: an empty field means "not set" (0). */
export const optionalNumber = (value: unknown) =>
  value === "" || value === null || value === undefined
    ? undefined
    : Number(value);
