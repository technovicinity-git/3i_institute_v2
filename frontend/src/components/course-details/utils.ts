export function levelLabel(level: string): string {
  return level === "1" ? "Beginner" : level === "2" ? "Intermediate" : "Advanced";
}

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  bn: "Bangla",
  hi: "Hindi",
  ur: "Urdu",
  ar: "Arabic",
};

export function languageLabel(code: string): string {
  return LANGUAGE_LABELS[code] ?? code;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
}
