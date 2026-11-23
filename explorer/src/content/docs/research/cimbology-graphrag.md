---
title: CIMBOLOGY GraphRAG Research (2024–2025)
description: Empirical research evaluating whether combining an IEC CIM knowledge graph with layout-aware RAG produces verifiable, high-accuracy engineering answers on a PE exam benchmark.
---

Between 2024 and 2025, I built **Cimbology** as an independent research prototype to test one concrete hypothesis: can combining an IEC CIM-grounded Knowledge Graph with layout-aware Retrieval-Augmented Generation (GraphRAG) outperform both baseline LLMs and vector-only RAG on real electrical engineering questions while providing full citation traceability?

- **Recorded Demos:** [*Cimbology Demo: The AI "Digital Senior Engineer"*](https://youtu.be/UzrtFiLiV44) (Oct 2, 2025) and [*Cimbology Research Demo*](https://youtu.be/c83Repi2ni8) (Nov 20, 2025)
- **Background Writing:** [*Use RAG to Polish Your Chatbot*](https://energycentral.com/o/power-engineers-environmental/use-rag-polish-your-chatbot) (EnergyCentral, Dec 2023), [*Building a Better Generative AI with Knowledge Graphs*](https://energycentral.com/o/power-engineers/building-better-generative-ai%E2%80%94how-knowledge-graphs-will-improve-our-rag-powered) (EnergyCentral, Dec 2024), and [From Vector RAG to Knowledge Graphs](/blog/2025-11-20-from-vector-rag-to-knowledge-graphs/)

## The Retiring Expert Problem

Utilities and engineering firms lose decades of institutional knowledge every time senior physical designers and protection-and-control engineers retire. Those teams leave behind thousands of PDFs, specifications, standards, and drawings in SharePoint, ProjectWise, Autodesk Vault, and file shares. Document management systems preserve files, but they do not preserve the semantic relationships needed to navigate and apply them accurately.

## System Architecture

Cimbology paired a semantic RDF triplestore (**GraphDB** loaded with IEC 61970/61968 CIM semantics and queried via SPARQL) with a vector database (**Qdrant** storing layout-aware chunks, extracted tables, and multimodal image descriptions), orchestrated in **.NET** using **Semantic Kernel** and **dotNetRDF**.

<pre class="mermaid">
graph TB
  User["User / Engineer"] --> WebUI["Web Interface (HTML / AlpineJS)"]
  User --> AutoCAD["AutoCAD Plugin (WPF / .NET)"]
  WebUI --> API["API Gateway (ASP.NET Core)"]
  AutoCAD --> API
  API --> QS["Query Service (Semantic Kernel)"]
  QS --> KG["SPARQL Service"]
  QS --> VS["Vector Search Service"]
  KG --> GraphDB[("GraphDB (RDF Triplestore / CIM)")]
  VS --> Qdrant[("Qdrant (Vector DB)")]
  QS --> LLM["LLM Provider (Azure OpenAI / Gemini)"]
  LLM --> Response["Grounded Answer + Citations"]
  Response --> API
  API --> SQLite[("SQLite Session Store")]
</pre>

### Key Architectural Choices

- **Hybrid storage (GraphDB + Qdrant):** Structured equipment and standards relationships belong in an RDF graph; unstructured narrative prose and tables belong in a vector index.
- **dotNetRDF + CIM:** Working with CIM in its native RDF/OWL form enables SPARQL traversal and inference rather than brittle keyword heuristics.
- **Semantic Kernel:** Keeps LLM providers swappable across Azure OpenAI, Google Gemini, and local models without locking orchestration logic to one vendor.

## Benchmark Methodology

To avoid toy demos, I purchased a 2025 Professional Engineering (PE) practice exam (66 questions) and evaluated four retrieval configurations against a corpus of 2017-era electrical engineering standards documents. Answering 2025 exam questions from older standards forces the system to synthesize concepts and engineering relationships rather than matching memorized phrasing.

## Measured Results

| # | Approach | Retrieval / Stack | Accuracy | Citation Traceability | Verdict |
|---|---|---|---|---|---|
| 1 | **Baseline LLM (No RAG)** | Zero external context | **77.27%** | None | Confident black box; unusable for safety-critical engineering |
| 2 | **Naive RAG** | Page-level embeddings + vector search | **53.03%** | None | 24 points worse than no RAG; actively harmful |
| 3 | **Advanced RAG** | Layout-aware chunking + table extraction + multimodal descriptions | **83.33%** | Partial | Proved context quality dominates retrieval accuracy (+30 points over Naive RAG) |
| 4 | **CIM GraphRAG** | Advanced RAG + GraphDB CIM knowledge graph reasoning | **84.85%** | **Full** | Highest accuracy plus verifiable graph and document citations |

## Core Research Findings

1. **Naive RAG is dangerous in engineering domains.** Dropping page chunks into a vector store degraded accuracy from 77.27% to 53.03%. Bad retrieval actively misleads the model.
2. **Context quality beats model size.** Layout-aware parsing, table extraction, and multimodal figure descriptions added more than 30 percentage points over naive chunking.
3. **Structure creates trust.** Layering the CIM knowledge graph delivered the highest score (84.85%) and turned opaque model output into traceable answers backed by explicit entities, relationships, and source citations.
4. **Graphs belong at design time.** Reconstructing semantic structure from finished PDFs works, but capturing data as a CIM-grounded graph from the start is the real architectural fix. That conclusion directly drove [CIMBOLOGY-KG](/research/cimbology-kg/).
