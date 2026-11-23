---
title: "Position Is Not Meaning: Why Drawings Cannot Answer Engineering Questions"
date: 2026-05-07
authors:
  - shawn
tags:
  - cim
  - data-first
  - knowledge-graphs
  - utility-design
  - cimbology-graph
excerpt: "Ask a substation general arrangement drawing which breaker protects which transformer. The file has no idea, because tool-native formats encode coordinates and pixels rather than electrical meaning."
---

*Adapted from my May and August 2026 notes on the limits of file-centric substation drawings.*

Pick any substation general arrangement drawing. The power transformer sits next to the breaker. The current transformers sit drawn inside the bay. Now ask the file one basic question: **which breaker protects which transformer?**

The file does not know. You know, because you can look at the sheet and infer the relationship from proximity and experience. To the file itself, those symbols are unrelated blocks of geometry that happen to share coordinates.

## The Burden of Binary Files

This is the core limitation of every tool-native file format in utility design: **they encode position, never meaning.**

- A DWG knows where lines and blocks sit on layers.
- A Revit model knows which families are placed at which XYZ transforms.
- A PDF knows where pixels sit on a page.

None of them natively know that [`cim:ConductingEquipment`](/cim/iec61970/base/core/conductingequipment/) A connects electrically to equipment B through [`cim:Terminal`](/cim/iec61970/base/core/terminal/) C and [`cim:ConnectivityNode`](/cim/iec61970/base/core/connectivitynode/) N, that a protection scheme trips on overcurrent measured by a specific CT, or that the entire assembly belongs to a [`cim:Bay`](/cim/iec61970/base/core/bay/) inside a [`cim:VoltageLevel`](/cim/iec61970/base/core/voltagelevel/) inside a [`cim:Substation`](/cim/iec61970/base/core/substation/).

The one-line, three-line, physical layout, and wiring diagrams are all views of the same station saved as disconnected files. Every time a design moves downstream, procurement, GIS, ADMS, operations, and maintenance each re-derive the same station by hand. After spending a decade inside that loop at a utility and years watching it repeat across every utility client at an EPC, the pattern is unmistakable: this is a structural industry data problem.

## Making Relationships First-Class

The fix is capturing the station **data-first** (or in parallel with views for field practicality) using the standard operations already trusts:

- **Equipment as canonical classes** (`cim:Breaker`, `cim:PowerTransformer`, `cim:Disconnector`) instead of arbitrary blocks and layer names.
- **Explicit electrical connectivity** through terminals and connectivity nodes, so you can traverse what is attached without guessing from geometry.
- **Phase carried on connection points**, so phase identity traces end to end.
- **Placement carried per instance**, keeping 3D physical layout bound directly to electrical identity.
- **Executable validation rules (W3C SHACL)** traveling alongside the graph, so any receiver verifies compliance against a published profile without repeating manual checks.

That is the architecture behind [CIMBOLOGY Graph](/research/cimbology-graph/) and the hosted [CIM100 ontologies](/cim/).
