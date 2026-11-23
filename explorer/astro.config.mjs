import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightBlog from 'starlight-blog';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelPath = path.resolve(__dirname, '../ontology/cim-model.json');
const model = JSON.parse(fs.readFileSync(modelPath, 'utf8'));

function pkgSlug(pkgId) {
  return `cim/${pkgId.toLowerCase().replace(/\./g, '/')}`;
}

function buildStandardSidebar(standard) {
  const pkgs = model.packages
    .filter((p) => p.standard === standard && p.id !== standard)
    .sort((a, b) => a.id.localeCompare(b.id));

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
      slug: `cim/${standard.toLowerCase()}`,
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
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'CIMBOLOGY',
      description:
        'Independent research on IEC CIM-grounded knowledge graphs, semantic design substrates, OWL 2 ontologies, and verifiable AI for electrical infrastructure.',
      logo: {
        light: './src/assets/CimbologyLogo_transparent.png',
        dark: './src/assets/CimbologyLogo_transparent_dark.png',
        alt: 'CIMBOLOGY',
      },
      pagefind: true,
      customCss: ['./src/styles/custom.css'],
      plugins: [
        starlightBlog({
          title: 'Research Blog',
          prefix: 'blog',
          navigation: 'header-end',
          postCount: 10,
          recentPostCount: 5,
          authors: {
            shawn: {
              name: 'Shawn Weekly',
              title: 'Principal Solution Architect & CIM Researcher',
              picture: '/imgs/headshot.jpg',
              url: 'https://cimbology.com/about/',
            },
          },
        }),
      ],
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
            async: true,
            src: 'https://www.googletagmanager.com/gtag/js?id=G-3F4ESRJQSQ',
          },
        },
        {
          tag: 'script',
          content:
            "window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-3F4ESRJQSQ');",
        },
        {
          tag: 'script',
          attrs: {
            defer: true,
            src: '/vendor/mermaid-init.js',
          },
        },
      ],
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/s-o-w' },
        { icon: 'rss', label: 'Blog RSS', href: 'https://cimbology.com/blog/rss.xml' },
      ],
      sidebar: [
        {
          label: 'Research',
          collapsed: false,
          items: [
            { label: 'CIMBOLOGY-KG Architecture', slug: 'research/cimbology-kg' },
            { label: 'Why IEC CIM Matters', slug: 'research/why-cim-matters' },
            { label: 'CIMBOLOGY GraphRAG Research', slug: 'research/cimbology-graphrag' },
            { label: 'dotTC57 Open-Source Library', slug: 'research/dottc57' },
            { label: 'Graph-Grounded AI', slug: 'research/ai-and-engineering' },
            { label: 'Research Timeline', slug: 'research/timeline' },
            { label: 'About Shawn Weekly', slug: 'about' },
          ],
        },
        {
          label: 'CIM100 & Ontology Explorer',
          collapsed: false,
          items: [
            { label: 'Explorer Overview & Downloads', slug: 'cim' },
            {
              label: 'IEC 61970 (Transmission / EMS)',
              collapsed: true,
              items: buildStandardSidebar('IEC61970'),
            },
            {
              label: 'IEC 61968 (Distribution / Assets)',
              collapsed: true,
              items: buildStandardSidebar('IEC61968'),
            },
            {
              label: 'CIMBOLOGY-KG Extensions',
              collapsed: true,
              items: [
                { label: 'Extension Overview', slug: 'cim/cimbology-kg' },
                { label: 'Classes (41)', slug: 'cim/cimbology-kg/classes' },
                { label: 'Relation & Clearance Kinds', slug: 'cim/cimbology-kg/kinds' },
                { label: 'Object Properties', slug: 'cim/cimbology-kg/properties/object' },
                { label: 'Annotation & Lens Predicates', slug: 'cim/cimbology-kg/properties/annotations' },
                { label: 'Domain-Scoped Datatype Properties', slug: 'cim/cimbology-kg/properties/domain-datatype' },
                { label: 'General Datatype Properties', slug: 'cim/cimbology-kg/properties/general-datatype' },
              ],
            },
          ],
        },
      ],
    }),
  ],
});
