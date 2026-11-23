---
title: "Most 'Digital Twins' Are Just Visual Models"
date: 2023-09-22
authors:
  - shawn
tags:
  - digital-twins
  - utility-design
  - bim
  - sdsic
excerpt: "Most utility 'digital twins' are glorified 3D snapshots. Four concrete tests separate an interactive picture from an actual digital twin."
---

*Adapted from my September 2023 post on utility digital twins.*

The term "digital twin" gets used loosely across the utility and AEC industries. Most of what gets demoed under that label is really a visual model, a visual twin, or a point-in-time snapshot.

A 3D model of a substation or transmission line with click-to-inspect properties has real value. It beats guessing from faded 2D sheets and digital camera photos. That still does not make it a digital twin.

## Four Tests for a Real Digital Twin

If a system claims to be a digital twin of physical electrical infrastructure, it needs to clear four concrete bars:

1. **The model updates when the physical station changes.** Swap out a circuit breaker in the yard, and the new breaker and its ratings need to show up in the twin without a manual CAD rebuild six months later.
2. **It supports real-time simulation or operational interaction.** A twin either simulates live operating conditions accurately or ties directly into how operators run the asset.
3. **Geometric and engineering accuracy holds where it matters.** Precision down to the centimeter wherever clearances, crane access, or physical fit govern real field decisions.
4. **Live or near-real-time telemetry feeds the model.** Sensor and operational data flows in continuously so the twin can analyze trends and trigger condition-based maintenance rather than sitting static.

If a system misses those four criteria, call it what it is: a visual representation of a real-world asset, a snapshot in time not far removed from a Polaroid picture.

## Why Semantics Come Before 3D

Building a visual model is a graphics problem. Building a true digital twin is a **data architecture** problem. Until equipment identity, electrical topology, ratings, and telemetry share a governed semantic substrate (like [IEC CIM](/cim/) and the [CIMBOLOGY Graph approach](/research/cimbology-graph/)), every 3D model starts decaying into a stale snapshot the day after commissioning.
