import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const ontologyDir = path.resolve(__dirname, '../../ontology');

const errors = [];

// 1. Check required built entrypoints & deep routes
const requiredFiles = [
  'index.html',
  'iec61970/index.html',
  'iec61968/index.html',
  'iec61970/base/wires/index.html',
  'iec61970/base/wires/breaker/index.html',
  'iec61968/infiec61968/infwork/compatibleunit/index.html',
  'cimbology-kg/index.html',
  'cimbology-kg/classes/index.html',
  'cimbology-kg/classes/foundation/index.html',
  'cimbology-kg/classes/clearancecheck/index.html',
  'cimbology-kg/kinds/index.html',
  'cimbology-kg/properties/object/index.html',
  'cimbology-kg/properties/annotations/index.html',
  'cimbology-kg/properties/domain-datatype/index.html',
  'cimbology-kg/properties/general-datatype/index.html',
  'vendor/mermaid.min.js',
  'vendor/mermaid-init.js',
];

for (const rel of requiredFiles) {
  if (!fs.existsSync(path.join(distDir, rel))) {
    errors.push(`Missing required built file: dist/${rel}`);
  }
}

// 2. Check Pagefind index presence
const pagefindDir = path.join(distDir, 'pagefind');
if (!fs.existsSync(pagefindDir) || fs.readdirSync(pagefindDir).length === 0) {
  errors.push('Pagefind search index missing or empty in dist/pagefind/');
}

// 3. Walk all built HTML files: check sizes & internal /cim/ and /ontology/ links
const htmlFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) htmlFiles.push(full);
  }
}
walk(distDir);

if (htmlFiles.length < 1500) {
  errors.push(`Expected >= 1500 built HTML pages, found ${htmlFiles.length}`);
}

const sizes = htmlFiles.map((f) => fs.statSync(f).size).sort((a, b) => a - b);
const medianSize = sizes[Math.floor(sizes.length / 2)] ?? 0;
if (medianSize > 60 * 1024) {
  errors.push(`Median HTML page size ${(medianSize / 1024).toFixed(1)} KB exceeds 60 KB sidebar-bloat threshold`);
}

const hrefRe = /href="([^"]+)"/g;
const brokenLinks = new Set();

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = hrefRe.exec(html)) !== null) {
    const rawHref = m[1].split('#')[0].split('?')[0];
    if (!rawHref) continue;

    if (rawHref.startsWith('/cim/')) {
      const rel = rawHref.slice('/cim/'.length);
      const targetDirIndex = path.join(distDir, rel, 'index.html');
      const targetDirect = path.join(distDir, rel);
      if (!fs.existsSync(targetDirIndex) && !fs.existsSync(targetDirect)) {
        brokenLinks.add(`${path.relative(distDir, file)} -> ${rawHref}`);
      }
    } else if (rawHref.startsWith('/ontology/')) {
      const rel = rawHref.slice('/ontology/'.length);
      if (!fs.existsSync(path.join(ontologyDir, rel))) {
        brokenLinks.add(`${path.relative(distDir, file)} -> ${rawHref}`);
      }
    }
  }
}

for (const b of [...brokenLinks].slice(0, 30)) {
  errors.push(`Broken internal link: ${b}`);
}
if (brokenLinks.size > 30) {
  errors.push(`... and ${brokenLinks.size - 30} additional broken links`);
}

// 4. Verify Standard Overview pages were not clobbered & have no duplicate sidebar hrefs or Mermaid self-loops
for (const [stdPath, expectedText] of [
  ['iec61970/index.html', 'IEC61970.Base.Wires'],
  ['iec61968/index.html', 'IEC61968.AssetInfo'],
]) {
  const html = fs.readFileSync(path.join(distDir, stdPath), 'utf8');
  if (!html.includes(expectedText)) {
    errors.push(`Standard overview page ${stdPath} missing expected package table entry '${expectedText}'`);
  }
}

const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
const sidebarMatch = indexHtml.match(/<nav[^>]*aria-label="Main"[\s\S]*?<\/nav>/i);
if (sidebarMatch) {
  const sidebarHrefs = [...sidebarMatch[0].matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  const seen = new Set();
  for (const h of sidebarHrefs) {
    if (seen.has(h)) errors.push(`Duplicate sidebar link detected: ${h}`);
    seen.add(h);
  }
}

const mermaidSelfLoopRe = /\b([A-Za-z0-9_]+)\s+--\|>\s+\1\b/;
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const preMatch = html.match(/<pre class="mermaid">([\s\S]*?)<\/pre>/);
  if (preMatch && mermaidSelfLoopRe.test(preMatch[1])) {
    errors.push(`Mermaid self-inheritance loop detected in ${path.relative(distDir, file)}`);
  }
}

if (errors.length > 0) {
  console.error(`Explorer verification FAILED (${errors.length} error(s)):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(
  `Explorer verification PASSED (${htmlFiles.length} HTML pages, median size ${(medianSize / 1024).toFixed(1)} KB, Pagefind present, 0 broken links).`
);
