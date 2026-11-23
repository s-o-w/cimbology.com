---
title: Graph-Grounded AI for Power Systems
description: A pragmatic engineering position on LLMs, the naive RAG trap, context quality over model size, and why governed knowledge graphs are mandatory for utility AI.
---

I am not anti-AI. I am anti-hype. After twenty-plus years building enterprise systems, I have watched plenty of magic-bullet trends fail in production: NoCode platforms that still required code, enterprise configurators that collapsed under real requirements, and blockchain pitches searching for a problem.

Generative AI applied naively to electrical infrastructure belongs on that same warning list.

## Why Unconstrained LLMs Fail Engineering Workflows

LLMs are probabilistic text generators. On a substation where a wrong answer about protection coordination, phase identification, breaker interrupting rating, or clearance puts field crews and customers at risk, plausible text is a liability.

In the [CIMBOLOGY GraphRAG benchmark](/research/cimbology-graphrag/), a zero-context LLM scored **77.27%** on a 66-question PE exam. Seventy-seven percent looks convincing in a demo. The remaining 23% contains confident, untraceable errors on technical questions where getting it wrong breaks equipment or violates safety standards.

Adding basic vector search made it worse. Naive page-level RAG dropped accuracy to **53.03%**, twenty-four points below using no retrieval at all. Dumping PDF chunks into a vector database without domain structure actively feeds the model misleading context.

## Three Operating Principles

### 1. The Graph Is Ground Truth; the LLM Is the Interface

Stochastic models should never be the source of truth for physical infrastructure. The working architecture separates responsibilities cleanly:

- The **CIM-grounded knowledge graph** stores governed facts, topology, ratings, and provenance.
- The **LLM** translates between human intent and structured queries, then explains the returned facts with explicit entity and document citations.
- **W3C SHACL** validates structural and engineering rules deterministically at the model layer.

A query like *"show every breaker without a redundant protection path"* belongs in SPARQL over a validated graph, not in a prompt hoping an LLM read a PDF correctly.

### 2. Context Quality Beats Model Size

The PE exam benchmark proved this with numbers:

- Naive RAG (poor context): **53.03%**
- Advanced RAG (layout-aware parsing, table extraction, multimodal figure descriptions): **83.33%**
- CIM GraphRAG (Advanced RAG + structured CIM knowledge graph): **84.85%** with full citation traceability

A smaller model with structured retrieval beat a flagship model running naive RAG by more than 30 percentage points. Fixing upstream data structure delivers far more accuracy and reliability than waiting for a bigger model release.

### 3. Acceleration, Not Abdication

In software and ontology engineering, AI is an accelerator under strict expert direction. You do not chat casually with an AI agent and ship whatever comes back. You write a precise specification, verify outputs against compilers, automated tests, SHACL shapes, and adversarial code reviews, and own every line that ships.
