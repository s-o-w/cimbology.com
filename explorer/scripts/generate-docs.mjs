import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Parser } from 'n3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const explorerDir = path.resolve(__dirname, '..');
const ontologyDir = path.resolve(explorerDir, '../ontology');
// IMPORTANT: Only clean/write inside src/content/docs/cim/ so hand-authored
// root, blog/, research/, and about pages are never touched.
const docsDir = path.join(explorerDir, 'src/content/docs/cim');

const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const RDF_PROPERTY = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Property';
const RDFS_CLASS = 'http://www.w3.org/2000/01/rdf-schema#Class';
const RDFS_SUBCLASS_OF = 'http://www.w3.org/2000/01/rdf-schema#subClassOf';
const RDFS_LABEL = 'http://www.w3.org/2000/01/rdf-schema#label';
const RDFS_COMMENT = 'http://www.w3.org/2000/01/rdf-schema#comment';
const RDFS_DOMAIN = 'http://www.w3.org/2000/01/rdf-schema#domain';
const RDFS_RANGE = 'http://www.w3.org/2000/01/rdf-schema#range';
const RDFS_SEE_ALSO = 'http://www.w3.org/2000/01/rdf-schema#seeAlso';
const OWL_CLASS = 'http://www.w3.org/2002/07/owl#Class';
const OWL_OBJECT_PROP = 'http://www.w3.org/2002/07/owl#ObjectProperty';
const OWL_DATATYPE_PROP = 'http://www.w3.org/2002/07/owl#DatatypeProperty';
const OWL_ANNOTATION_PROP = 'http://www.w3.org/2002/07/owl#AnnotationProperty';
const QUDT_UNIT = 'http://qudt.org/schema/qudt/applicableUnit';
const QUDT_QKIND = 'http://qudt.org/schema/qudt/quantityKind';
const CIM_NS = 'http://iec.ch/TC57/CIM100#';
const CIMBOLOGY_NS = 'https://cimbology.com/ontology/kg#';
const XSD_NS = 'http://www.w3.org/2001/XMLSchema#';

// 0. Copy local mermaid bundle for zero-CDN offline rendering
const mermaidSrc = path.join(explorerDir, 'node_modules/mermaid/dist/mermaid.min.js');
const mermaidDest = path.join(explorerDir, 'public/vendor/mermaid.min.js');
if (!fs.existsSync(mermaidSrc)) {
  throw new Error(`Expected mermaid bundle not found at ${mermaidSrc}. Run npm ci first.`);
}
fs.mkdirSync(path.dirname(mermaidDest), { recursive: true });
fs.copyFileSync(mermaidSrc, mermaidDest);

// 1. Load CIM model JSON
const model = JSON.parse(fs.readFileSync(path.join(ontologyDir, 'cim-model.json'), 'utf8'));
const typesByName = new Map(model.types.map((t) => [t.name, t]));

// 2. Parse cimbology-kg.ttl via n3
const kgTtl = fs.readFileSync(path.join(ontologyDir, 'cimbology-kg.ttl'), 'utf8');
const kgQuads = new Parser().parse(kgTtl);

// Helper functions
function writeDoc(relPath, content) {
  const fullPath = path.join(docsDir, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
}

function yamlStr(s) {
  return JSON.stringify(String(s ?? ''));
}

function escHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escMdCell(s) {
  return escHtml(s).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').trim();
}

function truncate(s, max = 150) {
  const clean = String(s ?? '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).trimEnd() + '…';
}

function pkgHref(pkgId) {
  return `/cim/${pkgId.toLowerCase().replace(/\./g, '/')}/`;
}

function cimTypeHref(typeName) {
  const t = typesByName.get(typeName);
  if (!t) return null;
  return `/cim/${t.package.toLowerCase().replace(/\./g, '/')}/${t.name.toLowerCase()}/`;
}

function kgClassHref(localName) {
  return `/cim/cimbology-kg/classes/${localName.toLowerCase()}/`;
}

function localName(uri) {
  const idx = Math.max(uri.lastIndexOf('#'), uri.lastIndexOf('/'));
  return idx >= 0 ? uri.slice(idx + 1) : uri;
}

function shortTerm(uri) {
  if (uri.startsWith(CIM_NS)) return `cim:${uri.slice(CIM_NS.length)}`;
  if (uri.startsWith(CIMBOLOGY_NS)) return `cimbology:${uri.slice(CIMBOLOGY_NS.length)}`;
  if (uri.startsWith(XSD_NS)) return `xsd:${uri.slice(XSD_NS.length)}`;
  if (uri.startsWith('http://qudt.org/vocab/unit/')) return `unit:${localName(uri)}`;
  if (uri.startsWith('http://qudt.org/vocab/quantitykind/')) return `qkind:${localName(uri)}`;
  return localName(uri);
}

function linkForUri(uri, kgClassSet) {
  if (uri.startsWith(CIM_NS)) {
    const name = uri.slice(CIM_NS.length);
    const href = cimTypeHref(name);
    return href ? `[\`cim:${name}\`](${href})` : `\`cim:${name}\``;
  }
  if (uri.startsWith(CIMBOLOGY_NS)) {
    const name = uri.slice(CIMBOLOGY_NS.length);
    return kgClassSet.has(name) ? `[\`cimbology:${name}\`](${kgClassHref(name)})` : `\`cimbology:${name}\``;
  }
  return `\`${shortTerm(uri)}\``;
}

function tierBadge(tier) {
  return tier === 'Informative'
    ? '<span class="cim-badge cim-badge-informative">Informative (Inf-package)</span>'
    : '<span class="cim-badge cim-badge-normative">Normative</span>';
}

function kindLabel(kind) {
  switch (kind) {
    case 'class': return 'OWL Class';
    case 'enum': return 'Enumeration';
    case 'primitiveDatatype': return 'CIM Primitive Datatype';
    case 'quantityDatatype': return 'CIM Quantity Datatype';
    default: return kind;
  }
}

function mermaidId(name) {
  return name.replace(/[^A-Za-z0-9_]/g, '_');
}

function buildCimMermaid(type) {
  const lines = ['classDiagram'];
  const edges = new Set();
  const addEdge = (line) => {
    if (!edges.has(line)) {
      edges.add(line);
      lines.push(`  ${line}`);
    }
  };

  // Ancestor chain (use --|> to avoid '<' inside raw HTML <pre class="mermaid">)
  const chain = [...type.ancestors, type.name];
  for (let i = 1; i < chain.length; i++) {
    addEdge(`${mermaidId(chain[i])} --|> ${mermaidId(chain[i - 1])}`);
  }

  // Direct subclasses (cap at 15)
  const MAX_SUB = 15;
  const shownSubs = type.directSubclasses.slice(0, MAX_SUB);
  for (const sub of shownSubs) {
    addEdge(`${mermaidId(sub)} --|> ${mermaidId(type.name)}`);
  }

  // Direct object associations (cap at 15)
  const MAX_ASSOC = 15;
  const objFields = type.fields.filter((f) => !f.isDatatypeProperty && f.rangeCimType);
  for (const f of objFields.slice(0, MAX_ASSOC)) {
    addEdge(`${mermaidId(type.name)} --> ${mermaidId(f.rangeCimType)} : ${f.name}`);
  }

  if (edges.size === 0) {
    lines.push(`  class ${mermaidId(type.name)}`);
  }

  const notes = [];
  if (type.directSubclasses.length > MAX_SUB) {
    notes.push(`Showing ${MAX_SUB} of ${type.directSubclasses.length} direct subclasses in diagram; see full list below.`);
  }
  if (objFields.length > MAX_ASSOC) {
    notes.push(`Showing ${MAX_ASSOC} of ${objFields.length} direct associations in diagram; see full property table below.`);
  }

  return { diagram: lines.join('\n'), note: notes.join(' ') };
}

// 3. Extract structured CIMBOLOGY-KG data from n3 quads
const kgBySubject = new Map();
for (const q of kgQuads) {
  if (q.subject.termType !== 'NamedNode') continue;
  const s = q.subject.value;
  if (!kgBySubject.has(s)) kgBySubject.set(s, []);
  kgBySubject.get(s).push(q);
}

function getObjs(subj, pred) {
  return (kgBySubject.get(subj) ?? []).filter((q) => q.predicate.value === pred).map((q) => q.object);
}

function getFirstLit(subj, pred) {
  const obj = getObjs(subj, pred).find((o) => o.termType === 'Literal');
  return obj ? obj.value : '';
}

const kgClasses = [];
const kgObjectProps = [];
const kgDatatypeProps = [];
const kgAnnotationProps = [];
const kgRdfProps = [];
const kgRelationKinds = [];
const kgClearanceKinds = [];

for (const [uri, quads] of kgBySubject.entries()) {
  if (!uri.startsWith(CIMBOLOGY_NS)) continue;
  const name = uri.slice(CIMBOLOGY_NS.length);
  const rdfTypes = new Set(quads.filter((q) => q.predicate.value === RDF_TYPE).map((q) => q.object.value));
  const label = getFirstLit(uri, RDFS_LABEL) || name;
  const comment = getFirstLit(uri, RDFS_COMMENT);

  if (rdfTypes.has(OWL_CLASS) || rdfTypes.has(RDFS_CLASS)) {
    const parents = getObjs(uri, RDFS_SUBCLASS_OF)
      .filter((o) => o.termType === 'NamedNode' && o.value !== uri)
      .map((o) => o.value);
    const seeAlso = getObjs(uri, RDFS_SEE_ALSO)
      .filter((o) => o.termType === 'NamedNode')
      .map((o) => o.value);
    const equipmentDomain = getFirstLit(uri, `${CIMBOLOGY_NS}equipmentDomain`);
    kgClasses.push({
      name,
      uri,
      label,
      comment,
      classKind: rdfTypes.has(OWL_CLASS) ? 'owl:Class' : 'rdfs:Class',
      parents,
      seeAlso,
      equipmentDomain,
    });
  } else if (rdfTypes.has(OWL_OBJECT_PROP)) {
    kgObjectProps.push({
      name,
      uri,
      label,
      comment,
      domains: getObjs(uri, RDFS_DOMAIN).filter((o) => o.termType === 'NamedNode').map((o) => o.value),
      ranges: getObjs(uri, RDFS_RANGE).filter((o) => o.termType === 'NamedNode').map((o) => o.value),
      seeAlso: getObjs(uri, RDFS_SEE_ALSO).filter((o) => o.termType === 'NamedNode').map((o) => o.value),
    });
  } else if (rdfTypes.has(OWL_DATATYPE_PROP)) {
    kgDatatypeProps.push({
      name,
      uri,
      label,
      comment,
      domains: getObjs(uri, RDFS_DOMAIN).filter((o) => o.termType === 'NamedNode').map((o) => o.value),
      ranges: getObjs(uri, RDFS_RANGE).filter((o) => o.termType === 'NamedNode').map((o) => o.value),
      unit: getObjs(uri, QUDT_UNIT).find((o) => o.termType === 'NamedNode')?.value ?? '',
      quantityKind: getObjs(uri, QUDT_QKIND).find((o) => o.termType === 'NamedNode')?.value ?? '',
      firstClass: getFirstLit(uri, `${CIMBOLOGY_NS}firstClassProperty`) === 'true',
    });
  } else if (rdfTypes.has(OWL_ANNOTATION_PROP)) {
    kgAnnotationProps.push({
      name,
      uri,
      label,
      comment,
      propKind: 'owl:AnnotationProperty',
      ranges: getObjs(uri, RDFS_RANGE).filter((o) => o.termType === 'NamedNode').map((o) => o.value),
    });
  } else if (rdfTypes.has(RDF_PROPERTY)) {
    kgRdfProps.push({
      name,
      uri,
      label,
      comment,
      propKind: 'rdf:Property (Lens)',
      ranges: getObjs(uri, RDFS_RANGE).filter((o) => o.termType === 'NamedNode').map((o) => o.value),
    });
  } else if (rdfTypes.has(`${CIMBOLOGY_NS}RelationKind`)) {
    kgRelationKinds.push({ name, uri, label, comment });
  } else if (rdfTypes.has(`${CIMBOLOGY_NS}ClearanceKind`)) {
    kgClearanceKinds.push({ name, uri, label, comment });
  }
}

kgClasses.sort((a, b) => a.name.localeCompare(b.name));
kgObjectProps.sort((a, b) => a.name.localeCompare(b.name));
kgDatatypeProps.sort((a, b) => a.name.localeCompare(b.name));
kgAnnotationProps.sort((a, b) => a.name.localeCompare(b.name));
kgRdfProps.sort((a, b) => a.name.localeCompare(b.name));
kgRelationKinds.sort((a, b) => a.name.localeCompare(b.name));
kgClearanceKinds.sort((a, b) => a.name.localeCompare(b.name));

const kgClassSet = new Set(kgClasses.map((c) => c.name));
const kgClassByUri = new Map(kgClasses.map((c) => [c.uri, c]));
const kgSubclasses = new Map();
for (const c of kgClasses) {
  for (const p of c.parents) {
    if (!kgSubclasses.has(p)) kgSubclasses.set(p, []);
    kgSubclasses.get(p).push(c.name);
  }
}

function getKgAncestorsCycleSafe(startUri) {
  const result = [];
  const visited = new Set([startUri]);
  const queue = [...(kgClassByUri.get(startUri)?.parents ?? [])];
  while (queue.length > 0) {
    const cur = queue.shift();
    if (visited.has(cur)) continue;
    visited.add(cur);
    result.push(cur);
    if (kgClassByUri.has(cur)) {
      for (const p of kgClassByUri.get(cur).parents) {
        if (!visited.has(p)) queue.push(p);
      }
    } else if (cur.startsWith(CIM_NS)) {
      const cimT = typesByName.get(cur.slice(CIM_NS.length));
      if (cimT) {
        for (const anc of [...cimT.ancestors].reverse()) {
          const ancUri = `${CIM_NS}${anc}`;
          if (!visited.has(ancUri)) {
            visited.add(ancUri);
            result.push(ancUri);
          }
        }
      }
    }
  }
  return result;
}

// 4. Clean & generate src/content/docs
fs.rmSync(docsDir, { recursive: true, force: true });
fs.mkdirSync(docsDir, { recursive: true });

// 4a. Landing page
const counts = model.metadata.counts;
const landingMd = `---
title: "CIM100 & CIMBOLOGY-KG Ontology Explorer"
description: "Browse IEC 61970, IEC 61968 (CIM100), and CIMBOLOGY-KG OWL 2 ontologies hosted on cimbology.com."
---

Explore the complete **IEC TC57 Common Information Model (CIM100)** — generated directly from [\`dotTC57\`](https://github.com/s-o-w/dotTC57) — alongside the **CIMBOLOGY-KG** extension ontology hosted on **cimbology.com**.

Use the search bar (top right) to jump to any class, property, enumeration, or package across **${counts.totalTypes + kgClasses.length} types**.

## Hosted Ontology Downloads

All four modular OWL 2 / RDF-compatible ontologies are published as static files in **Turtle** (\`.ttl\`), **RDF/XML** (\`.owl\`), and **JSON-LD 1.1** (\`.jsonld\`):

| Ontology Module | Scope | Imports | Downloads |
|---|---|---|---|
| **IEC 61970** | ${counts.iec61970Total} types (${counts.iec61970ClassesAndDatatypes} classes/datatypes, ${counts.iec61970Enums} enums) | Standalone | [\`iec61970.ttl\`](/ontology/iec61970.ttl) · [\`iec61970.owl\`](/ontology/iec61970.owl) · [\`iec61970.jsonld\`](/ontology/iec61970.jsonld) |
| **IEC 61968** | ${counts.iec61968Total} types (${counts.iec61968Classes} classes, ${counts.iec61968Enums} enums) | \`iec61970.ttl\` | [\`iec61968.ttl\`](/ontology/iec61968.ttl) · [\`iec61968.owl\`](/ontology/iec61968.owl) · [\`iec61968.jsonld\`](/ontology/iec61968.jsonld) |
| **CIM100 Umbrella** | Full IEC 61970 + IEC 61968 (${counts.totalTypes} types, ${counts.totalPackages} packages) | \`iec61970.ttl\`, \`iec61968.ttl\` | [\`cim100.ttl\`](/ontology/cim100.ttl) · [\`cim100.owl\`](/ontology/cim100.owl) · [\`cim100.jsonld\`](/ontology/cim100.jsonld) |
| **CIMBOLOGY-KG** | ${kgClasses.length} extension classes, ${kgObjectProps.length + kgDatatypeProps.length + kgAnnotationProps.length + kgRdfProps.length} properties, ${kgRelationKinds.length + kgClearanceKinds.length} kinds | \`cim100.ttl\` | [\`cimbology-kg.ttl\`](/ontology/cimbology-kg.ttl) · [\`cimbology-kg.owl\`](/ontology/cimbology-kg.owl) · [\`cimbology-kg.jsonld\`](/ontology/cimbology-kg.jsonld) |

Additional machine-readable artifacts: [\`cim-model.json\`](/ontology/cim-model.json) · [Attribution & License Notice](/ontology/NOTICE.md)

## Namespaces

| Prefix | Namespace IRI | Purpose |
|---|---|---|
| \`cim:\` | \`http://iec.ch/TC57/CIM100#\` | Canonical IEC 61970 / IEC 61968 classes, datatypes, properties, and enumerations |
| \`cimbology:\` | \`https://cimbology.com/ontology/kg#\` | CIMBOLOGY-KG semantic extensions layered over IEC CIM (physical structures, 3D geometry, generic relations, P&C, distribution) |
| \`cimdoc:\` | \`https://cimbology.com/ontology/cimdoc#\` | OWL annotation metadata (CIM package path, Normative/Informative tier, fixed unit symbols/multipliers, enum codes) |

## Normative vs. Informative (\`Inf\`) CIM Packages

- <span class="cim-badge cim-badge-normative">Normative</span> **${counts.normativeTypes} types** — mandatory core packages (\`IEC61970.Base.*\`, \`IEC61968.Common\`, \`IEC61968.AssetInfo\`, etc.).
- <span class="cim-badge cim-badge-informative">Informative (Inf-package)</span> **${counts.informativeTypes} types** — official, approved, ratified IEC CIM packages (\`InfWork\`, \`InfAssetInfo\`, \`InfSIPS\`, etc.) that are optional for compliant implementations and experience more version/vendor drift than the normative core.

## Browse by Standard

- [**IEC 61970 (Transmission / EMS)**](/cim/iec61970/) — Core topology, wires, measurements, protection, dynamics, domain datatypes
- [**IEC 61968 (Distribution / Assets)**](/cim/iec61968/) — Assets, asset info, customers, metering, operations, work management
- [**CIMBOLOGY-KG Extensions**](/cim/cimbology-kg/) — Physical structures, geometry, generic relations, P&C, and distribution extensions
`;
writeDoc('index.md', landingMd);

// 4b. Standard overview pages (IEC61970 & IEC61968 — includes root-package version types)
for (const std of ['IEC61970', 'IEC61968']) {
  const stdPkgs = model.packages.filter((p) => p.standard === std).sort((a, b) => a.id.localeCompare(b.id));
  const subPkgs = stdPkgs.filter((p) => p.id !== std);
  const rootPkg = stdPkgs.find((p) => p.id === std);
  const stdTypes = model.types.filter((t) => t.standard === std);
  const title = std === 'IEC61970' ? 'IEC 61970 — Transmission & EMS' : 'IEC 61968 — Distribution & Enterprise Assets';

  const rootTypesSection = rootPkg
    ? `\n## Root Package Types (\`${rootPkg.id}\`)\n\n| Type | Kind | Description |\n|---|---|---|\n${rootPkg.types
        .map((n) => typesByName.get(n))
        .filter(Boolean)
        .map((t) => `| [\`${t.name}\`](${cimTypeHref(t.name)}) | ${kindLabel(t.kind)} | ${escMdCell(truncate(t.summary, 140))} |`)
        .join('\n')}\n`
    : '';

  const rows = subPkgs
    .map((p) => `| [\`${p.id}\`](${pkgHref(p.id)}) | ${tierBadge(p.tier)} | ${p.typeCount} |`)
    .join('\n');

  const md = `---
title: ${yamlStr(title)}
description: ${yamlStr(`Browse all ${stdPkgs.length} packages and ${stdTypes.length} types in ${std}.`)}
---

- **Total types:** ${stdTypes.length} (${stdTypes.filter((t) => t.kind !== 'enum').length} classes/datatypes, ${stdTypes.filter((t) => t.kind === 'enum').length} enums)
- **Packages:** ${stdPkgs.length} (${stdPkgs.filter((p) => p.tier === 'Normative').length} Normative, ${stdPkgs.filter((p) => p.tier === 'Informative').length} Informative)
- **Downloads:** [\`${std.toLowerCase()}.ttl\`](/ontology/${std.toLowerCase()}.ttl) · [\`${std.toLowerCase()}.owl\`](/ontology/${std.toLowerCase()}.owl) · [\`${std.toLowerCase()}.jsonld\`](/ontology/${std.toLowerCase()}.jsonld)
${rootTypesSection}
## Packages (${subPkgs.length})

| Package | Tier | Types |
|---|---|---|
${rows}
`;
  writeDoc(`${std.toLowerCase()}/index.md`, md);
}

// 4c. Sub-package index pages (root IEC61970 / IEC61968 packages are rendered on Standard Overview pages above)
for (const pkg of model.packages) {
  if (pkg.id === 'IEC61970' || pkg.id === 'IEC61968') continue;
  const pkgTypes = pkg.types.map((n) => typesByName.get(n)).filter(Boolean);
  const rows = pkgTypes
    .map(
      (t) =>
        `| [\`${t.name}\`](${cimTypeHref(t.name)}) | ${kindLabel(t.kind)} | ${escMdCell(truncate(t.summary, 140))} |`
    )
    .join('\n');

  const infNote =
    pkg.tier === 'Informative'
      ? `\n> **Informative CIM Package:** \`${pkg.id}\` is an approved, ratified part of IEC CIM, but Informative rather than Normative — optional for compliant implementations and subject to more version/vendor drift than the normative core.\n`
      : '';

  const md = `---
title: ${yamlStr(pkg.id)}
description: ${yamlStr(`${pkg.id} (${pkg.tier}) — ${pkg.typeCount} CIM types in ${pkg.standard}.`)}
---

<div class="cim-meta-bar">
  ${tierBadge(pkg.tier)}
  <span class="cim-badge cim-badge-kind">${pkg.standard}</span>
  <span class="cim-badge cim-badge-kind">${pkg.typeCount} types</span>
</div>
${infNote}
[← Back to ${pkg.standard}](/cim/${pkg.standard.toLowerCase()}/)

## Types in \`${pkg.id}\`

| Type | Kind | Description |
|---|---|---|
${rows}
`;
  writeDoc(`${pkg.id.toLowerCase().replace(/\./g, '/')}/index.md`, md);
}

// 4d. All 1,414 CIM type pages
for (const t of model.types) {
  const relPath = `${t.package.toLowerCase().replace(/\./g, '/')}/${t.name.toLowerCase()}.md`;
  const parts = [];

  parts.push(`---
title: ${yamlStr(t.name)}
description: ${yamlStr(truncate(t.summary || `${t.name} (${t.package})`, 160))}
sidebar:
  hidden: true
---`);

  parts.push(`<div class="cim-meta-bar">
  ${tierBadge(t.tier)}
  <span class="cim-badge cim-badge-kind">${kindLabel(t.kind)}</span>
  <span class="cim-badge cim-badge-kind">${t.standard}</span>
</div>

**Package:** [\`${t.package}\`](${pkgHref(t.package)})

<div class="cim-iri-box"><strong>Canonical IRI:</strong> ${t.iri}</div>`);

  if (t.tier === 'Informative') {
    parts.push(
      `> **Informative Package Note:** \`cim:${t.name}\` belongs to \`${t.package}\` — approved, ratified IEC CIM, but Informative rather than Normative (optional for compliant implementations and subject to more version/vendor drift).`
    );
  }

  if (t.summary) {
    parts.push(`## Description\n\n${escHtml(t.summary)}`);
  }

  if (t.kind === 'class') {
    // Inheritance hierarchy
    const chainLinks = [
      ...t.ancestors.map((a) => `[\`${a}\`](${cimTypeHref(a)})`),
      `**\`${t.name}\`**`,
    ];
    let inhSection = `## Inheritance\n\n- **Hierarchy:** ${chainLinks.join(' → ')}`;
    if (t.directSubclasses.length > 0) {
      const subLinks = t.directSubclasses.map((s) => `[\`${s}\`](${cimTypeHref(s)})`).join(', ');
      inhSection += `\n- **Direct Subclasses (${t.directSubclasses.length}):** ${subLinks}`;
    } else {
      inhSection += `\n- **Direct Subclasses:** None (leaf class)`;
    }
    parts.push(inhSection);

    // Mermaid diagram
    const { diagram, note } = buildCimMermaid(t);
    parts.push(
      `## Class Diagram\n\n<pre class="mermaid">\n${diagram}\n</pre>${note ? `\n\n*${note}*` : ''}`
    );

    // Direct properties
    if (t.fields.length > 0) {
      const rows = t.fields
        .map((f) => {
          const propKind = f.isDatatypeProperty ? 'Datatype' : 'Object';
          const rangeLink = f.rangeCimType && cimTypeHref(f.rangeCimType)
            ? `[\`${f.rangeLabel}\`](${cimTypeHref(f.rangeCimType)})`
            : `\`${f.rangeLabel}\``;
          return `| \`${f.name}\` | \`cim:${f.declaringClass}.${f.name}\` | ${rangeLink} (${propKind}) | ${escMdCell(f.summary)} |`;
        })
        .join('\n');
      parts.push(
        `## Direct Properties (${t.fields.length})\n\n| Name | Canonical Property IRI | Range | Description |\n|---|---|---|---|\n${rows}`
      );
    } else {
      parts.push(`## Direct Properties\n\n*No direct properties declared on \`cim:${t.name}\`.*`);
    }

    // Inherited properties grouped by declaring ancestor (nearest first)
    const inheritedGroups = [];
    for (const ancName of [...t.ancestors].reverse()) {
      const anc = typesByName.get(ancName);
      if (!anc || anc.fields.length === 0) continue;
      const rows = anc.fields
        .map((f) => {
          const rangeLink = f.rangeCimType && cimTypeHref(f.rangeCimType)
            ? `[\`${f.rangeLabel}\`](${cimTypeHref(f.rangeCimType)})`
            : `\`${f.rangeLabel}\``;
          return `| \`${f.name}\` | \`cim:${f.declaringClass}.${f.name}\` | ${rangeLink} | ${escMdCell(truncate(f.summary, 140))} |`;
        })
        .join('\n');
      inheritedGroups.push(
        `### Inherited from [\`${anc.name}\`](${cimTypeHref(anc.name)}) (${anc.fields.length})\n\n| Name | Canonical Property IRI | Range | Description |\n|---|---|---|---|\n${rows}`
      );
    }
    if (inheritedGroups.length > 0) {
      parts.push(`## Inherited Properties\n\n${inheritedGroups.join('\n\n')}`);
    }

    // Semantic snippets
    const baseSub = t.baseType ? ` ;\n    rdfs:subClassOf cim:${t.baseType}` : '';
    const isIdentified = t.name === 'IdentifiedObject' || t.ancestors.includes('IdentifiedObject');
    const jsonLdLines = isIdentified
      ? `{\n  "@id": "urn:uuid:00000000-0000-0000-0000-000000000000",\n  "@type": "${t.iri}",\n  "cim:IdentifiedObject.name": "Example ${t.name}"\n}`
      : `{\n  "@id": "urn:uuid:00000000-0000-0000-0000-000000000000",\n  "@type": "${t.iri}"\n}`;
    parts.push(`## Semantic Web Snippets

\`\`\`turtle
@prefix cim: <http://iec.ch/TC57/CIM100#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

cim:${t.name} a owl:Class${baseSub} .
\`\`\`

\`\`\`json
${jsonLdLines}
\`\`\``);
  } else if (t.kind === 'enum') {
    const vals = t.enumValues ?? [];
    if (vals.length > 0) {
      const rows = vals
        .map(
          (v) =>
            `| \`${v.name}\` | \`cim:${t.name}.${v.name}\` | \`${v.code}\` | ${escMdCell(v.summary)} |`
        )
        .join('\n');
      parts.push(
        `## Enumeration Values (${vals.length})\n\n| Literal | Qualified IRI | Code | Description |\n|---|---|---|---|\n${rows}`
      );
    } else {
      parts.push(`## Enumeration Values\n\n*No enumeration literals defined in \`dotTC57\` for \`cim:${t.name}\`.*`);
    }
  } else {
    // PrimitiveDatatype or QuantityDatatype
    const unitLink = t.unitSymbol
      ? `[\`cim:UnitSymbol.${t.unitSymbol}\`](${cimTypeHref('UnitSymbol')})`
      : '*None (variable or dimensionless)*';
    const multLink = t.unitMultiplier
      ? `[\`cim:UnitMultiplier.${t.unitMultiplier}\`](${cimTypeHref('UnitMultiplier')})`
      : '*None (variable)*';

    parts.push(`## Datatype Specification

| Facet | Value |
|---|---|
| **RDF Type** | \`rdfs:Datatype\` |
| **Equivalent XSD Type** | \`${t.equivalentXsd}\` |
| **Fixed Unit Symbol** | ${unitLink} |
| **Fixed Unit Multiplier** | ${multLink} |

\`\`\`turtle
@prefix cim: <http://iec.ch/TC57/CIM100#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

cim:${t.name} a rdfs:Datatype ;
    owl:equivalentClass ${t.equivalentXsd} .
\`\`\``);
  }

  writeDoc(relPath, parts.join('\n\n') + '\n');
}

// 4e. CIMBOLOGY-KG Extension pages
const domainScopedDt = kgDatatypeProps.filter((p) => p.domains.length > 0);
const generalDt = kgDatatypeProps.filter((p) => p.domains.length === 0);

writeDoc(
  'cimbology-kg/index.md',
  `---
title: "CIMBOLOGY-KG Extension Ontology"
description: "CIM-grounded semantic extensions for physical structures, 3D geometry, generic relations, P&C, and distribution."
---

<div class="cim-meta-bar">
  <span class="cim-badge cim-badge-ext">CIMBOLOGY-KG Extension</span>
  <span class="cim-badge cim-badge-kind">owl:imports cim100.ttl</span>
</div>

<div class="cim-iri-box"><strong>Namespace:</strong> https://cimbology.com/ontology/kg# (prefix <code>cimbology:</code>)</div>

CIMBOLOGY-KG never forks or redefines IEC CIM classes. It imports [CIM100](/cim/) and adds only what IEC CIM omits by design: physical structures, 3D placement/linear geometry, generic typed relations, secondary P&C concepts, and distribution design/analysis entities.

- **Downloads:** [\`cimbology-kg.ttl\`](/ontology/cimbology-kg.ttl) · [\`cimbology-kg.owl\`](/ontology/cimbology-kg.owl) · [\`cimbology-kg.jsonld\`](/ontology/cimbology-kg.jsonld)

## Contents

| Section | Count | Link |
|---|---|---|
| **Classes** (\`owl:Class\` ∪ \`rdfs:Class\`) | ${kgClasses.length} | [Browse all ${kgClasses.length} classes](/cim/cimbology-kg/classes/) |
| **Relation & Clearance Kinds** | ${kgRelationKinds.length + kgClearanceKinds.length} | [Browse kinds](/cim/cimbology-kg/kinds/) |
| **Object Properties** | ${kgObjectProps.length} | [Browse object properties](/cim/cimbology-kg/properties/object/) |
| **Annotation & Lens Predicates** | ${kgAnnotationProps.length + kgRdfProps.length} | [Browse annotations & lens predicates](/cim/cimbology-kg/properties/annotations/) |
| **Domain-Scoped Datatype Properties** | ${domainScopedDt.length} | [Browse domain-scoped properties](/cim/cimbology-kg/properties/domain-datatype/) |
| **General Datatype Properties** | ${generalDt.length} | [Browse general properties](/cim/cimbology-kg/properties/general-datatype/) |
`
);

// Classes index
const kgClassRows = kgClasses
  .map((c) => {
    const parentStr = c.parents.length > 0 ? c.parents.map((p) => linkForUri(p, kgClassSet)).join(', ') : '—';
    const domainTag = c.equipmentDomain ? `\`${c.equipmentDomain}\`` : '—';
    return `| [\`cimbology:${c.name}\`](${kgClassHref(c.name)}) | ${parentStr} | ${domainTag} | ${escMdCell(truncate(c.comment, 130))} |`;
  })
  .join('\n');

writeDoc(
  'cimbology-kg/classes/index.md',
  `---
title: "CIMBOLOGY-KG Classes"
description: "All ${kgClasses.length} extension classes defined in the CIMBOLOGY-KG ontology."
---

| Class | Superclass(es) | Equipment Domain | Description |
|---|---|---|---|
${kgClassRows}
`
);

// Individual CIMBOLOGY-KG class pages (41)
function kgMermaidNode(uri) {
  if (uri.startsWith(CIMBOLOGY_NS)) {
    const n = uri.slice(CIMBOLOGY_NS.length);
    return { id: `cimbology_${mermaidId(n)}`, label: `cimbology:${n}` };
  }
  if (uri.startsWith(CIM_NS)) {
    const n = uri.slice(CIM_NS.length);
    return { id: `cim_${mermaidId(n)}`, label: `cim:${n}` };
  }
  const n = localName(uri);
  return { id: mermaidId(n), label: shortTerm(uri) };
}

for (const c of kgClasses) {
  const ancestors = [...getKgAncestorsCycleSafe(c.uri)].reverse();
  const directSubs = (kgSubclasses.get(c.uri) ?? []).sort();
  const classObjProps = kgObjectProps.filter((p) => p.domains.includes(c.uri));
  const classDtProps = domainScopedDt.filter((p) => p.domains.includes(c.uri));

  const mLines = ['classDiagram'];
  const mNodes = new Map();
  const mEdges = new Set();
  const ensureNode = (uri) => {
    const info = kgMermaidNode(uri);
    if (!mNodes.has(info.id)) {
      mNodes.set(info.id, info.label);
      mLines.push(`  class ${info.id}["${info.label}"]`);
    }
    return info.id;
  };
  const addMEdge = (l) => {
    if (!mEdges.has(l)) {
      mEdges.add(l);
      mLines.push(`  ${l}`);
    }
  };
  const selfId = ensureNode(c.uri);
  for (const p of c.parents) {
    const parentId = ensureNode(p);
    addMEdge(`${selfId} --|> ${parentId}`);
  }
  for (const sub of directSubs.slice(0, 15)) {
    const subId = ensureNode(`${CIMBOLOGY_NS}${sub}`);
    addMEdge(`${subId} --|> ${selfId}`);
  }
  for (const op of classObjProps.slice(0, 15)) {
    for (const r of op.ranges) {
      const rangeId = ensureNode(r);
      addMEdge(`${selfId} --> ${rangeId} : ${op.name}`);
    }
  }

  const sections = [];
  sections.push(`---
title: ${yamlStr(`cimbology:${c.name}`)}
description: ${yamlStr(truncate(c.comment || c.label, 160))}
sidebar:
  hidden: true
---`);

  sections.push(`<div class="cim-meta-bar">
  <span class="cim-badge cim-badge-ext">CIMBOLOGY-KG</span>
  <span class="cim-badge cim-badge-kind">${c.classKind}</span>
  ${c.equipmentDomain ? `<span class="cim-badge cim-badge-kind">domain: ${escHtml(c.equipmentDomain)}</span>` : ''}
</div>

<div class="cim-iri-box"><strong>Canonical IRI:</strong> ${c.uri}</div>

[← All CIMBOLOGY-KG Classes](/cim/cimbology-kg/classes/)`);

  if (c.comment) {
    sections.push(`## Description\n\n${escHtml(c.comment)}`);
  }

  let relLines = [];
  relLines.push(`- **Direct Superclass(es):** ${c.parents.length > 0 ? c.parents.map((p) => linkForUri(p, kgClassSet)).join(', ') : 'None'}`);
  if (ancestors.length > 0) {
    relLines.push(`- **Hierarchy:** ${[...ancestors.map((a) => linkForUri(a, kgClassSet)), `**\`cimbology:${c.name}\`**`].join(' → ')}`);
  }
  relLines.push(`- **Direct Subclasses:** ${directSubs.length > 0 ? directSubs.map((s) => `[\`cimbology:${s}\`](${kgClassHref(s)})`).join(', ') : 'None'}`);
  if (c.seeAlso.length > 0) {
    relLines.push(`- **Related CIM Concepts (\`rdfs:seeAlso\`):** ${c.seeAlso.map((u) => linkForUri(u, kgClassSet)).join(', ')}`);
  }
  sections.push(`## Hierarchy & References\n\n${relLines.join('\n')}`);
  sections.push(`## Class Diagram\n\n<pre class="mermaid">\n${mLines.join('\n')}\n</pre>`);

  const allClassProps = [...classObjProps.map((p) => ({ ...p, kind: 'Object' })), ...classDtProps.map((p) => ({ ...p, kind: 'Datatype' }))];
  if (allClassProps.length > 0) {
    const rows = allClassProps
      .map((p) => {
        const rangeStr = p.ranges.length > 0 ? p.ranges.map((r) => linkForUri(r, kgClassSet)).join(', ') : '—';
        const unitStr = p.unit ? ` (\`${shortTerm(p.unit)}\`)` : '';
        return `| \`cimbology:${p.name}\` | ${p.kind} | ${rangeStr}${unitStr} | ${escMdCell(p.comment)} |`;
      })
      .join('\n');
    sections.push(
      `## Domain-Scoped Properties (${allClassProps.length})\n\n| Property | Kind | Range / Unit | Description |\n|---|---|---|---|\n${rows}`
    );
  }

  sections.push(`## Semantic Web Snippet

\`\`\`json
{
  "@id": "urn:uuid:00000000-0000-0000-0000-000000000000",
  "@type": "${c.uri}",
  "cimbology:name": "Example ${c.label}"
}
\`\`\``);

  writeDoc(`cimbology-kg/classes/${c.name.toLowerCase()}.md`, sections.join('\n\n') + '\n');
}

// Kinds page (RelationKind + ClearanceKind)
const rkRows = kgRelationKinds
  .map((k) => `| \`cimbology:${k.name}\` | ${escMdCell(k.label)} | ${escMdCell(k.comment)} |`)
  .join('\n');
const ckRows = kgClearanceKinds
  .map((k) => `| \`cimbology:${k.name}\` | ${escMdCell(k.label)} | ${escMdCell(k.comment)} |`)
  .join('\n');

writeDoc(
  'cimbology-kg/kinds.md',
  `---
title: "Relation & Clearance Kinds"
description: "Named RelationKind (${kgRelationKinds.length}) and ClearanceKind (${kgClearanceKinds.length}) individuals in CIMBOLOGY-KG."
---

## Relation Kinds (\`cimbology:RelationKind\` — ${kgRelationKinds.length})

Used as \`cimbology:relationKind\` discriminators on [\`cimbology:Relation\`](/cim/cimbology-kg/classes/relation/).

| Individual | Label | Description |
|---|---|---|
${rkRows}

## Clearance Kinds (\`cimbology:ClearanceKind\` — ${kgClearanceKinds.length})

Used as \`cimbology:clearanceKind\` discriminators on [\`cimbology:ClearanceCheck\`](/cim/cimbology-kg/classes/clearancecheck/).

| Individual | Label | Description |
|---|---|---|
${ckRows}
`
);

// Object Properties page
const objRows = kgObjectProps
  .map((p) => {
    const dom = p.domains.length > 0 ? p.domains.map((d) => linkForUri(d, kgClassSet)).join(', ') : '*Open*';
    const rng = p.ranges.length > 0 ? p.ranges.map((r) => linkForUri(r, kgClassSet)).join(', ') : '*Open*';
    return `| \`cimbology:${p.name}\` | ${dom} | ${rng} | ${escMdCell(p.comment)} |`;
  })
  .join('\n');

writeDoc(
  'cimbology-kg/properties/object.md',
  `---
title: "Object Properties"
description: "All ${kgObjectProps.length} owl:ObjectProperty definitions in CIMBOLOGY-KG."
---

| Property | Domain | Range | Description |
|---|---|---|---|
${objRows}
`
);

// Annotation & Lens Predicates page
const annRows = [...kgAnnotationProps, ...kgRdfProps]
  .map((p) => {
    const rng = p.ranges.length > 0 ? p.ranges.map((r) => linkForUri(r, kgClassSet)).join(', ') : '*Open*';
    return `| \`cimbology:${p.name}\` | \`${p.propKind}\` | ${rng} | ${escMdCell(p.comment)} |`;
  })
  .join('\n');

writeDoc(
  'cimbology-kg/properties/annotations.md',
  `---
title: "Annotation & Lens Predicates"
description: "Annotation properties (${kgAnnotationProps.length}) and lens mapping rdf:Property predicates (${kgRdfProps.length}) in CIMBOLOGY-KG."
---

| Predicate | RDF Type | Range | Description |
|---|---|---|---|
${annRows}
`
);

// Domain-Scoped Datatype Properties page (grouped by domain class)
const dtByDomain = new Map();
for (const p of domainScopedDt) {
  for (const d of p.domains) {
    if (!dtByDomain.has(d)) dtByDomain.set(d, []);
    dtByDomain.get(d).push(p);
  }
}
const dtDomainSections = [...dtByDomain.entries()]
  .sort((a, b) => shortTerm(a[0]).localeCompare(shortTerm(b[0])))
  .map(([domUri, props]) => {
    const rows = props
      .map((p) => {
        const rng = p.ranges.length > 0 ? p.ranges.map((r) => `\`${shortTerm(r)}\``).join(', ') : '—';
        const unit = p.unit ? `\`${shortTerm(p.unit)}\`` : '—';
        return `| \`cimbology:${p.name}\` | ${rng} | ${unit} | ${escMdCell(p.comment)} |`;
      })
      .join('\n');
    return `## ${linkForUri(domUri, kgClassSet)} (${props.length})\n\n| Property | Range | Unit | Description |\n|---|---|---|---|\n${rows}`;
  })
  .join('\n\n');

writeDoc(
  'cimbology-kg/properties/domain-datatype.md',
  `---
title: "Domain-Scoped Datatype Properties"
description: "All ${domainScopedDt.length} domain-scoped owl:DatatypeProperty definitions in CIMBOLOGY-KG grouped by domain class."
---

${dtDomainSections}
`
);

// General / Unscoped Datatype Properties page (grouped by firstClassProperty / quantityKind / range)
const generalGroups = new Map();
for (const p of generalDt) {
  let group = 'General String / Metadata';
  if (p.firstClass) {
    group = 'First-Class Structural Properties';
  } else if (p.quantityKind) {
    group = `Physical Quantity — ${localName(p.quantityKind)}`;
  } else if (p.ranges.length > 0) {
    group = `Typed (${shortTerm(p.ranges[0])})`;
  }
  if (!generalGroups.has(group)) generalGroups.set(group, []);
  generalGroups.get(group).push(p);
}

const generalSections = [...generalGroups.entries()]
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([groupName, props]) => {
    const rows = props
      .map((p) => {
        const rng = p.ranges.length > 0 ? p.ranges.map((r) => `\`${shortTerm(r)}\``).join(', ') : '—';
        const unit = p.unit ? `\`${shortTerm(p.unit)}\`` : '—';
        return `| \`cimbology:${p.name}\` | ${rng} | ${unit} | ${escMdCell(p.comment)} |`;
      })
      .join('\n');
    return `## ${groupName} (${props.length})\n\n| Property | Range | Unit | Description |\n|---|---|---|---|\n${rows}`;
  })
  .join('\n\n');

writeDoc(
  'cimbology-kg/properties/general-datatype.md',
  `---
title: "General Datatype Properties"
description: "All ${generalDt.length} unscoped owl:DatatypeProperty definitions in CIMBOLOGY-KG grouped by structural role and quantity kind."
---

These properties carry no fixed \`rdfs:domain\` so they can attach to any applicable IEC CIM or CIMBOLOGY-KG equipment node.

${generalSections}
`
);

console.log(
  `Generated Starlight docs: ${model.types.length} CIM types, ${model.packages.length} CIM packages, ${kgClasses.length} CIMBOLOGY-KG classes + overview/catalog pages.`
);
