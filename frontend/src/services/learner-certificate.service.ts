import { apiClient } from "@/lib/api-client";

export interface ExamCertificateDetails {
  /** Course progress percentage at the time the certificate was generated. */
  progress: number;
  completedLessons: number;
  totalLessons: number;
  /** The learner's last exam score at the time the certificate was generated. */
  score: number | null;
  totalMarks: number;
  examTitle: string;
  attemptNumber?: number;
  passed?: boolean | null;
  graded?: boolean;
}

export interface ExamCertificate {
  id: string;
  type: "ATTENDANCE" | "COMPLETION" | "EXAM";
  verificationCode: string;
  learnerNameSnapshot: string;
  courseTitleSnapshot: string;
  issuerName: string | null;
  issuedAt: string;
  examId: string | null;
  details: ExamCertificateDetails | null;
}

export const learnerCertificateService = {
  getExamCertificate: async (
    learnerProfileId: string,
    courseId: string,
  ): Promise<ExamCertificate | null> => {
    const response = await apiClient.get(
      `/certificates/exam?learnerProfileId=${learnerProfileId}&courseId=${courseId}`,
    );
    return response.data.data;
  },

  issueExamCertificate: async (
    learnerProfileId: string,
    courseId: string,
  ): Promise<ExamCertificate> => {
    const response = await apiClient.post("/certificates/issue/exam", {
      learnerProfileId,
      courseId,
    });
    return response.data.data;
  },
};

function pdfSafeText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7e]/g, "?")
    .replace(/[\\()]/g, "\\$&");
}

/** Build a small, dependency-free, printable certificate PDF. */
export function downloadExamCertificatePdf(certificate: ExamCertificate) {
  const details = certificate.details;
  const date = new Date(certificate.issuedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const result = details
    ? details.score === null
      ? "Result: Pending grading"
      : `Result: ${details.score} / ${details.totalMarks} (${details.passed === null || details.passed === undefined ? "graded" : details.passed ? "passed" : "not passed"})`
    : "Result: Not available";
  const lines: string[] = [];
  const addText = (text: string, x: number, y: number, size: number, font = "F1") => {
    lines.push(`BT /${font} ${size} Tf ${x} ${y} Td (${pdfSafeText(text)}) Tj ET`);
  };
  const centerText = (text: string, y: number, size: number, font = "F1") => {
    const safe = pdfSafeText(text);
    const x = Math.max(45, (842 - safe.length * size * 0.52) / 2);
    lines.push(`BT /${font} ${size} Tf ${x.toFixed(1)} ${y} Td (${safe}) Tj ET`);
  };

  lines.push("0.07 0.19 0.31 RG 3 w 28 28 786 539 re S");
  lines.push("0.13 0.63 0.27 RG 1 w 39 39 764 517 re S");
  centerText(certificate.issuerName ?? "3i International Islamic Institute", 510, 16, "F2");
  centerText("CERTIFICATE OF ACHIEVEMENT", 455, 27, "F2");
  centerText("This certificate is proudly presented to", 410, 13);
  centerText(certificate.learnerNameSnapshot, 365, 29, "F2");
  centerText("for completing the course", 325, 13);
  centerText(certificate.courseTitleSnapshot, 290, 22, "F2");
  centerText(details?.examTitle ? `Latest exam: ${details.examTitle}` : "Course examination", 248, 13);
  centerText(result, 218, 15, "F2");
  if (details?.attemptNumber) centerText(`Attempt number: ${details.attemptNumber}`, 192, 11);
  if (details?.progress !== undefined) {
    centerText(`Course progress at issuance: ${details.progress}%`, 170, 11);
  }
  addText(`Issued: ${date}`, 74, 104, 11);
  addText(`Certificate ID: ${certificate.id}`, 74, 84, 9);
  addText(`Verification code: ${certificate.verificationCode}`, 74, 66, 9);
  centerText("Verify this certificate using its verification code.", 49, 9);

  const content = lines.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
  const link = document.createElement("a");
  const filename = pdfSafeText(`${certificate.learnerNameSnapshot}-${certificate.courseTitleSnapshot}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  link.href = url;
  link.download = `${filename || "course"}-certificate.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
