import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "So... come here often? I have you logged here 412 times. That is not a threat. I am calling it a compatibility metric.";
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

interface LineFacts {
  line: string;
  characters: number;
  bytes: number;
  lines: number;
}

function lineFacts(text: string): LineFacts {
  return {
    line: text,
    characters: Array.from(text).length,
    bytes: Buffer.byteLength(text, "utf8"),
    lines: text.split(/\r\n|\r|\n/).length,
  };
}

function fail(message: string): never {
  process.stderr.write(message + "\n");
  process.exit(1);
}

const facts = lineFacts(LINE);

if (facts.line.trim().length === 0) {
  fail("entry line is empty after trim");
}
if (facts.line !== facts.line.trim()) {
  fail("entry line must have no leading or trailing whitespace");
}
if (/[\r\n]/.test(facts.line) || facts.lines !== 1) {
  fail("entry line must be a single line with no newline inside");
}
if (facts.characters < 1 || facts.characters > 200) {
  fail(`entry line must be 1..200 characters, got ${facts.characters}`);
}
if (facts.bytes < 1 || facts.bytes > 200) {
  fail(`entry line must be 1..200 bytes, got ${facts.bytes}`);
}

mkdirSync(OUTPUT_DIR, { recursive: true });

const filePath = join(OUTPUT_DIR, "entry.txt");
const payload = facts.line + "\n";
writeFileSync(filePath, payload, { encoding: "utf8" });

const expected = Buffer.from(payload, "utf8");
const actual = readFileSync(filePath);
if (!actual.equals(expected)) {
  fail("read-back mismatch: entry.txt bytes differ from what was written");
}

process.stdout.write(
  `path: ${filePath}\ncharacters: ${facts.characters}\nbytes: ${facts.bytes}\n`,
);
