---
stepsCompleted: [1, 2, 3]
inputDocuments: ['docs/project.mdc']
session_topic: 'Indago MVP Scope — Due Diligence Checks & Build Prioritization'
session_goals: 'Define complete due diligence problem space, enumerate all checks, triage into MVP tiers'
selected_approach: 'ai-recommended'
techniques_used: ['First Principles Thinking', 'Morphological Analysis', 'Resource Constraints']
ideas_generated: []
context_file: 'docs/project.mdc'
---

# Brainstorming Session Results

**Facilitator:** Cole
**Date:** 2026-03-01

## Session Overview

**Topic:** Scoping the full universe of residential property due diligence checks for BC, then triaging into MVP (build for real) vs. simulate/mock for the Wealthsimple AI Builder demo.

**Goals:**
1. Define the complete problem space — what does thorough residential due diligence look like?
2. Enumerate a comprehensive list of due diligence checks a buyer should perform
3. Prioritize: which checks are real in the MVP, which are simulated, which are listed only

### Technique Selection

**Approach:** AI-Recommended Techniques
**Analysis Context:** Product scoping under extreme time pressure (demo due March 2), requiring both comprehensive problem understanding and ruthless prioritization.

**Recommended Techniques:**
- **First Principles Thinking:** Strip assumptions about due diligence, rebuild from fundamental property risks
- **Morphological Analysis:** Systematically enumerate all checks across risk categories and property variables
- **Resource Constraints:** Apply brutal MVP constraints to force prioritization

---

## Phase 1: First Principles Thinking

### Fundamental Question
> You're about to hand someone $500K-$2M. What do you actually need to verify to avoid catastrophic outcomes?

### Risk Taxonomy (9 Categories)

1. **You don't actually own what you think you're buying** — Title defects, liens, encumbrances, easements, boundary disputes, ALR status, severed subsurface/mineral rights
2. **The structure is not what it appears to be** — Hidden defects, deferred maintenance, code violations, hazardous materials
3. **The land itself is dangerous** — Flood plain, earthquake liquefaction, wildfire interface, landslide, soil contamination, radon
4. **Environmental legacy** — Former industrial use, dry cleaners, gas stations, dump sites. Contamination is invisible but liability is yours
5. **Land use restrictions you don't know about** — Zoning, OCP direction, ALR, heritage designation
6. **The financial picture is wrong** — Tax surprises, overvaluation, unaffordable insurance, special assessments
7. **The neighbourhood/context will change your quality of life** — Zoning changes, development, noise, schools, commute
8. **Regulatory/compliance surprises** — Unpermitted work, non-conforming use, rental restrictions, foreign buyer tax
9. **The transaction itself has risk** — Seller misrepresentation, agent conflicts, mortgage terms, closing cost surprises

### Key Insight: The AI's Core Cognitive Responsibility

The AI's value is NOT just fetching data. It's knowing the **complete landscape** of what to check, knowing **how each piece of information is obtained** (programmatic, manual lookup, who to ask and how), and **contextualizing results** so a buyer understands what a finding actually means for their decision.

### Data Acquisition Taxonomy

Three modes, each demonstrated by an MVP flow:
1. **Programmatic [P]** — API or scrape, AI fetches directly
2. **Manual Lookup [M]** — User goes to a website/portal, AI tells them exactly where and what to look for
3. **Ask Someone [A]** — User contacts a person; AI provides the exact questions, drafts communication, tracks responses

---

## Phase 2: Morphological Analysis — Complete Check Enumeration

### 1. Ownership & Title (15 checks)

| # | Check | Data Source (BC) | Mode |
|---|---|---|---|
| 1.1 | Title search — current owner, legal description | LTSA (myLTSA.ca) | [M] |
| 1.2 | Charges, liens, mortgages on title | LTSA title document | [M] |
| 1.3 | Easements & rights-of-way | LTSA title document | [M] |
| 1.4 | Covenants & building schemes | LTSA title document | [M] |
| 1.5 | Pending litigation (lis pendens) | LTSA title document | [M] |
| 1.6 | Subsurface / mineral rights | LTSA + BC Mineral Titles Online | [M] |
| 1.7 | ALR (Agricultural Land Reserve) status | ALC ALR maps | [P] or [M] |
| 1.8 | Survey / lot boundaries | LTSA survey plan | [M] |
| 1.9 | Strata: Form B (info certificate) | Strata management company | [A] |
| 1.10 | Strata: Form F (certificate of payment) | Strata management company | [A] |
| 1.11 | Strata: Depreciation report | Strata management company | [A] |
| 1.12 | Strata: Bylaws & rules review | Strata management company | [A] |
| 1.13 | Strata: Meeting minutes (2+ years) | Strata management company | [A] |
| 1.14 | Strata: Insurance certificate | Strata management company | [A] |
| 1.15 | Strata: Special assessments (past & pending) | Strata management company | [A] |

### 2. Physical Structure (14 checks)

| # | Check | Data Source (BC) | Mode |
|---|---|---|---|
| 2.1 | Home inspection (general) | HIABC certified inspector | [A] |
| 2.2 | Roof age & condition | Inspection / listing details | [AI] or [A] |
| 2.3 | Foundation & structural integrity | Inspection | [A] |
| 2.4 | Electrical system (panel, wiring type, capacity) | Inspection | [A] |
| 2.5 | Plumbing system (pipe material, age) | Inspection | [A] |
| 2.6 | HVAC system age & condition | Inspection / listing | [AI] or [A] |
| 2.7 | Asbestos assessment (pre-1990 buildings) | Specialist inspection | [A] |
| 2.8 | Lead paint (pre-1978 buildings) | Specialist inspection | [A] |
| 2.9 | Moisture / water intrusion (leaky condo era: 1985-2000) | Building envelope specialist | [A] |
| 2.10 | Septic system inspection (if applicable) | Specialist inspection | [A] |
| 2.11 | Well water quality (if applicable) | GWELLS + water test | [M] + [A] |
| 2.12 | Building permit history | Municipal building dept | [M] or [A] |
| 2.13 | Unpermitted work / renovations | Municipal records + inspection | [M] + [A] |
| 2.14 | Age of major systems (hot water, appliances) | Listing / inspection | [AI] |

### 3. Land & Natural Hazards (9 checks)

| # | Check | Data Source (BC) | Mode |
|---|---|---|---|
| 3.1 | Flood plain / floodway designation | PreparedBC / municipal maps | [P] or [M] |
| 3.2 | Earthquake zone & liquefaction risk | NRCan seismic hazard maps | [P] or [M] |
| 3.3 | Wildfire interface zone | BC Wildfire Service / FireSmart | [P] or [M] |
| 3.4 | Landslide / slope stability | Municipal geohazard maps | [M] |
| 3.5 | Radon levels (area risk) | BCCDC Radon Map | [P] or [M] |
| 3.6 | Tsunami zone (coastal properties) | PreparedBC | [M] |
| 3.7 | Soil type / geotechnical concerns | Municipal / provincial data | [M] |
| 3.8 | Drainage & grading | Visual inspection + municipal records | [A] |
| 3.9 | Climate change projections (sea level, fire risk trends) | BC Climate Explorer | [P] |

### 4. Environmental Legacy (5 checks)

| # | Check | Data Source (BC) | Mode |
|---|---|---|---|
| 4.1 | BC Site Registry (contaminated sites) | BC ENV Site Registry search | [P] or [M] |
| 4.2 | Historical land use (industrial, gas station, dry cleaner) | Municipal records / realtor | [A] |
| 4.3 | Underground storage tanks | Municipal fire dept records | [A] |
| 4.4 | Nearby industrial contamination sources | BC Site Registry (proximity search) | [P] or [M] |
| 4.5 | Endangered species / habitat designations | BC CDC Conservation Data | [M] |

### 5. Land Use & Zoning (9 checks)

| # | Check | Data Source (BC) | Mode |
|---|---|---|---|
| 5.1 | Current zoning designation | Municipal zoning maps/portal | [P] |
| 5.2 | Permitted uses under current zoning | Municipal bylaw | [P] or [AI] |
| 5.3 | Setback & lot coverage requirements | Municipal bylaw | [M] or [AI] |
| 5.4 | Development permit areas | Municipal OCP | [M] |
| 5.5 | OCP status, goals, and review timeline | Municipal website | [P] |
| 5.6 | Heritage designation | Municipal heritage registry | [M] |
| 5.7 | ALR restrictions (if in ALR) | ALC regulations | [AI] |
| 5.8 | Secondary suite / ADU potential | Municipal zoning bylaw | [AI] |
| 5.9 | Short-term rental restrictions | Municipal bylaw | [M] or [AI] |

### 6. Financial (10 checks)

| # | Check | Data Source (BC) | Mode |
|---|---|---|---|
| 6.1 | BC Assessment value (current + trend) | bcassessment.ca | [P] |
| 6.2 | Property tax amount & recent changes | Municipal tax records | [P] or [M] |
| 6.3 | Property Transfer Tax calculation | BC PTT rules | [AI] |
| 6.4 | First-time buyer PTT exemption eligibility | BC rules | [AI] |
| 6.5 | Newly built home PTT exemption | BC rules | [AI] |
| 6.6 | Spec tax / vacancy tax applicability | Municipal / provincial rules | [AI] |
| 6.7 | Home insurance availability & cost estimate | Insurance broker | [A] |
| 6.8 | Comparable recent sales | Realtor / public records | [P] or [A] |
| 6.9 | Rental income potential (if applicable) | Market data | [P] or [AI] |
| 6.10 | Upcoming special levies or local improvement charges | Municipal tax dept | [A] |

### 7. Neighbourhood & Context (8 checks)

| # | Check | Data Source (BC) | Mode |
|---|---|---|---|
| 7.1 | School catchment & ratings | School district maps | [P] |
| 7.2 | Crime statistics (area) | ICBC / municipal police data | [P] or [M] |
| 7.3 | Transit access & commute times | TransLink / BC Transit / Google Maps | [P] |
| 7.4 | Planned developments nearby | Municipal development applications | [M] or [A] |
| 7.5 | Noise sources (highway, airport, rail, industrial) | Maps + zoning | [AI] |
| 7.6 | Walkability / amenity access | Walk Score / Google Maps | [P] |
| 7.7 | Internet / connectivity options | ISP coverage maps | [P] or [M] |
| 7.8 | Community demographics & trends | Census data (StatsCan) | [P] |

### 8. Regulatory & Compliance (7 checks)

| # | Check | Data Source (BC) | Mode |
|---|---|---|---|
| 8.1 | Property Disclosure Statement (PDS) review | Seller / realtor | [A] |
| 8.2 | BCFSA disclosure requirements | BCFSA guidelines | [AI] |
| 8.3 | Foreign buyer restrictions / additional PTT | BC rules | [AI] |
| 8.4 | Rental restrictions (strata) | Strata bylaws | [A] |
| 8.5 | Pet / age restrictions (strata) | Strata bylaws | [A] |
| 8.6 | Building code compliance (current vs era-built) | Municipal building dept | [M] or [A] |
| 8.7 | Fire department inspection (if multi-unit) | Local fire dept | [A] |

### 9. Transaction Risk (6 checks)

| # | Check | Data Source (BC) | Mode |
|---|---|---|---|
| 9.1 | Subject clauses review | Contract / lawyer | [AI] + [A] |
| 9.2 | Closing cost estimation | Standard calculation | [AI] |
| 9.3 | Lawyer/notary engagement | Referral / search | [A] |
| 9.4 | Mortgage pre-approval status | Lender | [A] |
| 9.5 | Title insurance vs. surveyor's certificate | Lawyer / title insurer | [A] |
| 9.6 | Completion day logistics & adjustments | Lawyer | [A] |

---

## Phase 3: Resource Constraints — MVP Triage

### Tier 1: Fully Functional (Build for real)

**Flow A: Listing + Zoning + OCP + PTT [Programmatic]**
- User pastes realtor.ca URL
- App fetches listing, extracts property details
- AI identifies municipality, looks up zoning and OCP
- AI calculates PTT with exemption checks
- Generates sourced insights on permitted uses, ADU/STR, municipal planning direction
- Checks covered: 5.1, 5.2, 5.5, 5.8, 5.9, 6.3, 6.4, 6.5

**Flow B: Title Search Guidance + Document Parsing [Manual Lookup]**
- App provides PID and step-by-step LTSA instructions
- User uploads title PDF
- AI parses charges, liens, easements, covenants
- AI contextualizes each finding
- Checks covered: 1.1-1.5, 1.8

**Flow C: Property History Inquiry + Correspondence Tracking [Ask Someone]**
- AI determines who to contact about property history
- Provides contact info, drafts customizable email
- Trackable reference ID in subject, optional CC to app
- Checks covered: 4.1, 4.2, 4.3, 8.1

### Tier 2: Simulated (Functional UI, mocked data)

- **Natural Hazards** — Pre-populated risk scores for flood, earthquake, wildfire, radon
- **Financial (beyond PTT)** — BC Assessment value, comparable sales
- **Strata (if applicable)** — Sample Form B summary, depreciation report highlights

### Tier 3: Listed (Visible but inactive)

All remaining checks appear as categorized line items with check name, one-line "why this matters," and status "Not yet checked." Proves problem understanding without building depth.

### Future Vision: Know Your Neighbours

Stubbed section showing planned checks: adjoining property zoning, nearby development applications, distance to industrial/agricultural zones, adjacent lot ownership patterns, proximity analysis. Compelling talking point for the demo.

---

## Design Decisions

### Two Independent Layers
- **Property attributes drive which checks appear** — objective, based on type/age/location/water/strata
- **Buyer type drives how insights are prioritized** — same data, different framing and emphasis

### Question-First Report Structure
Section headers are plain-language buyer questions:
- "What am I allowed to do with this property?"
- "Do I actually own what I think I'm buying?"
- "Is this house safe to live in?"
- "What happened on this land before?"
- "Am I paying a fair price?"
- "Am I going to get hit with surprise costs?"
- "Is there anything wrong with the building?"
- "Can I rent this out or Airbnb it?"
- "What's the neighbourhood like?"
- "Is the deal itself sound?"

Each section shows the AI's current best answer (evolving as checks complete) with sources.

### Source Attribution at Three Levels
1. **Section answer** — cites all contributing sources
2. **Individual check** — specific data source, URL, retrieval timestamp
3. **AI inference** — explicitly states when interpreting, with "confirm with [authority]" guidance

### Wealthsimple Submission Mapping

| Requirement | Answer |
|---|---|
| What can the human now do? | See the complete due diligence picture and get contextualized, sourced answers to their actual questions |
| What is AI responsible for? | Knowing what to check, how to check it, and what findings mean |
| Where must AI stop? | The decision to buy, skip a check, or accept a risk |
| What breaks first at scale? | Data freshness, province-specific rule sets, liability if guidance is wrong |
