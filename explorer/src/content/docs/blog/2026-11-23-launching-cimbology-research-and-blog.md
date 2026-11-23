---
title: "Rebuilding cimbology.com as a Research & CIM Ontology Hub"
date: 2026-11-23
authors:
  - shawn
tags:
  - cim
  - ontology
  - knowledge-graphs
  - cimbology-kg
excerpt: "Moving cimbology.com from a personal portfolio to an open research site, Markdown blog, and browsable IEC 61970/61968 OWL 2 ontology explorer."
---

**cimbology.com** started in late 2025 as a personal portfolio packaging my `dotTC57` library and CIMBOLOGY GraphRAG research. That version did its job. Now this site has a different focus: serving as an open home for ongoing research, published ontologies, and writing on CIM-grounded graph architecture for electrical infrastructure.

## What Is Live Now

- **[CIM100 & CIMBOLOGY-KG Explorer](/cim/):** All 1,414 top-level IEC 61970 and IEC 61968 types generated programmatically from [`dotTC57`](/research/dottc57/), plus the 41 CIMBOLOGY-KG extension classes, complete with Normative/Informative package badges, Mermaid class diagrams, and instant full-text search.
- **[Hosted OWL 2 Ontologies](/cim/#hosted-ontology-downloads):** Direct `.ttl`, `.owl`, and `.jsonld` downloads for `iec61970`, `iec61968`, `cim100`, and `cimbology-kg` under `https://cimbology.com/ontology/`.
- **[Research & Timeline](/research/timeline/):** How this work evolved over time, alongside the [CIMBOLOGY-KG architecture](/research/cimbology-kg/) and [GraphRAG benchmark](/research/cimbology-graphrag/).
- **This Blog:** Powered by Astro Starlight and Markdown. New essays and modeling notes publish straight from git with RSS support at [/blog/rss.xml](/blog/rss.xml).

More technical writing on CIM modeling, RDF lenses, SHACL profiles, and graph-based electrical design will follow here.
