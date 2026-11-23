---
title: "From Vector RAG to Knowledge Graphs: What Changed Between 2023 and 2025"
date: 2025-11-20
authors:
  - shawn
tags:
  - graphrag
  - knowledge-graphs
  - cim
  - ai
  - rag
excerpt: "Tracing two years of production AI work and empirical testing in electrical engineering: from a Dec 2023 RAG article to Ontotext GraphDB, a Dec 2024 Knowledge Graph thesis, and a 66-question PE exam benchmark."
---

Between late 2023 and late 2025, my position on applying Large Language Models to electrical engineering shifted from optimism about Retrieval-Augmented Generation (RAG) to a hard architectural requirement: **vector search alone is not safe for engineering work, and governed knowledge graphs are mandatory.**

That shift did not come from reading hype threads. It came from building production systems, publishing the progression as it happened, and finally measuring four retrieval architectures head-to-head on a Professional Engineering (PE) practice exam.

## Late 2023: Operationalizing AI and Polishing the Chatbot With RAG

In November 2023, Nathan Bingham and I sat down with **ACEC National** for [*Real Stories of AI Implementation with POWER Engineers*](https://www.youtube.com/watch?v=8tMtJ-1yRtg) to discuss building firm-wide AI tools for engineering teams. A few weeks later, in December 2023, while launching the Digital Solutions group at POWER Engineers, I published [*Use RAG to Polish Your Chatbot: Retrieval-Augmented Generation Improves the "I" in AI*](https://energycentral.com/o/power-engineers-environmental/use-rag-polish-your-chatbot) on EnergyCentral. At that point, the immediate problem was obvious: out-of-the-box LLMs hallucinate confidently on utility standards and firm-specific procedures. Grounding prompts with retrieved internal documents was the first essential step.

In Issue 2 of ACEC's *Engineering Inc.* in 2024 ([*"The AI Revolution"*](https://read.nxtbook.com/acec/engineering_inc/issue_two_2024/the_ai_revolution.html)), I explained the practical driver plainly: *"It is expensive to have designers and engineers digging through folders full of documentation to find specific equipment that's recommended by the industry for a given set of variables."*

## Mid-2024: Hitting the Ceiling of Flat Vector Chunks

Once engineers began asking real multidisciplinary questions against large libraries of PDFs, specifications, and tables, flat vector RAG broke down in predictable ways:

- Page-level chunking shredded multi-column engineering tables and severed footnotes from the values they qualified.
- Vector similarity retrieved text that *sounded* related without understanding electrical topology, equipment class hierarchies, or regulatory scope.
- When retrieval pulled the wrong paragraph, the LLM blended bad context with confident prose and produced answers worse than using no retrieval at all.

In July 2024, I went deep on semantic web tooling, completing two **Ontotext Academy** certifications in GraphDB, RDF, and SPARQL ([Certificate 1](https://lms-academy.ontotext.com/app/certificate/c95e74b2-775f-4740-9d9f-bec52d052220), [Certificate 2](https://lms-academy.ontotext.com/app/certificate/26b180c7-9d01-4bea-aae0-b391acaf9e15)), and began wiring IEC CIM semantics into RDF triplestores.

## December 2024 – January 2025: Making the Case for Knowledge Graphs

By December 2024, the architectural direction was clear enough to put in print. I published a follow-up on EnergyCentral: [*Building a Better Generative AI: How Knowledge Graphs Will Improve Our RAG-Powered Chatbot*](https://energycentral.com/o/power-engineers/building-better-generative-ai%E2%80%94how-knowledge-graphs-will-improve-our-rag-powered). Around the same time (December 2024 through January 2025), I joined utility peers across a four-episode **SDSIC *PowerUp Podcast*** series on AI in the electric utility space ([Episode 1](https://podcasts.apple.com/us/podcast/episode-1-of-our-3-episode-series-on-ai-in-the/id1669582312?i=1000678972870), [Episode 2](https://podcasts.apple.com/us/podcast/episode-2-of-our-3-episode-series-on-ai-in-the/id1669582312?i=1000683802973), [Episode 3](https://podcasts.apple.com/us/podcast/episode-3-of-our-3-part-series-on-ai-in-the/id1669582312?i=1000687532663), and [Bonus Episode](https://podcasts.apple.com/us/podcast/bonus-episode-from-our-series-on-ai-in-the-electric/id1669582312?i=1000687533570)), hammering the same theme: AI in power delivery needs governed domain structure, data privacy, and deterministic verification.

## Fall 2025: Putting Real Numbers on the Thesis

Opinions are cheap; benchmarks settle arguments. In 2025 I built the independent **Cimbology** prototype (combining **GraphDB** with IEC CIM semantics, **Qdrant** for layout-aware document/table/image retrieval, and **.NET Semantic Kernel**) and recorded public demos ([Oct 2, 2025](https://youtu.be/UzrtFiLiV44) and [Nov 20, 2025](https://youtu.be/c83Repi2ni8)).

Evaluating four configurations against 66 questions from a 2025 PE practice exam over 2017-era electrical engineering standards settled the question:

| Configuration | Accuracy | Citation Traceability |
|---|---|---|
| **Naive RAG** (page-level chunks, Gemini 2.5 Pro) | **53.03%** | None |
| **Baseline LLM** (zero context, GPT-5-Mini) | **77.27%** | None |
| **Advanced RAG** (layout-aware + tables + multimodal, GPT-5-Mini) | **83.33%** | Partial |
| **CIM GraphRAG** (Advanced RAG + GraphDB CIM graph, GPT-5-Mini) | **84.85%** | **Full** |

Three takeaways came straight out of those numbers:

1. **Naive RAG actively makes engineering AI worse.** Dropping raw page chunks into a vector database cut accuracy 24 points below asking the model cold.
2. **Context structure beats model size.** A smaller model fed layout-aware retrieval and structured graph relationships beat a flagship model running naive RAG by more than 30 percentage points.
3. **Reconstructing structure from finished PDFs is still treating the symptom.** The real fix is capturing substation and grid design data as a validated IEC CIM knowledge graph from day one, so engineers and AI tools query governed facts directly instead of parsing dead documents.

Full benchmark architecture and results are documented under [CIMBOLOGY GraphRAG Research](/research/cimbology-graphrag/), and the resulting open design substrate lives in [CIMBOLOGY-KG](/research/cimbology-kg/).
