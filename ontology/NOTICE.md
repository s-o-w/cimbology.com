# Ontology Attribution & Regeneration Notice

## Standards & Third-Party Attribution

- **IEC TC57 Common Information Model (CIM — IEC 61970 / IEC 61968)**
  - The base CIM100 ontologies (`iec61970.{ttl,owl,jsonld}`, `iec61968.{ttl,owl,jsonld}`, `cim100.{ttl,owl,jsonld}`) and `cim-model.json` are generated from [`dotTC57`](https://github.com/s-o-w/dotTC57), derived from the IEC TC57 CIM UML model published by the UCA International Users Group (CIM User Group) under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0).
  - Canonical CIM term IRIs preserve the standard namespace `http://iec.ch/TC57/CIM100#`.
- **`dotTC57`**
  - Copyright (c) Shawn Weekly, licensed under the MIT License (`https://github.com/s-o-w/dotTC57`).
  - Source commit used for this export: `b72346e` (version `1.0.0`).

## Regenerating Hosted Ontologies

```bash
# 1. Regenerate IEC 61970, IEC 61968, CIM100 umbrella, and cim-model.json from dotTC57
dotnet run --project /path/to/dotTC57/dotTC57.OwlGenerator -c Release -- \
  generate --out ./ontology --base-uri https://cimbology.com/ontology/ --version 1.0.0 --commit <sha>

# 2. Verify all hosted ontology files offline
dotnet run --project /path/to/dotTC57/dotTC57.OwlGenerator -c Release -- \
  verify --dir ./ontology
```
