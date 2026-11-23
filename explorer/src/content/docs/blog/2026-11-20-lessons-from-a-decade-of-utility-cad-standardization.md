---
title: "From CAD Standards to Connected Graphs: Lessons From a Decade of Utility Design Systems"
date: 2026-11-20
authors:
  - shawn
tags:
  - utility-design
  - digital-twins
  - cad
  - sdsic
  - cimbology-graph
excerpt: "Synthesizing ten years of transmission and substation design standardization, rules-based Vault validation, and early Forge digital twins (2011 to 2021), and why file-centric systems hit a hard ceiling."
---

Before IEC CIM ontologies, before GraphRAG, and before JSON-LD, the path to the **CIMBOLOGY Graph** approach started inside a ten-year effort to standardize transmission and substation design across four utility operating companies, more than 3,000 active system users, and 300+ engineers, designers, and drafters.

In October 2020, I documented that journey in a five-part LinkedIn article series titled *From There to Here*, following an earlier March 2019 article (*Requirements by User - NOT by Proxy*). In early 2021, while chairing the **SDSIC Technology Group**, I recorded a twelve-video YouTube playlist ([*SDS Technology Group*](https://youtube.com/playlist?list=PLDuw0ZskB4gwFWRTrBoOlq4TN8YYNZLGp)) and presented two **Autodesk University 2021** classes showing what those systems looked like in production.

Looking back across that decade, five architectural lessons still govern everything I build today.

## 1. Standards Come Before Tools

In 2012, the first step was not buying shiny software. It was convening subject-matter experts across five design disciplines (Physical, Protection & Controls, Civil, Structural, and Transmission Line) across four separate operating companies to agree on a minimum shared baseline, isolating state and local deviations into explicit addendums, and getting formal leadership sign-off.

Without shared standards, every new software tool simply automates four incompatible ways of doing the same work faster.

## 2. Requirements Come From Users, Not Proxies

Developers, managers, and software salespeople are proxies for the people doing design work every day. Each handoff through a proxy bends a requirement slightly away from field reality. The only reliable gauge of engineering software quality is whether working designers trust and adopt it, which happens when you build directly alongside them.

## 3. Decouple Custom Automation From Tool Versions

Between 2013 and 2017, our team built `.NET` AutoCAD and Inventor add-ins, standard titleblock data-capture tools, wiring annotation utilities, automated deployments, and a custom `.NET` REST API bridging a legacy document management database, Autodesk Vault, and upstream enterprise systems of record (bills of material, estimates, and maintenance data).

Two survival rules emerged the hard way:

- Never hard-code automation tightly to one CAD version or one vendor's internal quirks.
- Let upstream and downstream systems exchange governed data through explicit service contracts instead of scraping drawing text.

## 4. Validation Rules Belong in Declarative Services, Not Checklists

In February 2021, I published a short demo of a C# Autodesk Vault add-in called [*Notification Of Property Error*](https://youtu.be/kyYHQeZjGi4). Rather than relying on reviewers to catch missing metadata by eye, the add-in called a web service backed by database-editable validation rules and blocked lifecycle transitions until required properties passed, returning clear, actionable error messages.

That 2021 pattern is the direct ancestor of **W3C SHACL validation profiles** in the [CIMBOLOGY Graph architecture](/research/cimbology-graph/). The medium upgraded from proprietary Vault properties to open RDF graphs, while the engineering principle stayed identical: enforce data completeness and rules automatically at the model boundary.

## 5. 3D Scans and Browser Digital Twins Expose the File Ceiling

By spring 2021, our demos moved past static drawings into browser-native 3D models and live telemetry:

- [*Substation Digital Twin IoT Dashboard*](https://youtu.be/_ZYxKIqL6aw) (Mar 2021): binding customizable sensor streams (temperature, gas pressure, voltage) directly onto a 3D substation model in the browser using Autodesk Forge.
- [*Transmission Digital Twins (SDSIC May 2021)*](https://youtu.be/Ng4EsGP_rcU) and [*The 5 day Substation Model*](https://youtu.be/SghQ3Ik-SmE): combining laser scans and photo capture to build interactive browser-accessible substation as-builts in under a week.
- [*Autodesk University 2021*](https://www.autodesk.com/autodesk-university/class/Dig-Deeper-Data-Forge-and-Digital-Twins-2021) and [*Digital Transformation in Power Delivery*](https://youtu.be/CrMKJRy1p3Y) (Aug 2021): mapping the full technology chain from capture to operations.

Those projects proved what was possible, and they also exposed the hard ceiling of file-centric architecture. Even with Vault, REST APIs, and 3D viewers, the electrical meaning of a substation still lived scattered across proprietary binaries and custom translation code.

That ceiling is why discovering the **IEC Common Information Model (CIM)** in 2020 and 2021 hit so hard. Once design data is born as an open, semantically typed graph grounded in [IEC 61970 and IEC 61968](/cim/), drawings, 3D views, bills of material, and digital twins all become projections of one governed source of truth.
