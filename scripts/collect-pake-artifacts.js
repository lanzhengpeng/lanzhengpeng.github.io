/**
 * Collect Pake build artifacts from a `--json` report into a flat dist folder.
 *
 * Usage: node scripts/collect-pake-artifacts.js [report.json] [dist/]
 */

const fs = require('fs');
const path = require('path');

const reportFile = process.argv[2] || 'pake-out.json';
const distDir = process.argv[3] || 'dist';

if (!fs.existsSync(reportFile)) {
  console.error(`Pake report not found: ${reportFile}`);
  process.exit(1);
}

const raw = fs.readFileSync(reportFile, 'utf8');
let report;
try {
  report = JSON.parse(raw);
} catch (err) {
  console.error(`Failed to parse ${reportFile}:`, err.message);
  process.exit(1);
}

if (!report.ok) {
  console.error('Pake build failed:', report.error);
  process.exit(1);
}

fs.mkdirSync(distDir, { recursive: true });

for (const output of report.outputs || []) {
  const src = output.path;
  if (!src || !fs.existsSync(src)) {
    console.warn(`Missing output file: ${src}`);
    continue;
  }
  const dest = path.join(distDir, path.basename(src));
  fs.copyFileSync(src, dest);
  console.log(`Collected ${output.format}: ${dest}`);
}

console.log(`Collected ${(report.outputs || []).length} artifact(s).`);
