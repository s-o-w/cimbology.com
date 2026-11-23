---
title: "BIM in the Utility Industry"
date: 2022-05-09
authors:
  - shawn
tags:
  - bim
  - utility-design
  - digital-transformation
  - data-first
excerpt: "Originally published on LinkedIn in May 2022. Why construction crews only need drawings on a truck hood, while utilities as 24/7 owners and operators need accurate, queryable asset data."
---

*Originally published as a LinkedIn article on May 9, 2022. Archived here lightly edited for web formatting, with a short 2026 note at the bottom showing how this argument led directly to IEC CIM and CIMBOLOGY-KG.*

In my opinion, BIM is a sort of nebulous topic for us in the utility industry. We can see the benefits that our peers in the AEC space are gaining, but we aren't quite sure how to get there from our side. Some of that comes down to how the utility industry operates versus how the AEC industry operates. I also think vendors creating these tools need some education on how utilities actually work. Armed with that information, perhaps we can start seeing tools tailored to the specific needs of our industry.

Many, if not most, utility teams are still focused on producing 2D drawings for the construction crews that build utility infrastructure. That is a well-established process: engineer changes to an existing substation or line, draft or modify the existing drawings, transmit the drawings, and move on to the next job. There is no perceived need for 3D or "smart" assets because construction has drawings and a truck hood to roll them out on.

Frankly, in a lot of cases construction does not even need the drawings. These crews are professionals who know how to get power flowing and keep it flowing. Construction is certainly not worried about the fields in the titleblock beyond the title that tells them which sheet they are holding. So why bother with BIM if construction does not ask for it?

## Utilities Are Owners and Operators, Not Just Builders

The answer lies in the other role utilities fill. Utility companies are owners and operators of an extremely complex, dangerous, and life-sustaining system: the power grid. When we optimize strictly for issuing 2D sheets to construction, we leave out a huge group of internal customers who operate and maintain that infrastructure 24 hours a day, 7 days a week, through every kind of weather.

Operations and maintenance teams need real answers to concrete questions:

- What project was specific work performed under? (Query the project management system.)
- What material was ordered, and is there a shortage or long lead time? (Lookups from asset and material tracking.)
- What assets are physically located at a given substation? (Reports stitched together from bills of material.)
- How close is the fence to a particular breaker so crews know whether a crane can fit during a breaker swap? (An accurate 3D model answers this immediately.)
- Is there a protected species or environmentally restricted area in a proposed transmission right of way that forces a reroute? (GIS answers this.)

Design teams need much of this same information because it affects the deliverables going out the door. Right now design uses a multitude of disconnected processes to gather it. "Multitude" translates directly to "inefficient."

## When Drawings Drift From Ground Truth

Even for construction, the 2D workflow only holds up as long as the drawings are accurate. Anyone who has worked in utility design knows how often drawings drift from field reality.

The simplest explanation is that drawings were not checked well enough. The bigger root cause is that most utilities do not maintain accurate as-built data for their substations. We fly LiDAR on transmission lines, rarely at substation-grade accuracy, so substation teams rely on previous drawing revisions and digital camera photos from site visits. Designers pull photos off a camera, compare them against 2D sheets, and make educated guesses. If an observed discrepancy sits outside the current project scope, the old drawing probably never gets updated.

Experienced construction crews work around bad drawings until they hit something that does not match. Then work stops while someone drives out of a dead zone to find cell signal and call an engineer. That burns real money, and with a less experienced crew, inaccurate information becomes a direct safety hazard.

## What BIM Should Mean for Utilities

BIM does not have to mean handing a field crew a 3D model on a tablet and expecting them to build off it. What BIM should mean is accurate, governed asset information living right alongside the physical asset across every phase of its lifecycle. Operations can operate, maintenance can maintain, design can design, and construction can construct, all working from the same current data instead of re-keying static sheets.

We also need software vendors who actually understand how utility engineering works. None of the existing tools deliver a complete solution on their own, and no single vendor understands the entire utility lifecycle well enough to force everyone into one closed box. We need tools built around how power delivery actually operates, with open automation and integration across the whole stack.

---

### 2026 Note

Re-reading this four years later, the problem statement has not moved an inch. What changed was discovering the exact data layer that fills the gap I was describing here: the **IEC Common Information Model (IEC 61970 / IEC 61968)** expressed as an open RDF/OWL knowledge graph. Instead of hoping one CAD or BIM vendor builds an all-in-one utility tool, the asset data itself becomes an open semantic graph ([CIMBOLOGY-KG](/research/cimbology-kg/)) grounded in [IEC CIM](/cim/), and every CAD, BIM, GIS, and operations tool reads and writes against that shared contract.
