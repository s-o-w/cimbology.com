# cimbology.com

Research site, Markdown blog, hosted IEC CIM100 + CIMBOLOGY-KG OWL 2 ontologies, and browsable CIM Explorer powered by Astro Starlight.

## Publishing a New Blog Post

1. Create a Markdown file under `explorer/src/content/docs/blog/YYYY-MM-DD-your-slug.md`:

```markdown
---
title: "Your Post Title"
date: 2026-11-24
authors:
  - shawn
tags:
  - cim
  - knowledge-graphs
excerpt: "One-sentence summary shown on the blog index and RSS feed."
---

Write your post in standard Markdown here.
```

2. Commit and push to `main`. GitHub Actions builds the site and publishes it to `https://cimbology.com/blog/` (and `/blog/rss.xml`) automatically.

## Local Preview

```bash
cd explorer
npm ci
npm run generate
npm run dev
```

## Full Build & Verification

```bash
cd explorer
npm run verify:ontologies
npm run generate
npm run build
npm run verify:explorer
```
