export function levelLabel(level: string): string {
  return level === "1" ? "Beginner" : level === "2" ? "Intermediate" : "Advanced";
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
}
