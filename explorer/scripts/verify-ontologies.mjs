import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Parser } from 'n3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ontologyDir = path.resolve(__dirname, '../../ontology');

const CIM_NS = 'http://iec.ch/TC57/CIM100#';
const OWL_IMPORTS = 'http://www.w3.org/2002/07/owl#imports';
const SELF_LOOP_PREDS = new Set([
  'http://www.w3.org/2000/01/rdf-schema#subClassOf',
  'http://www.w3.org/2000/01/rdf-schema#subPropertyOf',
  'http://www.w3.org/2002/07/owl#equivalentProperty',
  'http://www.w3.org/2002/07/owl#equivalentClass',
]);
const LEGACY_PREFIX_RE = /(?<![A-Za-z0-9_-])(?:xinfra|sif|cimbology):/i;
const FORBIDDEN_FILES = new Set(['cimbology-kg.ttl', 'cimbology-kg.owl', 'cimbology-kg.jsonld']);

const errors = [];
for (const entry of fs.readdirSync(ontologyDir)) {
  if (FORBIDDEN_FILES.has(entry.toLowerCase())) {
    errors.push(`Forbidden extension ontology artifact found in ontology/: ${entry}`);
  }
}

const ttlFiles = fs
  .readdirSync(ontologyDir)
  .filter((f) => f.endsWith('.ttl'))
  .sort();

if (ttlFiles.length === 0) {
  console.error(`No .ttl files found in ${ontologyDir}`);
  process.exit(1);
}

const quadsByFile = new Map();
const importsGraph = new Map();

for (const fileName of ttlFiles) {
  const fullPath = path.join(ontologyDir, fileName);
  const content = fs.readFileSync(fullPath, 'utf8');

  if (content.toLowerCase().includes('cimbology.org')) {
    errors.push(`Forbidden legacy token 'cimbology.org' found in ${fileName}`);
  }
  if (content.toLowerCase().includes('cimbology.com/ontology/kg')) {
    errors.push(`Forbidden extension namespace 'cimbology.com/ontology/kg' found in ${fileName}`);
  }
  const m = content.match(LEGACY_PREFIX_RE);
  if (m) {
    errors.push(`Forbidden legacy prefix '${m[0]}' found in ${fileName}`);
  }

  let quads;
  try {
    const parser = new Parser();
    quads = parser.parse(content);
  } catch (err) {
    errors.push(`Turtle parse error in ${fileName}: ${err.message}`);
    continue;
  }

  if (quads.length === 0) {
    errors.push(`Empty Turtle graph: ${fileName}`);
    continue;
  }

  quadsByFile.set(fileName, quads);

  for (const q of quads) {
    if (SELF_LOOP_PREDS.has(q.predicate.value) && q.subject.value === q.object.value) {
      errors.push(`Self-loop detected in ${fileName}: ${q.subject.value} <${q.predicate.value}>`);
    }
    if (q.predicate.value === OWL_IMPORTS && q.subject.termType === 'NamedNode' && q.object.termType === 'NamedNode') {
      if (!importsGraph.has(q.subject.value)) importsGraph.set(q.subject.value, new Set());
      importsGraph.get(q.subject.value).add(q.object.value);
    }
  }
}

// Check circular owl:imports
const state = new Map();
function dfs(node) {
  state.set(node, 1);
  for (const target of importsGraph.get(node) ?? []) {
    const st = state.get(target) ?? 0;
    if (st === 1) {
      errors.push(`Circular owl:imports detected involving ${node} -> ${target}`);
    } else if (st === 0) {
      dfs(target);
    }
  }
  state.set(node, 2);
}
for (const node of importsGraph.keys()) {
  if ((state.get(node) ?? 0) === 0) dfs(node);
}

// Check cim: IRI resolution against iec61970.ttl + iec61968.ttl
if (quadsByFile.has('iec61970.ttl') && quadsByFile.has('iec61968.ttl')) {
  const declared = new Set();
  for (const baseFile of ['iec61970.ttl', 'iec61968.ttl']) {
    for (const q of quadsByFile.get(baseFile)) {
      if (q.subject.termType === 'NamedNode' && q.subject.value.startsWith(CIM_NS)) {
        declared.add(q.subject.value);
      }
    }
  }

  for (const [fileName, quads] of quadsByFile.entries()) {
    const unresolved = new Set();
    for (const q of quads) {
      for (const term of [q.subject, q.predicate, q.object]) {
        if (
          term.termType === 'NamedNode' &&
          term.value.startsWith(CIM_NS) &&
          term.value.length > CIM_NS.length &&
          !declared.has(term.value)
        ) {
          unresolved.add(term.value);
        }
      }
    }
    for (const uri of [...unresolved].sort()) {
      errors.push(`Unresolved cim: IRI in ${fileName}: ${uri}`);
    }
  }
}

// Check sibling .owl and .jsonld files exist for each .ttl
for (const fileName of ttlFiles) {
  const stem = fileName.slice(0, -4);
  for (const ext of ['.owl', '.jsonld']) {
    const sibling = path.join(ontologyDir, `${stem}${ext}`);
    if (!fs.existsSync(sibling)) {
      errors.push(`Missing companion serialization: ${stem}${ext}`);
    }
  }
}

// Verify cim-model.json exists and parses
const modelPath = path.join(ontologyDir, 'cim-model.json');
if (!fs.existsSync(modelPath)) {
  errors.push('Missing ontology/cim-model.json');
} else {
  try {
    const model = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
    if (model?.metadata?.counts?.totalTypes !== 1414) {
      errors.push(`Unexpected cim-model.json totalTypes: ${model?.metadata?.counts?.totalTypes}`);
    }
  } catch (err) {
    errors.push(`Invalid cim-model.json: ${err.message}`);
  }
}

if (errors.length > 0) {
  console.error(`Ontology verification FAILED (${errors.length} error(s)):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`Ontology verification PASSED (${ttlFiles.length} Turtle ontologies + companion .owl/.jsonld + cim-model.json).`);
