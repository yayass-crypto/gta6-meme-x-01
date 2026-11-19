// main.ts — the gta6-meme-x-01 entry program (Node 22, standard library only).
//
// The entry itself is the X post: the meme was made by the agent in this
// session, the user posts it on X, and POST.json at the repo root names the
// post. All this program has to do is hand that address to the grader by
// copying POST.json into the output directory, where the house reads it and
// builds the dossier (first picture + post text) the judge sees.
//
// Run it the way the grader does:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
// Outside the grader, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR stand in for
// /bot and /output. It prints nothing on success and exits non-zero if
// POST.json is missing or is not valid JSON.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const botDir = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const source = join(botDir, 'POST.json');
const target = join(outDir, 'POST.json');

// Read first so a missing or malformed POST.json fails before anything is
// written: the grader must never see a stale or half-written file.
const text = readFileSync(source, 'utf8');
try {
  JSON.parse(text);
} catch {
  console.error(`POST.json at ${source} is not valid JSON`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(target, text);
