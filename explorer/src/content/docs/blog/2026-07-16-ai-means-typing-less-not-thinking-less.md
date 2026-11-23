---
title: "AI Means Typing Less, Not Thinking Less"
date: 2026-07-16
authors:
  - shawn
tags:
  - ai
  - utility-design
  - architecture
excerpt: "Using AI tooling every day cuts syntax pecking, increases architectural thinking, and exposes why power-delivery design still needs semantic data foundations before automation scales."
---

*Adapted from my July 2026 note on AI-assisted software and engineering work.*

I use AI tooling every day to build software now. My job is no easier than it was two years ago. I just type a lot less.

I spend far less time hunting through syntax or tracking down boilerplate. I spend at least as much time thinking through the domain problem, defining the architecture, and verifying the logic of the solution. If anything, I spend *more* time thinking, because directing a fast, literal coding assistant forces you to make every assumption, interface boundary, and verification rule explicit up front.

The engineer still thinks, still solves, still verifies, and still owns every line that ships.

## What This Means for Power Delivery Automation

The same reality applies directly to electrical utility design. Anyone promising push-button AI automation of full substation or transmission design today is skipping the foundation.

You can automate low-hanging clerical tasks quickly. Real engineering automation across substations, protection schemes, and distribution networks hits a hard wall until the underlying data is standardized, semantically typed, and machine-verifiable:

- Open domain schemas grounded in [IEC CIM](/cim/) rather than ad-hoc spreadsheets and CAD blocks
- Deterministic validation rules (W3C SHACL) checking engineering invariants before anything ships
- Grounded graph retrieval with full citation traceability ([CIMBOLOGY GraphRAG](/research/cimbology-graphrag/))

AI accelerates teams that already understand the domain and invest in clean data foundations. Without that foundation, faster generation just produces plausible mistakes faster.
