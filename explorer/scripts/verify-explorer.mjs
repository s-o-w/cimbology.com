import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const ontologyDir = path.resolve(__dirname, '../../ontology');

const errors = [];

// 1. Check required built entrypoints, blog, research, redirects, and deep CIM routes
const requiredFiles = [
  'index.html',
  'about/index.html',
  'blog/index.html',
  'blog/rss.xml',
  'research/timeline/index.html',
  'research/cimbology-graph/index.html',
  'research/why-cim-matters/index.html',
  'research/cimbology-graphrag/index.html',
  'research/dottc57/index.html',
  'research/ai-and-engineering/index.html',
  'why-cim-matters.html',
  'dotTC57.html',
  'cimbology-case-study.html',
  'ai-philosophy.html',
  'favicon.svg',
  'vendor/mermaid.min.js',
  'vendor/mermaid-init.js',
  'cim/index.html',
  'cim/iec61970/index.html',
  'cim/iec61968/index.html',
  'cim/iec61970/base/wires/index.html',
  'cim/iec61970/base/wires/breaker/index.html',
  'cim/iec61968/infiec61968/infwork/compatibleunit/index.html',
];

for (const rel of requiredFiles) {
  if (!fs.existsSync(path.join(distDir, rel))) {
    errors.push(`Missing required built file: dist/${rel}`);
  }
}

if (fs.existsSync(path.join(distDir, 'cim/cimbology-kg')) || fs.existsSync(path.join(distDir, 'research/cimbology-kg'))) {
  errors.push('Forbidden cimbology-kg directory should not exist in dist/');
}

// 2. Check Pagefind index presence
const pagefindDir = path.join(distDir, 'pagefind');
if (!fs.existsSync(pagefindDir) || fs.readdirSync(pagefindDir).length === 0) {
  errors.push('Pagefind search index missing or empty in dist/pagefind/');
}

// 3. Walk all built HTML files: check count, sizes, & internal links
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
if (medianSize > 80 * 1024) {
  errors.push(`Median HTML page size ${(medianSize / 1024).toFixed(1)} KB exceeds 80 KB sidebar-bloat threshold`);
}

const attrUrlRe = /\b(?:href|src)="([^"]+)"/g;
const brokenLinks = new Set();
const htmlCache = new Map();

function readCachedHtml(fullPath) {
  if (!htmlCache.has(fullPath)) {
    htmlCache.set(fullPath, fs.readFileSync(fullPath, 'utf8'));
  }
  return htmlCache.get(fullPath);
}

for (const file of htmlFiles) {
  const html = readCachedHtml(file);
  if (html.includes('/ontology/cimbology-kg') || html.includes('/cim/cimbology-kg')) {
    errors.push(`Forbidden extension ontology link found in ${path.relative(distDir, file)}`);
  }
  let m;
  while ((m = attrUrlRe.exec(html)) !== null) {
    const fullAttr = m[1];
    const [pathAndQuery, fragment] = fullAttr.split('#');
    const rawPath = pathAndQuery.split('?')[0];
    if (!rawPath || !rawPath.startsWith('/') || rawPath.startsWith('//')) continue;

    if (rawPath.startsWith('/ontology/')) {
      const rel = rawPath.slice('/ontology/'.length);
      if (!fs.existsSync(path.join(ontologyDir, rel))) {
        brokenLinks.add(`${path.relative(distDir, file)} -> ${fullAttr}`);
      }
      continue;
    }

    const rel = rawPath.slice(1);
    const targetDirIndex = path.join(distDir, rel, 'index.html');
    const targetDirect = path.join(distDir, rel);
    let resolvedTarget = null;
    if (fs.existsSync(targetDirIndex)) resolvedTarget = targetDirIndex;
    else if (fs.existsSync(targetDirect)) resolvedTarget = targetDirect;
    else {
      brokenLinks.add(`${path.relative(distDir, file)} -> ${fullAttr}`);
      continue;
    }

    if (fragment && fragment !== '_top' && resolvedTarget.endsWith('.html')) {
      const targetHtml = readCachedHtml(resolvedTarget);
      if (!targetHtml.includes(`id="${fragment}"`)) {
        brokenLinks.add(`${path.relative(distDir, file)} -> ${fullAttr} (missing #${fragment})`);
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
  ['cim/iec61970/index.html', 'IEC61970.Base.Wires'],
  ['cim/iec61968/index.html', 'IEC61968.AssetInfo'],
]) {
  const fullStd = path.join(distDir, stdPath);
  if (fs.existsSync(fullStd)) {
    const html = fs.readFileSync(fullStd, 'utf8');
    if (!html.includes(expectedText)) {
      errors.push(`Standard overview page ${stdPath} missing expected package table entry '${expectedText}'`);
    }
  }
}

const cimIndex = path.join(distDir, 'cim/index.html');
if (fs.existsSync(cimIndex)) {
  const indexHtml = fs.readFileSync(cimIndex, 'utf8');
  const sidebarMatch = indexHtml.match(/<sl-sidebar-state-persist[\s\S]*?<\/sl-sidebar-state-persist>/i);
  if (sidebarMatch) {
    const sidebarHrefs = [...sidebarMatch[0].matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    const seen = new Set();
    for (const h of sidebarHrefs) {
      if (seen.has(h)) errors.push(`Duplicate sidebar link detected: ${h}`);
      seen.add(h);
    }
  } else {
    errors.push('Could not locate <sl-sidebar-state-persist> sidebar tree in cim/index.html');
  }
}

const mermaidSelfLoopRe = /\b([A-Za-z0-9_]+)\s+--\|>\s+\1\b/;
for (const file of htmlFiles) {
  const html = readCachedHtml(file);
  for (const preMatch of html.matchAll(/<pre class="mermaid">([\s\S]*?)<\/pre>/g)) {
    if (mermaidSelfLoopRe.test(preMatch[1])) {
      errors.push(`Mermaid self-inheritance loop detected in ${path.relative(distDir, file)}`);
    }
  }
}

if (errors.length > 0) {
  console.error(`Site verification FAILED (${errors.length} error(s)):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(
  `Site verification PASSED (${htmlFiles.length} HTML pages, median size ${(medianSize / 1024).toFixed(1)} KB, Pagefind & RSS present, 0 broken links).`
);
