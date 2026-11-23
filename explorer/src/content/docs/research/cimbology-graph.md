---
title: CIMBOLOGY Graph Architecture
description: An open, tool-agnostic semantic graph approach for electrical infrastructure grounded in IEC CIM, minimal design-stage extensions, W3C SHACL validation, RDF tool lenses, and JSON-LD.
---

**CIMBOLOGY Graph** is a data-first, CIM-grounded semantic approach and reference architecture for electrical infrastructure. It is an architectural approach, not a software product: it describes what a substation or distribution network IS (its electrical topology, equipment, physical structures, and relationships) using open W3C semantic web standards. Authoring tools, utilities, and analysis pipelines conform to that contract; the data model does not bend around individual vendor limitations.

*Scope note: This site publishes the complete, unmodified [IEC 61970 and IEC 61968 (CIM100) OWL 2 ontologies](/cim/) and documents the architectural pattern needed to bridge CIM into physical design workflows. It intentionally does not publish a prescribed extension ontology.*

## Core Design Rule: CIM First

Every modeling decision follows one rule: check IEC CIM first, use canonical `cim:` terms directly whenever CIM covers the concept, and introduce domain extensions only where IEC CIM genuinely stops.

A `cim:Breaker` in a CIM-grounded graph uses the exact canonical IRI `http://iec.ch/TC57/CIM100#Breaker`. Any ADMS, EMS, GIS, or SPARQL tool that speaks IEC CIM recognizes it immediately without translation.

## Where IEC CIM Stops (The Design-Stage Gap)

IEC 61970 and IEC 61968 excel at electrical topology, conducting equipment, operational ratings, measurements, protection devices, and enterprise asset lifecycle records. By design, CIM was not built as a 3D CAD or civil/structural construction schema. Moving electrical design data onto a CIM-grounded graph requires acknowledging five concrete gaps that a thin design-stage extension layer must bridge without forking CIM:

1. **Physical 3D placement and linear geometry:** Substation yard coordinates, equipment orientation transforms, and routed bus/conductor geometry beyond CIM's geographic `PositionPoint` and schematic `DiagramLayout`.
2. **Civil and structural context:** Concrete foundations, steel support structures, trenches, conduit, grounding grids, and site hardware that carry electrical equipment in the physical yard.
3. **Typed non-electrical relationships:** Explicit mounting, containment, physical support, clearance, and assembly links that are distinct from electrical `Terminal`-to-`ConnectivityNode` connectivity.
4. **Secondary protection and control (P&C) design detail:** Panel wiring, relay-to-device control logic, and commissioning attributes needed during detailed engineering.
5. **Distribution construction assemblies:** Design-time pole framing, structural attachments, and work-unit assemblies connecting physical layouts to utility Compatible Units.

## The Four-Layer Semantic Stack

<pre class="mermaid">
flowchart BT
  L1["1. IEC CIM100 Substrate (IEC 61970 + IEC 61968)"]
  L2["2. Design-Stage Extension Layer (3D Placement, Structures, Relations, P&amp;C)"]
  L3["3. W3C SHACL Validation Profiles (Connectivity, Placement, Milestones)"]
  L4["4. RDF Tool Lenses (External Tool Mappings via CIM Inheritance)"]
  Tools["Authoring &amp; Operations Tools (CAD, BIM, GIS, EMS/ADMS, GraphRAG)"]

  L1 --> L2
  L2 --> L3
  L3 --> L4
  L4 --> Tools
  Tools --> L4
</pre>

| Layer | Standards / Format | Role |
|---|---|---|
| **1. IEC CIM Substrate** | `cim:` (`http://iec.ch/TC57/CIM100#`) | Canonical electrical topology (`Terminal`, `ConnectivityNode`), equipment (`Breaker`, `PowerTransformer`, `ACLineSegment`), measurements, protection, assets, and closed value enumerations (`PhaseCode`, `CableConstructionKind`, `InterruptingMediumKind`). |
| **2. Design-Stage Extension Layer** | Minimal OWL 2 module importing `cim100.ttl` | Thin, isolated domain vocabulary covering only the physical, structural, spatial, typed-relation, P&C, and construction concepts CIM omits, without redefining or subclassing-away canonical `cim:` identities. |
| **3. W3C SHACL Profiles** | Declarative `.ttl` shape graphs | Open-world restriction layer defining what makes a dataset complete and valid for a specific engineering milestone or downstream consumer (electrical connectivity, physical placement, substation, distribution, SCADA). |
| **4. RDF Tool Lenses** | External `*-lens.ttl` files | Per-tool translation rules mapping CAD, BIM, GIS, or EAM vocabularies onto canonical `cim:` and extension terms using nearest-ancestor-wins CIM inheritance resolution. Tool namespaces never appear in canonical data files. |

Explore all `1,414` canonical IEC 61970 and IEC 61968 classes, datatypes, and enumerations in the [CIM100 Explorer](/cim/), or download the raw Turtle, RDF/XML, and JSON-LD files from [Hosted Ontologies](/cim/#hosted-ontology-downloads).

## Canonical JSON-LD Wire Shape

Instance datasets serialize as standard **JSON-LD** with a flat `@graph` array rather than deeply nested vendor trees:

- **Stable identity:** Every node carries `"@id": "urn:uuid:{guid}"` (mirrored into `cim:IdentifiedObject.mRID`), while human-readable labels live in `cim:IdentifiedObject.name`.
- **Full-IRI typing:** `@type` references canonical `cim:` IRIs directly (and minimal extension IRIs only when representing non-CIM physical or structural entities).
- **Declaring-class property names:** Properties use CIM declaring-class qualification (`cim:ACDCTerminal.sequenceNumber`, `cim:PowerTransformerEnd.ratedU`, `cim:Switch.ratedCurrent`).
- **Explicit engineering units on the wire:** Physical quantities in CIM properties serialize in SI base units (for example, 138 kV as `138000` V and 40 kA as `40000` A). Any extension quantity property should declare an explicit QUDT unit and quantity kind so units are never guessed from field names.
- **First-class non-electrical relations:** Physical mounting, containment, support, and clearance links belong in explicit, typed graph relations rather than buried inside CAD layer names or custom block attributes.
- **Named graphs for provenance:** Preserving JSON-LD named-graph boundaries keeps design revisions, field as-built updates, validation reports, and overlay metadata cleanly separated across the full asset lifecycle.

```json
{
  "@id": "urn:uuid:8a1e9856-e68e-4364-9e50-c7091aded831",
  "@type": "http://iec.ch/TC57/CIM100#Breaker",
  "cim:IdentifiedObject.mRID": "8a1e9856-e68e-4364-9e50-c7091aded831",
  "cim:IdentifiedObject.name": "CB-1",
  "cim:Switch.ratedCurrent": 2000,
  "cim:Switch.normalOpen": false,
  "cim:ProtectedSwitch.breakingCapacity": 40000
}
```

## Schema, Catalog, Instance

A maintainable CIM-grounded design architecture enforces a strict three-tier boundary:

1. **Schema** defines what classes and predicates exist (`cim:` plus any minimal design-stage extension module). It carries no utility-specific part numbers.
2. **Catalog** stays federated. Operating companies own their own parts catalogs and Compatible Units (`cim:CompatibleUnit`, from the Informative `IEC61968.InfIEC61968.InfWork` package). The schema carries lookup keys and references, never a monolithic centralized catalog.
3. **Instance** is the station or circuit JSON-LD graph, referencing equipment types from schema and catalog identities by URI.

## Why RDF Lenses Solve Tool Agnosticism

A lens is a small external Turtle file that annotates existing CIM classes for one specific authoring or consuming tool without modifying or subclassing the shared ontology:

```turtle
@prefix cim:  <http://iec.ch/TC57/CIM100#> .
@prefix lens: <https://example.org/cad-lens#> .

cim:PowerTransformer
    lens:targetCategory "BIM.Equipment" ;
    lens:symbolKey "TRANSFORMER_138_13" .
```

A lens resolver walks the CIM `rdfs:subClassOf` hierarchy (nearest ancestor wins). One mapping on `cim:Switch` covers breakers, disconnectors, load-break switches, and fuses until a more specific rule overrides it. Every CAD, BIM, or asset tool gets its own projection over the same canonical CIM identity with zero changes to the shared core.
