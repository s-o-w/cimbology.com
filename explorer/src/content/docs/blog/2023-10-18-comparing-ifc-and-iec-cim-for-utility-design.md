---
title: "Why Utilities Need an Open Design Substrate Like IFC: The Case for IEC CIM"
date: 2023-10-18
authors:
  - shawn
tags:
  - cim
  - interoperability
  - sdsic
  - dottc57
  - ontology
excerpt: "In July 2022 I compared buildingSMART IFC with IEC CIM and challenged developers to build on CIM. After presenting at SDSIC Nashville in 2023, the interoperability gap came into sharp focus."
---

*Written from notes and public posts from July 2022 (comparing buildingSMART IFC and EPRI/IEC CIM) and the April and October 2023 SDSIC interoperability sessions.*

The utility engineering software ecosystem stays trapped in a predictable loop. Utilities buy specialized CAD, BIM, GIS, and protection tools that cannot speak a common language. Vendors have no financial incentive to make their proprietary formats interoperable because lock-in protects their footprint. Utilities then pay engineering firms and internal IT teams to write brittle one-off translation scripts between every pair of tools.

Vertical AEC broke part of that cycle with **IFC (Industry Foundation Classes)** maintained by buildingSMART International. IFC is far from perfect, and vendors do not always implement it cleanly, yet having a shared open schema gave AEC a target that multiple tools could read and write.

Electrical utilities already have an international equivalent to IFC sitting right in front of us: the **IEC Common Information Model (CIM)**, defined in **IEC 61970** and **IEC 61968**.

## Comparing IFC and IEC CIM

Back in July 2022, I posted a side-by-side look at IFC and EPRI's CIM Primer (8th Edition) on LinkedIn and challenged software engineers to build something real with CIM. The two standards share the same core philosophy:

- Both define an international, vendor-neutral object model for real-world physical infrastructure.
- Both formalize class hierarchies, attributes, and explicit relationships between assets.
- Both exist so downstream consumers do not have to scrape meaning out of 2D geometry.

Where they diverged was adoption inside design workflows:

| Dimension | IFC (AEC Industry) | IEC CIM (Electric Utilities) |
|---|---|---|
| **Primary Home Today** | Design, BIM authoring, coordination | Operations (EMS, SCADA, ADMS, market exchange) |
| **Design Tooling Support** | Built into major CAD/BIM packages | Bolted on late as partial exports, if at all |
| **Perception Among Designers** | Familiar exchange format | Viewed as an intimidating IT/operations spec |
| **Barrier to Entry** | Open schemas and developer tooling | Paywalled IEC docs and heavy CIMTool profiling workflows |

## Why CIM Stalled in Design

When I presented *IEC CIM for Electrical Utility Software Integration* at the **SDSIC Nashville** event in April 2023 and revisited it during the October 2023 SDSIC Innovation Committee interoperability discussion, the same two objections came up every time:

1. **Engineers read CIM like a design standard instead of a software UML model.** CIM does not tell you how to place a bus support on a steel stand or how to lay out a panel front. It tells software what a `cim:Breaker` is, how its `cim:Terminal` connects to a `cim:ConnectivityNode`, and what standard enumerations govern its electrical ratings.
2. **Traditional profiling workflows feel backwards for design.** Hand-picking a tiny static subset of CIM classes into a rigid exchange profile works for a narrow operational message, not for multidisciplinary substation design. Designers need dynamic access to the full standard model, plus clean, isolated extensions for physical layout and construction details CIM leaves out by design.

## Planting a Stake in the Ground

Digital transformation in utility software starts with having a single common target to hit. If the industry agrees on an open semantic data substrate grounded in IEC CIM, every authoring tool, analysis engine, and enterprise system maps once to the standard instead of N-to-N against every other vendor.

That argument from 2022 and 2023 drove everything built on this site since:

- **[`dotTC57`](/research/dottc57/):** Started as a 2023 prototype parsing an XML/RDF CIM substation bay into an SVG single-line diagram, then published open-source (MIT) in July 2025 as a full .NET object model and `.NET 10` OWL 2 ontology generator covering all `1,414` IEC 61970 and IEC 61968 types.
- **[Hosted CIM100 OWL 2 Ontologies & Explorer](/cim/):** Making the full IEC 61970 and IEC 61968 model browsable and downloadable in Turtle, RDF/XML, and JSON-LD so developers can inspect and consume CIM directly.
- **[CIMBOLOGY Graph](/research/cimbology-graph/):** Extending canonical `cim:` terms only where IEC CIM genuinely stops, using external RDF lenses so tool-specific vocabularies never pollute the shared graph.
