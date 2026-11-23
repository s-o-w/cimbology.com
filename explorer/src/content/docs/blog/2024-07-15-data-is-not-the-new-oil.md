---
title: "Data Is Not the 'New Oil': It Is the Foundation We Keep Burying in Files"
date: 2024-07-15
authors:
  - shawn
tags:
  - cim
  - data-first
  - utility-design
  - digital-transformation
excerpt: "Utility data is nothing new. We already rely on it for every engineering decision, while scattering it across dozens of incompatible files and claiming IEC CIM is 'too hard.'"
---

*Adapted from my July 2024 post on utility data silos and IEC 61970 CIM.*

Data is not the "new oil" in the electric utility industry. It is the existing, ever-present foundation behind every engineering and operational decision we already make. The mystery is why we keep locking it away inside dozens of incompatible formats.

Look at how a typical utility scatters information about the exact same substation:

- Equipment specifications in Word and PDF folders
- Standard drawings and schematics in CAD and BIM binaries
- Asset registries in ERP and maintenance systems
- Topology and impedance models in separate study tools
- Project files buried in document management vaults

Once a project closes, those files sit untouched until the next retrofit. Years later, another team digs through old folders, struggles to reconcile conflicting revisions, gives up, and recreates the data from scratch.

## "CIM Is Too Hard" Usually Means "Change Is Hard"

The utility sector already has a shared international model designed to hold this together: **IEC 61970 / IEC 61968 CIM**. Yet the standard pushback in design rooms is always the same: *"CIM is too hard."*

CIM is not too hard. It is simply **not easy**:

- Auditing dozens of legacy file formats to find overlapping concepts takes discipline.
- Mining common definitions out of hundreds of disconnected spreadsheets and drawings takes patience.
- Looking at overlapping tools and asking *"why do we maintain both of these?"* creates organizational friction.
- Changing entrenched workflows across engineering, IT, and operations is genuinely hard work.

None of those are technical dead ends. They are willingness and tooling problems. Grounding utility design in [IEC CIM](/research/why-cim-matters/) and open [OWL 2 ontologies](/cim/) takes upfront effort, and it beats paying the manual re-entry tax on every project for the next twenty years.
