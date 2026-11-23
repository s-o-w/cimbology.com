import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const explorerDir = path.resolve(__dirname, '..');
const ontologyDir = path.resolve(explorerDir, '../ontology');
// IMPORTANT: Only clean/write inside src/content/docs/cim/ so hand-authored
// root, blog/, research/, and about pages are never touched.
const docsDir = path.join(explorerDir, 'src/content/docs/cim');

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

function encodeSnippetField(f) {
  if (!f.isDatatypeProperty) {
    const rng = f.rangeCimType ? typesByName.get(f.rangeCimType) : null;
    if (rng && rng.kind === 'enum') {
      const firstVal = rng.enumValues?.[0]?.name;
      return ['e', firstVal ? `${rng.name}.${firstVal}` : rng.name];
    }
    return ['o', f.rangeCimType || f.rangeLabel.replace(/^cim:/, '')];
  }
  if (f.declaringClass === 'IdentifiedObject' && f.name === 'mRID') return ['mrid'];
  if (f.declaringClass === 'IdentifiedObject' && f.name === 'name') return ['name'];

  const rng = f.rangeCimType ? typesByName.get(f.rangeCimType) : null;
  const xsd = rng?.equivalentXsd || f.rangeLabel;
  let note = '';
  if (rng && rng.kind === 'quantityDatatype') {
    const unit = rng.unitSymbol ? `${rng.unitMultiplier && rng.unitMultiplier !== 'none' ? rng.unitMultiplier : ''}${rng.unitSymbol}` : '';
    note = unit ? `cim:${rng.name} (${unit})` : `cim:${rng.name}`;
  } else if (rng && rng.kind === 'primitiveDatatype') {
    note = `cim:${rng.name}`;
  }

  switch (xsd) {
    case 'xsd:boolean': return ['b'];
    case 'xsd:integer': return note ? ['i', note] : ['i'];
    case 'xsd:float':
    case 'xsd:decimal': return note ? ['f', note] : ['f'];
    case 'xsd:dateTime': return ['dt'];
    case 'xsd:date': return ['d'];
    case 'xsd:time': return ['t'];
    case 'xsd:duration': return ['dur'];
    case 'xsd:gMonthDay': return ['md'];
    default: return note ? ['s', note] : ['s'];
  }
}

function buildSnippetLayers(type) {
  const chainNames = [...type.ancestors, type.name];
  const layers = [];
  for (const cname of chainNames) {
    const c = typesByName.get(cname);
    if (!c || c.fields.length === 0) continue;
    layers.push({
      c: c.name,
      f: c.fields.map((f) => [f.name, ...encodeSnippetField(f)]),
    });
  }
  return layers;
}

// 2. Clean & generate src/content/docs/cim
fs.rmSync(docsDir, { recursive: true, force: true });
fs.mkdirSync(docsDir, { recursive: true });

// 2a. Landing page
const counts = model.metadata.counts;
const landingMd = `---
title: "CIM100 Ontology Explorer"
description: "Browse IEC 61970 and IEC 61968 (CIM100) OWL 2 ontologies hosted on cimbology.com."
---

Explore the complete **IEC TC57 Common Information Model (CIM100)**, generated directly from [\`dotTC57\`](https://github.com/s-o-w/dotTC57) and hosted as open OWL 2 ontologies on **cimbology.com**.

Use the search bar (top right) to jump to any class, property, enumeration, or package across **${counts.totalTypes} types** and **${counts.totalPackages} packages**.

## Hosted Ontology Downloads

All three modular IEC CIM100 OWL 2 / RDF-compatible ontologies are published as static files in **Turtle** (\`.ttl\`), **RDF/XML** (\`.owl\`), and **JSON-LD 1.1** (\`.jsonld\`):

| Ontology Module | Scope | Imports | Downloads |
|---|---|---|---|
| **IEC 61970** | ${counts.iec61970Total} types (${counts.iec61970ClassesAndDatatypes} classes/datatypes, ${counts.iec61970Enums} enums) | Standalone | [\`iec61970.ttl\`](/ontology/iec61970.ttl) · [\`iec61970.owl\`](/ontology/iec61970.owl) · [\`iec61970.jsonld\`](/ontology/iec61970.jsonld) |
| **IEC 61968** | ${counts.iec61968Total} types (${counts.iec61968Classes} classes, ${counts.iec61968Enums} enums) | \`iec61970.ttl\` | [\`iec61968.ttl\`](/ontology/iec61968.ttl) · [\`iec61968.owl\`](/ontology/iec61968.owl) · [\`iec61968.jsonld\`](/ontology/iec61968.jsonld) |
| **CIM100 Umbrella** | Full IEC 61970 + IEC 61968 (${counts.totalTypes} types, ${counts.totalPackages} packages) | \`iec61970.ttl\`, \`iec61968.ttl\` | [\`cim100.ttl\`](/ontology/cim100.ttl) · [\`cim100.owl\`](/ontology/cim100.owl) · [\`cim100.jsonld\`](/ontology/cim100.jsonld) |

Additional machine-readable artifacts: [\`cim-model.json\`](/ontology/cim-model.json) · [Attribution & License Notice](/ontology/NOTICE.md)

## Namespaces

| Prefix | Namespace IRI | Purpose |
|---|---|---|
| \`cim:\` | \`http://iec.ch/TC57/CIM100#\` | Canonical IEC 61970 / IEC 61968 classes, datatypes, properties, and enumerations |
| \`cimdoc:\` | \`https://cimbology.com/ontology/cimdoc#\` | OWL annotation metadata (CIM package path, Normative/Informative tier, fixed unit symbols/multipliers, enum codes) |

## Normative vs. Informative (\`Inf\`) CIM Packages

- <span class="cim-badge cim-badge-normative">Normative</span> **${counts.normativeTypes} types** in mandatory core packages (\`IEC61970.Base.*\`, \`IEC61968.Common\`, \`IEC61968.AssetInfo\`, etc.).
- <span class="cim-badge cim-badge-informative">Informative (Inf-package)</span> **${counts.informativeTypes} types** in official, approved, ratified IEC CIM packages (\`InfWork\`, \`InfAssetInfo\`, \`InfSIPS\`, etc.) that are optional for compliant implementations and experience more version/vendor drift than the normative core.

## Browse by Standard

- [**IEC 61970 (Transmission / EMS)**](/cim/iec61970/): Core topology, wires, measurements, protection, dynamics, domain datatypes
- [**IEC 61968 (Distribution / Assets)**](/cim/iec61968/): Assets, asset info, customers, metering, operations, work management
`;
writeDoc('index.md', landingMd);

// 2b. Standard overview pages (IEC61970 & IEC61968 — includes root-package version types)
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

// 2c. Sub-package index pages (root IEC61970 / IEC61968 packages are rendered on Standard Overview pages above)
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
      ? `\n> **Informative CIM Package:** \`${pkg.id}\` is an approved, ratified part of IEC CIM, but Informative rather than Normative (optional for compliant implementations and subject to more version/vendor drift than the normative core).\n`
      : '';

  const md = `---
title: ${yamlStr(pkg.id)}
description: ${yamlStr(`${pkg.id} (${pkg.tier}): ${pkg.typeCount} CIM types in ${pkg.standard}.`)}
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

// 2d. All 1,414 CIM type pages
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
      `> **Informative Package Note:** \`cim:${t.name}\` belongs to \`${t.package}\`, an approved and ratified IEC CIM package that is Informative rather than Normative (optional for compliant implementations and subject to more version/vendor drift).`
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

    // Interactive Semantic Web Snippet Builder (Full Inherited Model + Ancestor Toggles)
    const snippetLayers = buildSnippetLayers(t);
    const safeJson = JSON.stringify(snippetLayers).replace(/</g, '\\u003c');
    const baseSub = t.baseType ? ` ;\n    rdfs:subClassOf cim:${t.baseType}` : '';
    const isIdentified = t.name === 'IdentifiedObject' || t.ancestors.includes('IdentifiedObject');
    const fallbackJsonLd = isIdentified
      ? `{\n  "@context": { "cim": "http://iec.ch/TC57/CIM100#" },\n  "@id": "urn:uuid:00000000-0000-0000-0000-000000000000",\n  "@type": "${t.iri}",\n  "cim:IdentifiedObject.mRID": "00000000-0000-0000-0000-000000000000",\n  "cim:IdentifiedObject.name": "Example ${t.name}"\n}`
      : `{\n  "@context": { "cim": "http://iec.ch/TC57/CIM100#" },\n  "@id": "urn:uuid:00000000-0000-0000-0000-000000000000",\n  "@type": "${t.iri}"\n}`;
    const ancestorNote = t.ancestors.length > 0
      ? `an instance of \`cim:${t.name}\` can carry properties declared on \`${t.name}\` plus any ancestor in its inheritance chain (${t.ancestors.map((a) => `\`${a}\``).join(', ')}).`
      : `an instance of \`cim:${t.name}\` carries the properties declared on \`${t.name}\`.`;

    parts.push(`## Semantic Web Snippets

> **Open-World Inheritance & Flat Graph Note:** Under IEC CIM (RDF/OWL), ${ancestorNote} By default, the builder below expands the **full inherited model** so you can inspect everything available on this class. Showing every property is intentional for documentation and not required on the wire; sparse payloads carrying only profile-required fields are equally valid.
>
> **Object References vs. Flat Literals:** Not all CIM properties are flat scalar values. Object associations reference separate typed CIM entities (such as \`cim:PSRType\` or \`cim:Terminal\`). In **JSON-LD 1.1**, those referenced objects are lifted out of the main object into a flat \`@graph\` array and linked strictly by \`@id\` pointer so the graph stays flat instead of deeply nested. **Turtle** and **RDF/XML** serialize the exact same graph, making it easy to compare legacy RDF/XML verbosity against Turtle and JSON-LD.

<div class="cim-snippet-builder" data-class="${escHtml(t.name)}" data-iri="${escHtml(t.iri)}" data-base="${escHtml(t.baseType || '')}">
<script type="application/json" class="cim-snippet-data">${safeJson}</script>
<noscript>
<pre><code>@prefix cim: &lt;http://iec.ch/TC57/CIM100#&gt; .
@prefix owl: &lt;http://www.w3.org/2002/07/owl#&gt; .
@prefix rdfs: &lt;http://www.w3.org/2000/01/rdf-schema#&gt; .

cim:${escHtml(t.name)} a owl:Class${escHtml(baseSub)} .</code></pre>
<pre><code>${escHtml(fallbackJsonLd)}</code></pre>
</noscript>
</div>`);
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

console.log(
  `Generated Starlight docs: ${model.types.length} CIM types, ${model.packages.length} CIM packages + overview pages.`
);
