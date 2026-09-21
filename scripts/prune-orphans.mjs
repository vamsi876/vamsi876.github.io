/**
 * prune-orphans.mjs
 *
 * After `astro build`, scan dist/_astro for *.png and *.jpg files that are not
 * referenced by any URL path in dist HTML/JS/CSS/JSON output. Delete unreferenced
 * files and print a summary. Exit 1 if a referenced file would be deleted (safety
 * check that should never fire, but prevents accidents).
 */

import fs from 'node:fs';
import path from 'node:path';

const DIST = new URL('../dist', import.meta.url).pathname;
const ASTRO_DIR = path.join(DIST, '_astro');

if (!fs.existsSync(DIST)) {
  console.error('[prune-orphans] dist/ not found — run `astro build` first');
  process.exit(1);
}

if (!fs.existsSync(ASTRO_DIR)) {
  console.log('[prune-orphans] dist/_astro not found — nothing to prune');
  process.exit(0);
}

// Collect all *.png and *.jpg in dist/_astro
const candidates = fs.readdirSync(ASTRO_DIR).filter(
  (f) => f.endsWith('.png') || f.endsWith('.jpg')
);

if (candidates.length === 0) {
  console.log('[prune-orphans] No .png/.jpg in dist/_astro — nothing to prune');
  process.exit(0);
}

// Collect all dist output files to scan for references
function collectDistFiles(dir) {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...collectDistFiles(full));
    } else if (/\.(html|js|css|json)$/.test(entry.name)) {
      result.push(full);
    }
  }
  return result;
}

const distFiles = collectDistFiles(DIST);

// Build a set of referenced filenames: a file is referenced if its path
// (/_astro/<filename>) appears as a URL string in any dist output file.
const referenced = new Set();
for (const file of distFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  for (const candidate of candidates) {
    if (content.includes('/_astro/' + candidate)) {
      referenced.add(candidate);
    }
  }
}

// Safety inversion: abort if any referenced file is in our deletion list.
// This should never fire (we only delete unreferenced), but acts as a guard.
const wouldDeleteReferenced = candidates.filter((f) => referenced.has(f));
if (wouldDeleteReferenced.length > 0) {
  console.error(
    '[prune-orphans] SAFETY: would delete referenced files — aborting:\n  ' +
      wouldDeleteReferenced.join('\n  ')
  );
  process.exit(1);
}

// Delete unreferenced files
const toDelete = candidates.filter((f) => !referenced.has(f));
let bytesFreed = 0;
for (const f of toDelete) {
  const full = path.join(ASTRO_DIR, f);
  bytesFreed += fs.statSync(full).size;
  fs.unlinkSync(full);
}

const mb = (bytesFreed / 1024 / 1024).toFixed(2);
console.log(
  `[prune-orphans] Removed ${toDelete.length} unreferenced image(s) (${mb} MB freed).`
);
if (toDelete.length > 0) {
  console.log('  Deleted:');
  for (const f of toDelete) console.log('    ' + f);
}
if (referenced.size > 0) {
  console.log(`  Kept ${referenced.size} referenced image(s).`);
}
