---
title: Timeline
description: How twenty-plus years of field layout, utility design systems, early digital twins, IEC CIM advocacy, dotTC57, GraphRAG, and the CIMBOLOGY Graph approach evolved into a data-first architecture.
---

The ideas behind **cimbology.com** did not start with generative AI or a single software framework. They grew out of more than twenty years of field layout, utility design systems architecture, early digital twins, standards committee work, and open-source software development. Every phase pushed toward the same goal: making electrical infrastructure data-first and grounded in IEC CIM.

## 2000–2004: Field Layout and the Cost of Bad Data

The core principle behind this work started on construction sites doing civil layout and surveying. Field crews took printed drawings out each morning, marked them up in the dirt, handed markups back to engineers, and waited for drafters to produce a new sheet the next day. Before laying out a single stake, the crew chief spent minutes to hours re-entering coordinates from a paper drawing into a total station.

The data was always the thing that mattered. The drawings were used to recreate data for the field crew, and then used to line the floorboard of the truck. Twenty years later, the same pattern still dominates substation and distribution design.

## 2010–2021: Utility Design Systems, Early Digital Twins, and SDSIC

Moving into electrical transmission and substation design systems at Southern Company exposed the same structural failure at enterprise scale: equipment identity, ratings, and topology lived inside CAD drawings, spreadsheets, and disconnected databases. A single 230 kV breaker moved across BIM, CAD, GIS, ADMS, and asset management, getting re-keyed four times under four naming conventions.

Over a decade of design-systems architecture (documented in my Oct 2020 five-part LinkedIn series *From There to Here* and summarized in [this retrospective post](/blog/2026-11-20-lessons-from-a-decade-of-utility-cad-standardization/)) and active participation in the **Substation Design Solutions Industry Consortium (SDSIC)** from 2015 onward (Technology Group Chair from Jan 2020 to Nov 2021), the work moved steadily from file standardization toward governed data and browser-based models:

- **Feb 19, 2021 ([*Notification Of Property Error*](https://youtu.be/kyYHQeZjGi4)):** Built a C# web-service-driven Autodesk Vault add-in enforcing database-editable metadata validation rules before files could advance lifecycle states, an early precursor to declarative SHACL validation gates.
- **Mar 26, 2021 ([*Substation Digital Twin IoT Dashboard*](https://youtu.be/_ZYxKIqL6aw)):** Demonstrated a live browser 3D substation model wired to customizable sensor telemetry (temperature, gas pressure, voltage) using the Forge Data Visualization API.
- **May 6, 2021 ([*Transmission Digital Twins: SDSIC Virtual Face to Face*](https://youtu.be/Ng4EsGP_rcU)):** Led a live SDSIC roundtable demo and discussion on practical transmission digital twins for utilities (part of the 12-video [*SDS Technology Group* YouTube playlist](https://youtube.com/playlist?list=PLDuw0ZskB4gwFWRTrBoOlq4TN8YYNZLGp)).
- **Aug 4, 2021 ([*Digital Transformation in Power Delivery*](https://youtu.be/CrMKJRy1p3Y)):** Presented a structured power-delivery digital transformation roadmap for the **2021 GenTech Conference**, building on earlier term-mapping translation layers, federated access, and service-bus integration patterns.
- **2021 (Autodesk University):** Presented [*Dig Deeper into Data with Forge and Digital Twins*](https://www.autodesk.com/autodesk-university/class/Dig-Deeper-Data-Forge-and-Digital-Twins-2021) and [*Connecting the Dots with Point Clouds, the AEC Collection, BIM 360, and Construction Cloud*](https://www.autodesk.com/autodesk-university/class/Connecting-Dots-Point-Clouds-AEC-Collection-BIM-360-and-Construction-Cloud-2021).

## 2022–2023: IEC CIM as the Design Substrate and Early RAG Work

First exposure to the IEC Common Information Model (IEC 61970 / IEC 61968) came through consortium discussions in 2020 and 2021. Reading the CIM UML for the first time produced an immediate reaction: *"Where have you been my whole career."* Approached as a software UML model rather than an electrical handbook, CIM already defines the international object hierarchy covering generation, transmission, distribution, protection, measurements, and enterprise assets.

Between 2022 and 2023, that position became public across articles, podcasts, and consortium talks:

- **Jan 30, 2022 (Public IEC CIM Advocacy):** Published my first LinkedIn call for adopting IEC CIM across utility software ("anything electrical could conceptually be mapped, from turbine to toaster, using CIM").
- **May 9, 2022 ([*BIM in the Utility Industry*](/blog/2022-05-09-bim-in-the-utility-industry/)):** Published on LinkedIn arguing that construction crews only need drawings on a truck hood while utilities, as 24/7 owners and operators, need accurate, queryable asset data across the entire lifecycle.
- **Jul 7, 2022 (IFC vs. IEC CIM):** Published a public comparison of buildingSMART IFC and EPRI/IEC CIM alongside the EPRI CIM Primer (8th ed.), challenging software engineers to build open design tooling on CIM.
- **Aug 2022 (POWER Engineers):** Authored *Connecting the Dots: Creating Your Digital Twin* on connecting BIM data with 2D and 3D utility assets.
- **Mar 6, 2023 ([SDSIC *PowerUp Podcast*](https://podcasts.apple.com/us/podcast/shawn-weekly-stops-by-to-talk-technology-with-us/id1669582312?i=1000603036604)):** Solo guest episode discussing SDSIC technology leadership and modernizing utility design systems (stepping into **SDSIC Innovation Committee Co-Chair** from Apr 2023 to May 2024).
- **Apr & Oct 2023 (SDSIC Nashville CIM Talk & First GraphRAG Idea):** Presented *IEC CIM for Electrical Utility Software Integration* at SDSIC Nashville and shared the deck publicly, framing IEC CIM as the utility industry's equivalent to IFC. During the 2023 consortium travel, I wrote my first prototype script parsing an XML/RDF CIM bay sample to render an SVG single-line diagram. On **Oct 17, 2023**, I publicly proposed storing IEC CIM RDF profiles in a queryable graph database to ground RAG queries on utility assets.
- **Nov 9, 2023 ([ACEC National *Engineering Influence*](https://www.youtube.com/watch?v=8tMtJ-1yRtg)):** Recorded *Real Stories of AI Implementation with POWER Engineers* alongside Nathan Bingham, discussing practical firm-wide AI deployment.
- **Dec 3, 2023 ([EnergyCentral: *Use RAG to Polish Your Chatbot*](https://energycentral.com/o/power-engineers-environmental/use-rag-polish-your-chatbot)):** Published my first external article on grounding engineering AI with Retrieval-Augmented Generation while launching the Digital Solutions group at POWER Engineers.

## 2024–2025: Knowledge Graphs, GraphRAG Benchmarks, and `dotTC57`

Hitting the practical limits of flat vector RAG on engineering documentation in 2024 pushed the architecture directly into semantic knowledge graphs, RDF, and OWL:

- **Feb 2024 (ACEC Indiana):** Co-presented virtually with Nathan Bingham on AI, ML, and RAG search at POWER Engineers.
- **Apr 2024 (SDSIC):** Presented *Beyond the Hype: Practical AI/ML for Power Delivery* on predictive maintenance, load forecasting, generative substation layout, data quality, and interpretable models.
- **May 24, 2024 (Canonical CIM Adapter Blueprint):** Drafted a modular adapter architecture normalizing SCADA, GIS, drawings, and asset feeds once into canonical IEC CIM profiles to power reusable digital twins, grid planning, maintenance, and AI services ([written up on this blog](/blog/2024-05-24-modular-adapters-over-canonical-cim/)).
- **Issue 2, 2024 ([ACEC *Engineering Inc.*: *"The AI Revolution"*](https://read.nxtbook.com/acec/engineering_inc/issue_two_2024/the_ai_revolution.html)):** Quoted alongside POWER Engineers leadership on using Generative AI to help engineers locate recommended equipment standards in a fraction of the time spent digging through document folders.
- **Jun–Jul 2024 (Ontotext GraphDB, Neo4j, and the `.NET` CIM Gap):** Asked the CIM LinkedIn community (Jun 14, 2024) for an open-source `.NET` CIM object/RDF library and confirmed none existed, planting the seed for `dotTC57`. Completed formal Ontotext Academy GraphDB, RDF, and SPARQL training ([Certificate 1](https://lms-academy.ontotext.com/app/certificate/c95e74b2-775f-4740-9d9f-bec52d052220), [Certificate 2](https://lms-academy.ontotext.com/app/certificate/26b180c7-9d01-4bea-aae0-b391acaf9e15)), loaded IEC 61970 RDF and OWL ontologies into **Neo4j** and **Ontotext GraphDB**, and shared generated single-line visualizations with electrical engineers for review (Jul 23–30, 2024).
- **Oct 2024 (Local GraphRAG on CIM UML):** Ran multi-day local GraphRAG experiments directly over IEC 61970 CIM UML models while articulating CIM as an RDF graph and OWL semantic layer for utilities.
- **Dec 11, 2024 ([EnergyCentral: *Building a Better Generative AI*](https://energycentral.com/o/power-engineers/building-better-generative-ai%E2%80%94how-knowledge-graphs-will-improve-our-rag-powered)):** Published how Knowledge Graphs address the structural weaknesses of vector-only RAG for engineering chatbots.
- **Dec 2024 – Jan 2025 (SDSIC *PowerUp Podcast* AI Series):** Joined a four-episode industry roundtable on AI in the electric utility space ([Ep. 1](https://podcasts.apple.com/us/podcast/episode-1-of-our-3-episode-series-on-ai-in-the/id1669582312?i=1000678972870), [Ep. 2](https://podcasts.apple.com/us/podcast/episode-2-of-our-3-episode-series-on-ai-in-the/id1669582312?i=1000683802973), [Ep. 3](https://podcasts.apple.com/us/podcast/episode-3-of-our-3-part-series-on-ai-in-the/id1669582312?i=1000687532663), [Bonus](https://podcasts.apple.com/us/podcast/bonus-episode-from-our-series-on-ai-in-the-electric/id1669582312?i=1000687533570)).
- **Jul 18, 2025 ([`dotTC57`](/research/dottc57/) Open-Source Release):** Published the MIT-licensed .NET implementation of IEC 61970 and IEC 61968 CIM on [GitHub](https://github.com/s-o-w/dotTC57) and [NuGet](https://www.nuget.org/packages/dotTC57), giving developers full UML coverage instead of narrow hand-picked profiles.
- **Sep – Nov 2025 (`cimbology.com` Launch, ACEC Panel, Six-Part CIM/KG Series, and GraphRAG Benchmark):** Launched **cimbology.com** on Sep 5, 2025; spoke on [*Data-Driven Power Plays*](https://www.youtube.com/watch?v=_olDvmxZDqU) for ACEC Fall Conference (San Diego); published YouTube demos of the CIMBOLOGY GraphRAG prototype ([Oct 2, 2025](https://youtu.be/UzrtFiLiV44) and [Nov 20, 2025](https://youtu.be/c83Repi2ni8)); published a six-part LinkedIn technical series on CIM as a native RDF knowledge graph ([adapted on this blog](/blog/2025-11-24-stop-jamming-the-grid-into-sql-tables/)); and recorded the TonicDM *To Build Is Human* podcast episode [*"Ground Truth Before Design"*](https://gablmedia.com/ground-truth-before-design) covering utility ground truth, digital twins, and RAG + Knowledge Graphs over IEC/IEEE/ANSI standards.

Testing four retrieval architectures against 66 questions from a 2025 Professional Engineering (PE) exam using 2017-era engineering standards produced clear empirical results (full write-up in [CIMBOLOGY GraphRAG Research](/research/cimbology-graphrag/)):

| Approach | Accuracy | Traceability |
|---|---|---|
| Naive RAG (page-level vector search) | 53.03% | None |
| Baseline LLM (zero context) | 77.27% | None |
| Advanced RAG (layout-aware chunking + tables + multimodal) | 83.33% | Partial |
| **CIM GraphRAG (GraphDB + Qdrant + Semantic Kernel)** | **84.85%** | **Full** |

## 2026: CIMBOLOGY Graph Architecture and Open Hosted CIM100 Ontologies

In 2026, the work expanded into the **[CIMBOLOGY Graph approach](/research/cimbology-graph/)**: an open, platform-agnostic semantic design architecture built directly on W3C standards (OWL 2, Turtle, JSON-LD, SHACL, SPARQL, and named graphs). Moving from RDF/XML to Turtle for ontology authoring and JSON-LD for instance exchange solved the last web-integration friction: once JSON-LD entered the picture, everything clicked into place.

Current open artifacts hosted directly on this site:

- **Full IEC 61970 & IEC 61968 OWL 2 ontologies** generated programmatically from `dotTC57` (`1,414` top-level CIM types across `77` packages, preserving canonical `http://iec.ch/TC57/CIM100#` IRIs and explicit Normative vs. Informative tier annotations).
- **[CIM100 Explorer](/cim/)**: a searchable, browsable web reference exposing every IEC 61970 and IEC 61968 class, package, datatype, enumeration, inheritance chain, and class diagram directly on `cimbology.com`.
