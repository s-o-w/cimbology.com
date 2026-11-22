import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelPath = path.resolve(__dirname, '../ontology/cim-model.json');
const model = JSON.parse(fs.readFileSync(modelPath, 'utf8'));

function pkgSlug(pkgId) {
  return pkgId.toLowerCase().replace(/\./g, '/');
}

function buildStandardSidebar(standard) {
  const pkgs = model.packages
    .filter((p) => p.standard === standard && p.id !== standard)
    .sort((a, b) => a.id.localeCompare(b.id));

  // Group packages by second segment (e.g. Base, Dynamics, InfIEC61970, AssetInfo, Common...)
  const groups = new Map();
  for (const pkg of pkgs) {
    const parts = pkg.id.split('.');
    const groupKey = parts.length > 1 ? parts[1] : parts[0];
    if (!groups.has(groupKey)) groups.set(groupKey, []);
    groups.get(groupKey).push(pkg);
  }

  const items = [
    {
      label: `${standard} Overview`,
      slug: standard.toLowerCase(),
    },
  ];

  for (const [groupName, groupPkgs] of [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    if (groupPkgs.length === 1) {
      const p = groupPkgs[0];
      items.push({
        label: p.id.replace(`${standard}.`, '') + (p.tier === 'Informative' ? ' (Inf)' : ''),
        slug: pkgSlug(p.id),
      });
    } else {
      items.push({
        label: groupName,
        collapsed: true,
        items: groupPkgs.map((p) => ({
          label:
            p.id.replace(`${standard}.${groupName}.`, '').replace(`${standard}.`, '') +
            (p.tier === 'Informative' ? ' (Inf)' : ''),
          slug: pkgSlug(p.id),
        })),
      });
    }
  }

  return items;
}

export default defineConfig({
  site: 'https://cimbology.com',
  base: '/cim',
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'CIMBOLOGY CIM Explorer',
      description: 'Browsable IEC 61970, IEC 61968 (CIM100), and CIMBOLOGY-KG OWL 2 ontology reference hosted on cimbology.com.',
      pagefind: true,
      customCss: ['./src/styles/custom.css'],
      head: [
        {
          tag: 'link',
          attrs: {
            rel: 'alternate',
            type: 'text/turtle',
            href: '/ontology/cim100.ttl',
            title: 'CIM100 OWL Ontology (Turtle)',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'alternate',
            type: 'text/turtle',
            href: '/ontology/cimbology-kg.ttl',
            title: 'CIMBOLOGY-KG Extension Ontology (Turtle)',
          },
        },
        {
          tag: 'script',
          attrs: {
            defer: true,
            src: '/cim/vendor/mermaid.min.js',
          },
        },
        {
          tag: 'script',
          attrs: {
            defer: true,
            src: '/cim/vendor/mermaid-init.js',
          },
        },
      ],
      social: {
        github: 'https://github.com/s-o-w/dotTC57',
      },
      sidebar: [
        {
          label: 'Start Here',
          items: [
            { label: 'Ontology Overview & Downloads', slug: '' },
            { label: '← Back to cimbology.com', link: 'https://cimbology.com/' },
          ],
        },
        {
          label: 'IEC 61970 (Transmission / EMS)',
          collapsed: false,
          items: buildStandardSidebar('IEC61970'),
        },
        {
          label: 'IEC 61968 (Distribution / Assets)',
          collapsed: true,
          items: buildStandardSidebar('IEC61968'),
        },
        {
          label: 'CIMBOLOGY-KG Extensions',
          collapsed: false,
          items: [
            { label: 'Extension Overview', slug: 'cimbology-kg' },
            { label: 'Classes (41)', slug: 'cimbology-kg/classes' },
            { label: 'Relation & Clearance Kinds', slug: 'cimbology-kg/kinds' },
            { label: 'Object Properties', slug: 'cimbology-kg/properties/object' },
            { label: 'Annotation & Lens Predicates', slug: 'cimbology-kg/properties/annotations' },
            { label: 'Domain-Scoped Datatype Properties', slug: 'cimbology-kg/properties/domain-datatype' },
            { label: 'General Datatype Properties', slug: 'cimbology-kg/properties/general-datatype' },
          ],
        },
      ],
    }),
  ],
});
