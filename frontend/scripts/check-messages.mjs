// Fails when a language is missing keys that exist in English (the source),
// has keys English doesn't, or loses a {placeholder}. Run: npm run i18n:check
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(import.meta.dirname, "..", "messages");
const source = "en";

function flatten(object, prefix = "", out = {}) {
  for (const [key, value] of Object.entries(object)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object") flatten(value, path, out);
    else out[path] = String(value);
  }
  return out;
}

// Argument names only: `{name}` / `{name, plural, …}`, not plural branch text
// such as `one {Course}`. A language may use an argument fewer times.
const placeholders = (text) =>
  [
    ...new Set(
      [
        ...text.matchAll(
          /(?<!(?:zero|one|two|few|many|other|=\d+)\s*)\{\s*(\w+)\s*[,}]/g,
        ),
      ].map((m) => m[1]),
    ),
  ]
    .sort()
    .join(",");

const load = (locale) =>
  flatten(JSON.parse(readFileSync(join(dir, `${locale}.json`), "utf8")));

const english = load(source);
let problems = 0;

for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
  const locale = file.replace(".json", "");
  if (locale === source) continue;
  const messages = load(locale);
  for (const key of Object.keys(english)) {
    if (!(key in messages)) {
      console.error(`[${locale}] missing: ${key}`);
      problems++;
    } else if (placeholders(messages[key]) !== placeholders(english[key])) {
      console.error(`[${locale}] placeholders differ: ${key}`);
      problems++;
    }
  }
  for (const key of Object.keys(messages)) {
    if (!(key in english)) {
      console.error(`[${locale}] not in English: ${key}`);
      problems++;
    }
  }
}

if (problems > 0) {
  console.error(`\n${problems} translation problem(s).`);
  process.exit(1);
}
console.log(`Translations OK (${Object.keys(english).length} keys).`);
