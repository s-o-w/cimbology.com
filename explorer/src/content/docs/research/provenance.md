---
title: Provenance & Prior Art
description: Public timeline and architectural lineage of Shawn Weekly's work on data-first electrical infrastructure design, IEC CIM, dotTC57, GraphRAG, and CIMBOLOGY-KG.
---

This page records the public lineage of the architecture, open-source tooling, and research published on **cimbology.com**. The thesis behind CIMBOLOGY did not start with generative AI in 2024. It developed over more than two decades of field work, utility design systems architecture, standards committee work, and independent open-source engineering.

## 2000–2004: Field Layout and the Cost of Bad Data

The core principle behind all of this work started on construction sites doing civil layout and surveying. Field crews took printed drawings out each morning, marked them up in the dirt, handed markups back to engineers, and waited for drafters to produce a new sheet the next day. Before laying out a single stake, the crew chief spent minutes to hours re-entering coordinates from a paper drawing into a total station.

The data was always the thing that mattered. The drawings were used to recreate data for the field crew, and then used to line the floorboard of the truck. Twenty years later, the same pattern still dominates substation and distribution design.

## 2010–2021: Utility Design Systems and Industry Consortium Leadership

Moving into electrical transmission and substation design systems exposed the same structural failure at enterprise scale: equipment identity, ratings, and topology lived inside CAD drawings, spreadsheets, and disconnected databases. A single 230 kV breaker moved across BIM, CAD, GIS, ADMS, and asset management, getting re-keyed four times under four naming conventions.

Across a decade of utility design system architecture and active participation in the **Substation Design Solutions Industry Consortium (SDSIC)** from 2015 onward (serving as Technology Group Chair from 2020 to 2021, Innovation Committee Co-Chair from 2023 to 2024, and Content Subcommittee Special Advisor from 2024 onward), the same architectural conclusion kept repeating: drawings must be views generated from governed data, not the source of truth.

## 2020–2023: IEC CIM as the Design Substrate and `dotTC57`

First exposure to the IEC Common Information Model (IEC 61970 / IEC 61968) came through consortium discussions in 2020 and 2021. Reading the CIM UML for the first time produced an immediate reaction: *"Where have you been my whole career."*

Most utility engineers approach CIM as an electrical specification and bounce off its formality. Approached as a software UML model, CIM is an existing international object hierarchy covering generation, transmission, distribution, protection, measurements, and enterprise assets. The industry gap was never the model. The gap was that CIM lived in operations (EMS, SCADA, market exchange) while the design world ignored it.

In 2023, between consortium sessions in a hotel room, I wrote the first code to parse an XML/RDF CIM bay sample and render an SVG single-line diagram from it. That personal project grew into **[`dotTC57`](/research/dottc57/)**, an MIT-licensed .NET library mirroring the full IEC 61970 and IEC 61968 UML model.

Two technical frustrations shaped `dotTC57` and everything that followed:

1. **Full UML coverage over hand-picked derived profiles.** Traditional CIMTool workflows require picking classes and fields by hand into a narrow static profile for one exchange format. Substation design requires dynamic selection across the standard, using CIM natively and adding extensions only where CIM stops.
2. **Serialization evolution.** Starting with RDF/XML proved verbose and hostile to modern web and application stacks. Turtle (`.ttl`) cleaned up ontology authoring. JSON-LD solved instance exchange and web integration: once JSON-LD entered the picture, everything clicked into place.

## 2024–2025: CIMBOLOGY GraphRAG Research

Independent personal research during 2024 and 2025 tested a practical question driven by retiring senior engineers across the utility sector: can a CIM-anchored knowledge graph combined with retrieval-augmented generation (GraphRAG) deliver verifiable, citation-backed engineering answers?

Testing four retrieval architectures against 66 questions from a 2025 Professional Engineering (PE) exam using a corpus of 2017-era engineering standards produced clear empirical results:

| Approach | Accuracy | Traceability |
|---|---|---|
| Naive RAG (page-level vector search) | 53.03% | None |
| Baseline LLM (zero context) | 77.27% | None |
| Advanced RAG (layout-aware chunking + tables + multimodal) | 83.33% | Partial |
| **CIM GraphRAG (GraphDB + Qdrant + Semantic Kernel)** | **84.85%** | **Full** |

Naive RAG scored 24 percentage points worse than using no RAG at all. Adding structured graph context over clean retrieval produced both the highest accuracy and full citation traceability. The full write-up is published under [CIMBOLOGY GraphRAG Research](/research/cimbology-graphrag/).

## 2025–2026: CIMBOLOGY-KG and Open Hosted CIM100 Ontologies

Late 2025 saw the initial publication of **cimbology.com** documenting `dotTC57` and the GraphRAG benchmark. In 2026, the work expanded into **[CIMBOLOGY-KG](/research/cimbology-kg/)**: an open, platform-agnostic semantic data foundation built directly on W3C standards (OWL 2, Turtle, JSON-LD, SHACL, SPARQL, and named graphs).

Current public artifacts hosted directly on this domain:

- **Full IEC 61970 & IEC 61968 OWL 2 ontologies** generated programmatically from `dotTC57` (`1,414` top-level CIM types across `77` packages, preserving canonical `http://iec.ch/TC57/CIM100#` IRIs and explicit Normative vs. Informative tier annotations).
- **CIMBOLOGY-KG Core Extension Ontology** hosted under `https://cimbology.com/ontology/kg#`, importing `cim100.ttl` and adding only what IEC CIM omits by design (physical structures, 3D placement geometry, generic typed relations, secondary P&C circuits, and distribution design entities).
- **[CIM100 & Extension Explorer](/cim/)**: a searchable, browsable web reference exposing every class, package, datatype, enumeration, inheritance chain, and class diagram directly on `cimbology.com`.
