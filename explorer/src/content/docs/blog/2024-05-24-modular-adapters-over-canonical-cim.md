---
title: "One Canonical CIM Substrate, Many Deliverables: The Modular Adapter Pattern"
date: 2024-05-24
authors:
  - shawn
tags:
  - cim
  - architecture
  - digital-twins
  - interoperability
  - cimbology-graph
excerpt: "Utilities and engineering firms repeatedly build custom pipelines per client and per deliverable. Mapping disparate source feeds once into canonical IEC CIM profiles turns N-to-N custom code into reusable services."
---

*Based on an architecture blueprint I drafted in May 2024 to solve N-to-N utility data integration, which later evolved into the declarative RDF lens architecture of [CIMBOLOGY Graph](/research/cimbology-graph/).*

Utilities across North America ask for the same core set of outcomes: accurate digital twins, reliable grid-planning models, condition-based maintenance feeds, and trustworthy AI assistants. The desired use cases look remarkably similar from one utility to the next. What differs every single time is the messy set of source formats sitting inside each utility's walls.

That mismatch creates two compounding problems:

1. **Disparate source formats force custom pipelines.** Every client holds SCADA exports, GIS layers, 2D drawings, and asset spreadsheets in slightly different schemas. Building a direct pipeline from each source to each output multiplies custom code for every client and every deliverable.
2. **Without a shared intermediate schema, nothing is reusable.** When an engineering team solves a digital-twin or grid-planning problem for Utility A, almost none of that pipeline transfers cleanly to Utility B because the translation logic is hard-wired to Utility A's proprietary files.

## The Modular Adapter Architecture

The architectural fix is straightforward: stop mapping source formats directly to final deliverables. Instead, introduce **canonical IEC CIM** (IEC 61970 / IEC 61968) as the single intermediate contract in the middle.

<pre class="mermaid">
flowchart LR
  SCADA["SCADA Feeds"] --> A1["Source Adapter"]
  GIS["GIS Layers"] --> A2["Source Adapter"]
  DWG["Drawings & CAD"] --> A3["Source Adapter"]
  AST["Asset Systems"] --> A4["Source Adapter"]

  A1 --> CIM[("Canonical IEC CIM Substrate")]
  A2 --> CIM
  A3 --> CIM
  A4 --> CIM

  CIM --> DT["CIM-Based Digital Twins"]
  CIM --> GP["Grid Planning Models"]
  CIM --> CBM["Condition-Based Maintenance"]
  CIM --> AI["Grounded AI Services"]
</pre>

Under this pattern, work splits into two clean, decoupled halves:

- **Thin, modular source adapters on the left:** One focused adapter per source format converts raw utility inputs into canonical IEC CIM profiles. Adding a new utility or a new CAD/GIS tool means writing or configuring one adapter, never rebuilding downstream services.
- **Reusable deliverable services on the right:** Digital-twin generators, planning exports, maintenance analytics, and AI query engines all read from the same canonical CIM contract. A new capability built for one use case immediately becomes available across every dataset already normalized to CIM.

## From Adapters to Declarative RDF Lenses

In May 2024, I first sketched this architecture as modular web services translating between disparate inputs, canonical CIM profiles, and downstream deliverables. Over the following two years, moving the intermediate contract into **OWL 2**, **JSON-LD**, and **W3C SHACL** refined that pattern further:

- The canonical substrate became the full hosted **IEC 61970 / IEC 61968 CIM100 ontology** paired with a minimal design-stage extension approach ([CIMBOLOGY Graph](/research/cimbology-graph/)).
- Procedural per-tool translation code shrank into declarative **RDF tool lenses** that walk the CIM class hierarchy (nearest ancestor wins) without modifying the core schema.
- Quality gates moved out of ad-hoc scripts into reusable **SHACL validation profiles** checked directly against the canonical graph.

The core lesson holds from 2015 onward: do not push fragile point-to-point copies across every pair of systems. Normalize once onto an open standard and let every downstream consumer pull from a governed source of truth.
