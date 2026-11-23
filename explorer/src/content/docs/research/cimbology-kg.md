---
title: CIMBOLOGY-KG Architecture
description: An open, tool-agnostic semantic foundation for electrical infrastructure built on IEC CIM, OWL 2 extensions, W3C SHACL validation, RDF tool lenses, and JSON-LD.
---

**CIMBOLOGY-KG** is a data-first, CIM-grounded semantic model for electrical infrastructure. It describes what a substation or distribution network IS (its electrical topology, equipment, physical structures, and relationships) using open W3C semantic web standards. Authoring tools, utilities, and analysis pipelines conform to that contract; the data model does not bend around individual vendor limitations.

## Core Design Rule: CIM First

Every modeling decision follows one rule: check IEC CIM first, use canonical `cim:` terms directly when CIM already covers the concept, and extend under `cimbology:` only where IEC CIM genuinely stops.

A `cim:Breaker` in a CIMBOLOGY-KG graph uses the exact canonical IRI `http://iec.ch/TC57/CIM100#Breaker`. Any ADMS, EMS, GIS, or SPARQL tool that speaks IEC CIM recognizes it immediately without translation.

## The Four-Layer Semantic Stack

| Layer | Namespace / Format | Role |
|---|---|---|
| **1. IEC CIM Substrate** | `cim:` (`http://iec.ch/TC57/CIM100#`) | Electrical topology (`Terminal`, `ConnectivityNode`), equipment (`Breaker`, `PowerTransformer`, `ACLineSegment`), measurements, protection, assets, and closed value enumerations (`PhaseCode`, `CableConstructionKind`, `InterruptingMediumKind`). |
| **2. CIMBOLOGY-KG Extensions** | `cimbology:` (`https://cimbology.com/ontology/kg#`) | Physical and design-stage concerns CIM omits: 3D placement transforms and linear points, generic typed relations (`cimbology:Relation`), equipment banks (`cimbology:EquipmentBank`), logical conductor runs, structural steel/foundations/grounding, secondary P&C circuits, and distribution design entities. |
| **3. W3C SHACL Profiles** | Declarative `.ttl` shape graphs | Open-world restriction layer defining what makes a dataset valid for a specific milestone or consumer (electrical connectivity, physical placement, relations, substation, distribution, SCADA). |
| **4. RDF Tool Lenses** | External `*-lens.ttl` files | Per-tool translation rules mapping CAD, BIM, GIS, or EAM vocabularies onto canonical `cim:` and `cimbology:` terms using nearest-ancestor-wins CIM inheritance resolution. Tool namespaces never appear in canonical data files. |

Explore the live classes and properties in the [CIM100 & CIMBOLOGY-KG Explorer](/cim/) or download the raw Turtle, RDF/XML, and JSON-LD files from [Hosted Ontologies](/cim/#hosted-ontology-downloads).

## Canonical JSON-LD Wire Shape

Instance datasets serialize as standard **JSON-LD** with a flat `@graph` array rather than deeply nested vendor trees:

- **Stable identity:** Every node carries `"@id": "urn:uuid:{guid}"` (mirrored into `cim:IdentifiedObject.mRID`), while human-readable labels live in `cim:IdentifiedObject.name`.
- **Full-IRI typing:** `@type` references canonical `cim:` or `cimbology:` IRIs.
- **Declaring-class property names:** Properties use CIM declaring-class qualification (`cim:ACDCTerminal.sequenceNumber`, `cim:PowerTransformerEnd.ratedU`, `cim:Switch.ratedCurrent`).
- **Explicit engineering units on the wire:** Physical quantities in CIM properties serialize in SI base units (for example, 138 kV as `138000` V and 40 kA as `40000` A). Extension properties that declare an explicit QUDT unit (such as `unit:KiloV` on `cimbology:bil`) serialize in that declared unit.
- **First-class relations:** Generic physical, containment, mounting, protection, and clearance links serialize as `cimbology:Relation` nodes carrying `cimbology:source`, `cimbology:target`, and an open `cimbology:relationKind` discriminator.
- **Named graphs for provenance:** Preserving JSON-LD named-graph boundaries keeps design revisions, field as-built updates, validation reports, and overlay metadata cleanly separated across the full asset lifecycle.

```json
{
  "@id": "urn:uuid:8a1e9856-e68e-4364-9e50-c7091aded831",
  "@type": "http://iec.ch/TC57/CIM100#Breaker",
  "cim:IdentifiedObject.mRID": "8a1e9856-e68e-4364-9e50-c7091aded831",
  "cim:IdentifiedObject.name": "CB-1",
  "cim:Switch.ratedCurrent": 2000,
  "cim:Switch.normalOpen": false,
  "cim:ProtectedSwitch.breakingCapacity": 40000,
  "cimbology:bil": 650,
  "cimbology:hasAntiPump": true,
  "cimbology:hasTripSupervision": true,
  "cimbology:hasReclosing": true
}
```

## Schema, Catalog, Instance

CIMBOLOGY-KG enforces a strict three-tier boundary:

1. **Schema** defines what classes and predicates exist (`cim:` + `cimbology:`). It carries no utility-specific part numbers.
2. **Catalog** stays federated. Operating companies own their own parts catalogs and Compatible Units (`cim:CompatibleUnit`, from the Informative `IEC61968.InfIEC61968.InfWork` package). The ontology carries lookup keys and references, never a monolithic centralized catalog.
3. **Instance** is the station or circuit JSON-LD graph, referencing equipment types from schema and catalog identities by URI.

## Why RDF Lenses Solve Tool Agnosticism

A lens is a small Turtle file that re-opens existing CIM classes without modifying or subclassing the core ontology:

```turtle
cim:PowerTransformer
    cimbology:toolCategory "BIM.Equipment" ;
    cimbology:fallbackSymbol "TRANSFORMER_138_13" .
```

A lens resolver walks the CIM `rdfs:subClassOf` hierarchy (nearest ancestor wins). One mapping on `cim:Switch` covers breakers, disconnectors, load-break switches, and fuses until a more specific rule overrides it. Every CAD, BIM, or asset tool gets its own facet on the same canonical CIM identity with zero changes to the shared core.
