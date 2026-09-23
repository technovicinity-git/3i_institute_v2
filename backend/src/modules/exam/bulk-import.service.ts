import Papa from "papaparse";
import { prisma } from "#/lib/prisma";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "#/shared/errors";

interface CsvRow {
  type?: string;
  question?: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  option_e?: string;
  correct_answer?: string;
  suggested_answer?: string;
  marks?: string;
  negative_marks?: string;
  difficulty?: string;
  explanation?: string;
}

interface ImportError {
  row: number;
  message: string;
}

interface ImportResult {
  total: number;
  imported: number;
  failed: number;
  errors: ImportError[];
}

const VALID_TYPES = [
  "mcq",
  "multi_select",
  "true_false",
  "short_answer",
  "essay",
];
const VALID_DIFFICULTIES = ["easy", "medium", "hard"];

function parseMarks(value: string | undefined, fallback: number): number {
  if (!value || value.trim() === "") return fallback;
  const parsed = parseInt(value.trim(), 10);
  if (isNaN(parsed)) throw new Error("Marks must be a number");
  return parsed;
}

function lettersToOptions(
  correctAnswer: string,
  options: (string | undefined)[],
): string[] {
  // "A,B,C" → ["Option at index 0", "Option at index 1", ...]
  const letters = correctAnswer
    .split(",")
    .map((l) => l.trim().toUpperCase())
    .filter((l) => l !== "");

  return letters.map((letter) => {
    const index = letter.charCodeAt(0) - 65; // A=0, B=1, ...
    const option = options[index];
    if (!option || option.trim() === "") {
      throw new Error(
        `Correct answer references option ${letter} which is empty`,
      );
    }
    return option.trim();
  });
}

export class BulkImportService {
  async importQuestions(
    instructorId: string,
    courseId: string,
    fileBuffer: Buffer,
  ): Promise<ImportResult> {
    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenError(
        "You can only import questions to your own courses",
      );
    }

    // Parse CSV
    const csvContent = fileBuffer.toString("utf-8").replace(/^\uFEFF/, ""); // Strip BOM

    const parsed = Papa.parse<CsvRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
    });

    if (parsed.errors.length > 0) {
      throw new ValidationError(
        `CSV parsing error: ${parsed.errors[0]?.message ?? "Unknown error"}`,
      );
    }

    const rows = parsed.data;
    const errors: ImportError[] = [];
    const questionsToInsert: any[] = [];

    // Validate each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // Header is row 1, data starts at row 2

      try {
        if (!row) {
          errors.push({ row: rowNumber, message: "Empty row" });
          continue;
        }

        // Validate type
        const type = (row.type ?? "").trim().toLowerCase();
        if (!VALID_TYPES.includes(type)) {
          throw new Error(
            `Invalid type "${row.type}". Must be one of: ${VALID_TYPES.join(", ")}`,
          );
        }

        // Validate question
        const questionText = (row.question ?? "").trim();
        if (!questionText) {
          throw new Error("Question text is required");
        }

        // Validate marks
        const marks = parseMarks(row.marks, 1);
        if (marks < 1 || marks > 100) {
          throw new Error("Marks must be between 1 and 100");
        }

        const negativeMarks = parseMarks(row.negative_marks, 0);
        if (negativeMarks < 0) {
          throw new Error("Negative marks cannot be negative");
        }

        const difficulty = (row.difficulty ?? "medium").trim().toLowerCase();
        if (!VALID_DIFFICULTIES.includes(difficulty)) {
          throw new Error(
            `Invalid difficulty "${row.difficulty}". Must be easy, medium, or hard`,
          );
        }

        const explanation = row.explanation?.trim() || null;
        const suggestedAnswer = row.suggested_answer?.trim() || null;

        let options: string[] | undefined;
        let correctAnswer: string | string[] | undefined;

        // Type-specific validation
        if (type === "mcq" || type === "multi_select") {
          const rawOptions = [
            row.option_a,
            row.option_b,
            row.option_c,
            row.option_d,
            row.option_e,
          ];

          const validOptions = rawOptions
            .map((o) => (o ?? "").trim())
            .filter((o) => o !== "");

          if (validOptions.length < 2) {
            throw new Error("MCQ and multi_select require at least 2 options");
          }

          options = validOptions;

          const correctRaw = (row.correct_answer ?? "").trim();
          if (!correctRaw) {
            throw new Error(
              "Correct answer is required for MCQ and multi_select",
            );
          }

          if (type === "mcq") {
            // Single answer — accept "A" or "A,"
            const letter = correctRaw.split(",")[0]!.trim().toUpperCase();
            const index = letter.charCodeAt(0) - 65;
            const option = rawOptions[index];
            if (!option || option.trim() === "") {
              throw new Error(
                `Correct answer "${letter}" does not match any option`,
              );
            }
            correctAnswer = option.trim();
          } else {
            // Multi-select — accept "A,B,C"
            correctAnswer = lettersToOptions(correctRaw, rawOptions);
          }
        } else if (type === "true_false") {
          options = ["True", "False"];
          const answer = (row.correct_answer ?? "").trim().toLowerCase();
          if (answer !== "true" && answer !== "false") {
            throw new Error(
              'True/false correct_answer must be "True" or "False"',
            );
          }
          correctAnswer = answer === "true" ? "True" : "False";
        } else if (type === "short_answer" || type === "essay") {
          if (!suggestedAnswer) {
            // Suggested answer optional — allow empty
          }
        }

        questionsToInsert.push({
          scope: "INSTRUCTOR",
          ownerId: instructorId,
          courseId,
          type,
          question: questionText,
          options: options ? JSON.parse(JSON.stringify(options)) : undefined,
          correctAnswer: correctAnswer
            ? JSON.parse(JSON.stringify(correctAnswer))
            : undefined,
          suggestedAnswer,
          marks,
          negativeMarks,
          partialCredit: false,
          difficulty,
          explanation,
        });
      } catch (rowError: any) {
        errors.push({
          row: rowNumber,
          message: rowError.message ?? "Unknown error",
        });
      }
    }

    // Bulk insert valid questions
    let imported = 0;
    if (questionsToInsert.length > 0) {
      const result = await prisma.question.createMany({
        data: questionsToInsert,
      });
      imported = result.count;
    }

    return {
      total: rows.length,
      imported,
      failed: errors.length,
      errors,
    };
  }
}

export const bulkImportService = new BulkImportService();
