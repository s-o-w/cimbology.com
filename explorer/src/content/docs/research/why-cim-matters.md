---
title: Why IEC CIM Matters for Design
description: IEC 61970 and IEC 61968 already provide the international ontology for electrical systems. Why operations adopted CIM, why design ignored it, and why every utility data platform maps back to it.
---

If you build anything in the electrical utility data space and do not ground it in the IEC Common Information Model (CIM), you are building on sand. Every custom utility schema eventually has to map back to CIM anyway.

## What CIM Actually Is

CIM (**IEC 61970** for transmission and energy management, **IEC 61968** for distribution and enterprise asset management) is an international UML and RDF ontology refined over more than two decades by people who run power systems.

CIM is a software model, not an electrical design handbook. That distinction explains why many utility engineers bounce off CIM on first contact while software architects see the fit immediately. CIM provides:

- Formal class hierarchies rooted at [`cim:IdentifiedObject`](/cim/iec61970/base/core/identifiedobject/) and [`cim:ConductingEquipment`](/cim/iec61970/base/core/conductingequipment/).
- Explicit electrical connectivity via [`cim:Terminal`](/cim/iec61970/base/core/terminal/) and [`cim:ConnectivityNode`](/cim/iec61970/base/core/connectivitynode/).
- Standard closed enumerations for electrical attributes ([`cim:PhaseCode`](/cim/iec61970/base/core/phasecode/), [`cim:CableConstructionKind`](/cim/iec61968/assetinfo/cableconstructionkind/), [`cim:InterruptingMediumKind`](/cim/iec61968/assetinfo/interruptingmediumkind/), [`cim:CoolingKind`](/cim/iec61968/infiec61968/infassets/coolingkind/) *(Inf)*, [`cim:WindingConnection`](/cim/iec61970/base/wires/windingconnection/)).
- Direct mapping to W3C semantic web standards (RDF, OWL 2, SPARQL, SHACL, and JSON-LD).

## What CIM Is Not

CIM does not tell you how to draw a single-line diagram, where a steel A-frame sits in a substation yard, or what bolts hold a bus support onto a concrete pad. CIM defines *what an electrical object is* and *how it connects to other objects*. Physical placement, construction hardware, and tool-specific translation belong in clean extensions and lenses layered on top of CIM, as implemented in [CIMBOLOGY-KG](/research/cimbology-kg/).

## Coverage From Generator to Meter

Across the `1,414` top-level types exposed in the [CIM100 Explorer](/cim/), CIM covers four major layers of the utility enterprise:

- **Physical electrical assets:** generators, power transformers, breakers, switches, busbars, overhead lines, underground cables, poles, towers, duct banks, and customer meters.
- **Operational state and measurements:** voltages, currents, power flows, switch states, protection relays, faults, and outages.
- **Enterprise and work context:** organizations, crews, work orders, asset deployments, specifications, and lifecycle records.
- **Network topology and diagrams:** node-breaker models, bus-branch equivalents, geographic coordinates, and normative [`DiagramLayout`](/cim/iec61970/base/diagramlayout/) structures.

## Normative vs. Informative Packages

CIM packages split into two tiers:

- **Normative packages** (`IEC61970.Base.*`, `IEC61968.Common`, `IEC61968.AssetInfo`) form the stable, mandatory core.
- **Informative (`Inf`) packages** (`InfWork`, `InfAssetInfo`, `InfAssets`, `InfCustomers`, `InfSIPS`, etc.) are approved, ratified parts of IEC CIM, but optional for compliant implementations and subject to greater version and vendor drift.

Every package and class in the [CIM100 Explorer](/cim/) displays its tier explicitly so architects know immediately whether a class sits in the normative core or an informative package.

## Why the Design World Ignored CIM

Operations teams adopted CIM years ago for EMS, SCADA, and market exchange. In Europe, ENTSO-E mandates CIM-based exchange across 41 transmission system operators in 34 countries.

Design teams stayed in CAD and BIM tools. When utilities needed CIM data downstream, someone bolted a partial, error-prone CIM export onto the end of a project. The full CIM surface area looked intimidating, and traditional profiling workflows forced teams to hand-pick rigid subsets up front.

That is a tooling and productization failure, not a modeling failure. Publishing the complete IEC 61970 and IEC 61968 model as open OWL 2 ontologies alongside [`dotTC57`](/research/dottc57/) and [CIMBOLOGY-KG](/research/cimbology-kg/) brings CIM directly into design-time workflows from day one.
