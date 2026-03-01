# Indago — UI Design Specification for Figma

## Brand & Visual Identity

**App Name:** Indago
**Tagline:** Property due diligence, guided by AI.
**Personality:** Calm, trustworthy, approachable. Like a knowledgeable friend who happens to know everything about buying property in BC.

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| Primary | #0D9488 (teal-600) | CTAs, active states, accent bars, key findings |
| Primary Light | #CCFBF1 (teal-50) | Highlighted insight backgrounds, selected states |
| Primary Dark | #0F766E (teal-700) | Hover states, header bar |
| Background | #FAFAFA | Page background |
| Surface | #FFFFFF | Cards, panels |
| Border | #E5E7EB (gray-200) | Card borders, dividers |
| Text Primary | #1F2937 (gray-800) | Headings, body text |
| Text Secondary | #6B7280 (gray-500) | Captions, timestamps, source citations |
| Text Muted | #9CA3AF (gray-400) | Inactive items, placeholders |
| Status Complete | #10B981 (emerald-500) | Complete badges, check icons |
| Status In Progress | #F59E0B (amber-500) | In progress badges, spinner |
| Status Not Started | #D1D5DB (gray-300) | Not started badges |
| Status Needs Input | #3B82F6 (blue-500) | Needs user action badges |
| Status Awaiting | #8B5CF6 (violet-500) | Awaiting response badges |
| Status Flagged | #EF4444 (red-500) | High risk, warnings |
| Risk Low | #10B981 | Low risk indicators |
| Risk Medium | #F59E0B | Medium risk indicators |
| Risk High | #F97316 (orange-500) | High risk indicators |
| Risk Very High | #EF4444 | Very high risk indicators |

### Typography

| Style | Font | Weight | Size | Usage |
|---|---|---|---|---|
| H1 | Inter | 700 | 24px / 1.2 | Page titles |
| H2 | Inter | 600 | 20px / 1.3 | Section headers (buyer questions) |
| H3 | Inter | 600 | 16px / 1.4 | Check names, card titles |
| Body | Inter | 400 | 14px / 1.5 | Body text, descriptions |
| Body Small | Inter | 400 | 12px / 1.4 | Source citations, timestamps, captions |
| Label | Inter | 500 | 12px / 1.2 | Badge text, status labels |
| Mono | JetBrains Mono | 400 | 13px | Reference IDs, PIDs |

### Spacing Scale

8px base unit. Use multiples: 4, 8, 12, 16, 20, 24, 32, 40, 48.
- Card padding: 16px (mobile), 24px (desktop)
- Section gap: 16px
- Element gap within card: 12px
- Page margin: 16px (mobile), 24px (tablet), max-width 768px centered (desktop)

### Border Radius

- Cards: 12px
- Buttons: 8px
- Badges: 6px (rounded-md)
- Status dots: full circle (rounded-full)
- Input fields: 8px

### Shadows

- Card: 0 1px 3px rgba(0,0,0,0.08)
- Card hover: 0 4px 12px rgba(0,0,0,0.1)
- Modal: 0 8px 32px rgba(0,0,0,0.15)

---

## Viewport & Layout

- **Mobile-first**: Design at 375px width as primary
- **Tablet**: 768px
- **Desktop**: Max content width 768px, centered on wider screens
- **Bottom navigation** on mobile (3 items: Properties, Add, Settings)
- **Header bar** on all sizes: teal-700 background, white "Indago" wordmark left-aligned, minimal

---

## Screen 1: Property List Page

**Route:** `/`
**Purpose:** Show all properties the user is tracking with completion status.

### Layout

```
┌──────────────────────────────────────┐
│  ▓▓ Indago                           │  ← teal header bar
├──────────────────────────────────────┤
│                                      │
│  Your Properties                     │  ← H1
│                                      │
│  ┌──────────────────────────────────┐│
│  │  123 Main St, Vancouver          ││  ← PropertyCard
│  │  Detached · $849,000             ││
│  │  ████████░░░░  62%               ││  ← progress bar
│  │  ⚠ 2 findings need attention     ││  ← amber text
│  │  Updated 2 min ago               ││  ← gray-500 caption
│  └──────────────────────────────────┘│
│                                      │  ← 16px gap
│  ┌──────────────────────────────────┐│
│  │  456 Oak Ave, Squamish           ││
│  │  Townhouse · $629,000            ││
│  │  ██░░░░░░░░░░  15%              ││
│  │  🔄 Checks running...            ││  ← teal text + spinner
│  │  Updated just now                ││
│  └──────────────────────────────────┘│
│                                      │
│         [+ Add Property]             │  ← teal primary button, centered
│                                      │
├──────────────────────────────────────┤
│  🏠 Properties    ➕ Add    ⚙ More   │  ← bottom nav (mobile)
└──────────────────────────────────────┘
```

### PropertyCard Component

- White card, 12px radius, subtle shadow
- **Line 1:** Address (H3, gray-800)
- **Line 2:** Property type · Price (Body, gray-500)
- **Line 3:** Progress bar (teal fill, gray-200 track, 8px height, rounded-full) + percentage text
- **Line 4:** Status summary (amber for warnings, teal for in-progress, green for complete)
- **Line 5:** "Updated X ago" (Body Small, gray-400)
- Tap entire card → navigates to property report

### Empty State

When no properties exist:
- Centered illustration (simple house outline in teal-200, or placeholder)
- "No properties yet" (H2, gray-800)
- "Add your first property to start your due diligence journey" (Body, gray-500)
- [+ Add Property] button (teal primary, large)

---

## Screen 2: Add Property — Step 1 (URL Input)

**Route:** `/add`
**Purpose:** User pastes a listing URL.

### Layout

```
┌──────────────────────────────────────┐
│  ← Back           Indago            │  ← header with back arrow
├──────────────────────────────────────┤
│                                      │
│  Add a Property                      │  ← H1
│                                      │
│  Paste the listing URL and we'll     │  ← Body, gray-500
│  handle the rest.                    │
│                                      │
│  ┌──────────────────────────────────┐│
│  │  https://realtor.ca/...          ││  ← large text input
│  └──────────────────────────────────┘│
│                                      │
│  Or enter an address manually        │  ← text link, gray-500
│                                      │
│  ┌──────────────────────────────────┐│  ← manual input (hidden by default,
│  │  Address                         ││     shown on link tap)
│  │  Municipality                    ││
│  │  Property Type [dropdown]        ││
│  │  Asking Price                    ││
│  └──────────────────────────────────┘│
│                                      │
│                                      │
│         [Next →]                     │  ← teal primary button, full-width
│                                      │
└──────────────────────────────────────┘
```

### Notes
- URL input is the prominent path (large input, prominent placement)
- "Enter manually" is a text link that reveals additional fields
- Next button disabled until URL is entered or manual fields are filled
- Input validation: show error text below input if URL format invalid

---

## Screen 3: Add Property — Step 2 (Buyer Type)

**Route:** `/add` (same page, step 2)
**Purpose:** Capture buyer intent for insight personalization.

### Layout

```
┌──────────────────────────────────────┐
│  ← Back           Indago            │
├──────────────────────────────────────┤
│                                      │
│  What kind of buyer are you?         │  ← H1
│                                      │
│  This helps us prioritize what       │  ← Body, gray-500
│  matters most to you.                │
│                                      │
│  ┌───────────────┐ ┌───────────────┐ │  ← 2-column grid
│  │   🏡           │ │   💰          │ │
│  │  First-Time    │ │  Investor     │ │
│  │  Buyer         │ │               │ │
│  │  Living in it  │ │  Rental       │ │
│  │                │ │  income       │ │
│  └───────────────┘ └───────────────┘ │
│  ┌───────────────┐ ┌───────────────┐ │
│  │   🏖️           │ │   🔨          │ │
│  │  Short-Term    │ │  Renovation   │ │
│  │  Rental        │ │               │ │
│  │  Airbnb        │ │  Flip         │ │
│  └───────────────┘ └───────────────┘ │
│  ┌───────────────┐ ┌───────────────┐ │
│  │   👨‍👩‍👧‍👦         │ │   🏢          │ │
│  │  Family        │ │  Downsizer   │ │
│  │  Relocation    │ │               │ │
│  │  Schools,      │ │  Low          │ │
│  │  safety        │ │  maintenance  │ │
│  └───────────────┘ └───────────────┘ │
│                                      │
│  ☐ This is my first property         │  ← checkbox
│    purchase in BC                    │
│                                      │
│      [Generate Report →]             │  ← teal primary, full-width
│                                      │
└──────────────────────────────────────┘
```

### Buyer Type Cards
- White card, 12px radius, 1px gray-200 border
- **Selected state:** teal-50 background, 2px teal-600 border
- Icon top (emoji or Lucide icon), 24px
- Title (H3, gray-800)
- Subtitle (Body Small, gray-500)
- Single-select: tapping one deselects the previous
- Card height: consistent across all 6 (auto-height based on tallest)

---

## Screen 4: Report — Loading State

**Route:** `/property/:id`
**Purpose:** Show animated progress while AI checks run. THIS IS THE DEMO MOMENT.

### Layout

```
┌──────────────────────────────────────┐
│  ← Properties      Indago           │
├──────────────────────────────────────┤
│                                      │
│  123 Main St, Vancouver             │  ← H1
│  Detached · $849,000                │  ← Body, gray-500
│                                      │
│  ┌──────────────────────────────────┐│
│  │  🔍 Analyzing your property...   ││  ← teal card background (teal-50)
│  │                                  ││
│  │  ✅ Listing details extracted    ││  ← green check, fade in
│  │  ✅ Zoning designation found     ││  ← green check, fade in
│  │  🔄 Researching OCP status...    ││  ← spinner, teal
│  │  ⏳ Calculating transfer tax     ││  ← waiting, gray
│  │  ⏳ Preparing title guidance     ││  ← waiting, gray
│  │  ⏳ Researching property history ││  ← waiting, gray
│  │  ⏳ Assessing natural hazards    ││  ← waiting, gray
│  │                                  ││
│  │  ████████░░░░░░  3 of 7          ││  ← progress bar
│  └──────────────────────────────────┘│
│                                      │
└──────────────────────────────────────┘
```

### Animation Behavior
- Items start as "⏳ Waiting..." in gray
- When a check starts: spinner icon, teal text, "Researching..."
- When a check completes: green checkmark, slides in with subtle fade
- Progress bar fills smoothly
- When all complete: brief celebration moment (checkmark pulse), then transitions to full report view

---

## Screen 5: Property Report — Full View

**Route:** `/property/:id`
**Purpose:** Question-first report with personalized summary and expandable sections.

### Layout

```
┌──────────────────────────────────────┐
│  ← Properties      Indago           │
├──────────────────────────────────────┤
│                                      │
│  123 Main St, Vancouver             │  ← H1
│  Detached · First-Time Buyer        │  ← Body, gray-500
│  ████████████░░░  78% Complete      │  ← full-width progress bar
│                                      │
│  ┌──────────────────────────────────┐│
│  │  🎯 What Matters Most For You    ││  ← ForYouSummary card
│  │                                  ││     teal-50 background
│  │  1. You qualify for the PTT      ││     top-border: 3px teal-600
│  │     exemption — saving ~$8,000   ││
│  │     Source: BC PTT Act           ││  ← Body Small, gray-400
│  │                                  ││
│  │  2. RS-1 zoning allows a         ││
│  │     secondary suite for rental   ││
│  │     income to offset mortgage.   ││
│  │     Source: Vancouver Zoning     ││
│  │     Bylaw §4.1.3                ││
│  │                                  ││
│  │  3. Moderate earthquake zone.    ││
│  │     Earthquake insurance         ││
│  │     recommended (~$1,200-2,400   ││
│  │     /year).                      ││
│  │     Source: NRCan Seismic Model  ││
│  │                                  ││
│  │  4. OCP under review — density   ││
│  │     changes possible in your     ││
│  │     area.                        ││
│  │     Source: City of Vancouver    ││
│  │     OCP Review                   ││
│  └──────────────────────────────────┘│
│                                      │
│  ── Due Diligence Report ──          │  ← section divider
│                                      │
│  ┌──────────────────────────────────┐│
│  │ ✅ What am I allowed to do with  ││  ← ReportSection (expanded)
│  │    this property?                ││     green status = all checks done
│  │    3 of 3 checks complete        ││
│  │                                  ││
│  │  RS-1 Single Family — You can    ││  ← AI answer summary (Body)
│  │  build a secondary suite. Short- ││
│  │  term rentals require a license. ││
│  │  The OCP is under review with    ││
│  │  potential density increases.    ││
│  │                                  ││
│  │  ┌────────────────────────────┐  ││  ← CheckItem (expanded)
│  │  │ ✅ Zoning Designation      │  ││
│  │  │    RS-1 Single Family      │  ││
│  │  │    Permitted: single       │  ││
│  │  │    dwelling + secondary    │  ││
│  │  │    suite                   │  ││
│  │  │                            │  ││
│  │  │    📎 Sources:             │  ││  ← SourceCitation
│  │  │    • City of Vancouver     │  ││
│  │  │      Zoning Map [link]     │  ││
│  │  │      Data · Mar 1, 2026    │  ││
│  │  │    • Vancouver Zoning      │  ││
│  │  │      Bylaw §4.1.3 [link]  │  ││
│  │  │      Rule · Mar 1, 2026    │  ││
│  │  └────────────────────────────┘  ││
│  │                                  ││
│  │  ┌────────────────────────────┐  ││
│  │  │ ✅ OCP Status              │  ││
│  │  │    Adopted 2018. UNDER     │  ││
│  │  │    REVIEW — "Vancouver     │  ││
│  │  │    Plan" Phase 2.          │  ││
│  │  │    ...                     │  ││
│  │  └────────────────────────────┘  ││
│  │                                  ││
│  │  ┌────────────────────────────┐  ││
│  │  │ ✅ PTT Calculation         │  ││
│  │  │    Estimated: $12,980      │  ││
│  │  │    First-time exemption:   │  ││
│  │  │    -$8,000                 │  ││
│  │  │    You owe: ~$4,980        │  ││
│  │  └────────────────────────────┘  ││
│  └──────────────────────────────────┘│
│                                      │
│  ┌──────────────────────────────────┐│
│  │ 🔵 Do I actually own what I     ││  ← ReportSection (collapsed)
│  │    think I'm buying?             ││     blue = needs user input
│  │    0 of 8 checks complete    ▼   ││
│  └──────────────────────────────────┘│
│                                      │
│  ┌──────────────────────────────────┐│
│  │ ⏳ What happened on this land   ││  ← purple = awaiting response
│  │    before?                       ││
│  │    1 of 4 checks complete    ▼   ││
│  └──────────────────────────────────┘│
│                                      │
│  ┌──────────────────────────────────┐│
│  │ 🟢 Is this house safe to live   ││  ← simulated data (Tier 2)
│  │    in?                           ││
│  │    2 of 7 checks complete    ▼   ││
│  └──────────────────────────────────┘│
│                                      │
│  ┌──────────────────────────────────┐│
│  │ ⚪ Am I paying a fair price?     ││  ← not started
│  │    0 of 6 checks complete    ▼   ││
│  └──────────────────────────────────┘│
│                                      │
│  ┌──────────────────────────────────┐│
│  │ ⚪ Am I going to get hit with   ││
│  │    surprise costs?               ││
│  │    1 of 5 checks complete    ▼   ││
│  └──────────────────────────────────┘│
│                                      │
│  ...more sections...                 │
│                                      │
│  ┌──────────────────────────────────┐│
│  │  🏘️ Know Your Neighbours        ││  ← KnowYourNeighbours stub
│  │                     COMING SOON  ││
│  │                                  ││
│  │  Understanding what surrounds    ││
│  │  your property is as important   ││
│  │  as the property itself.         ││
│  │                                  ││
│  │  ○ Adjoining property zoning     ││
│  │  ○ Nearby development apps       ││
│  │  ○ Distance to industrial zones  ││
│  │  ○ Adjacent lot ownership        ││
│  └──────────────────────────────────┘│
│                                      │
└──────────────────────────────────────┘
```

---

## Screen 5a: Report Section — Title Search (Needs Input)

When the "Do I actually own what I think I'm buying?" section is expanded and title search needs user input:

```
│  ┌──────────────────────────────────┐│
│  │ 🔵 Do I actually own what I     ││
│  │    think I'm buying?             ││
│  │    0 of 8 checks complete    ▲   ││
│  │                                  ││
│  │  We need the title document to   ││  ← AI answer (partial)
│  │  analyze ownership. Follow the   ││
│  │  steps below to retrieve it.     ││
│  │                                  ││
│  │  ┌────────────────────────────┐  ││
│  │  │ 🔵 Title Search            │  ││  ← needs_input status
│  │  │                            │  ││
│  │  │  To look up this property's│  ││  ← UserGuidance steps
│  │  │  title:                    │  ││
│  │  │                            │  ││
│  │  │  1. Go to myLTSA.ca        │  ││
│  │  │  2. Log in or create an    │  ││
│  │  │     account                │  ││
│  │  │  3. Search for PID:        │  ││
│  │  │     012-345-678            │  ││  ← mono font, teal background
│  │  │  4. Request "Title Search  │  ││
│  │  │     with History"          │  ││
│  │  │  5. Cost: ~$15             │  ││
│  │  │  6. Download the PDF       │  ││
│  │  │                            │  ││
│  │  │  Then upload it here:      │  ││
│  │  │                            │  ││
│  │  │  ┌──────────────────────┐  │  ││  ← upload dropzone
│  │  │  │                      │  │  ││
│  │  │  │   📄 Drop PDF here   │  │  ││     dashed border, gray-300
│  │  │  │   or tap to browse   │  │  ││     teal on hover
│  │  │  │                      │  │  ││
│  │  │  └──────────────────────┘  │  ││
│  │  └────────────────────────────┘  ││
│  │                                  ││
│  │  ┌────────────────────────────┐  ││
│  │  │ ⚪ Charges & Liens         │  ││  ← Tier 3, listed, inactive
│  │  │    Why: Unpaid debts on a  │  ││
│  │  │    property transfer to    │  ││
│  │  │    the new owner.          │  ││
│  │  │    Status: Not yet checked │  ││
│  │  └────────────────────────────┘  ││
│  │                                  ││
│  │  ┌────────────────────────────┐  ││
│  │  │ ⚪ Easements & Rights-of-  │  ││
│  │  │    Way                     │  ││
│  │  │    Why: Easements can      │  ││
│  │  │    limit what you build.   │  ││
│  │  │    Status: Not yet checked │  ││
│  │  └────────────────────────────┘  ││
│  │                                  ││
│  │  ...more Tier 3 items...         ││
│  └──────────────────────────────────┘│
```

---

## Screen 5b: Report Section — Property History (Inquiry Draft)

When the "What happened on this land before?" section is expanded:

```
│  ┌──────────────────────────────────┐│
│  │ ⏳ What happened on this land   ││
│  │    before?                   ▲   ││
│  │    1 of 4 checks complete        ││
│  │                                  ││
│  │  BC Site Registry shows no       ││  ← partial AI answer
│  │  contamination records for this  ││
│  │  PID. Awaiting response from     ││
│  │  municipal environmental dept.   ││
│  │                                  ││
│  │  ┌────────────────────────────┐  ││
│  │  │ ✅ BC Site Registry Search │  ││
│  │  │    No contamination records│  ││
│  │  │    found for PID           │  ││
│  │  │    012-345-678             │  ││
│  │  │    Source: BC ENV Site      │  ││
│  │  │    Registry · AI Search    │  ││
│  │  └────────────────────────────┘  ││
│  │                                  ││
│  │  ┌────────────────────────────┐  ││
│  │  │ 🟣 Property History        │  ││  ← awaiting_response
│  │  │    Inquiry                 │  ││
│  │  │                            │  ││
│  │  │  Draft email to:           │  ││
│  │  │  City of Vancouver         │  ││
│  │  │  Environmental Services    │  ││
│  │  │  env@vancouver.ca          │  ││
│  │  │                            │  ││
│  │  │  Subject:                  │  ││
│  │  │  ┌──────────────────────┐  │  ││
│  │  │  │ Property History     │  │  ││  ← editable input
│  │  │  │ Inquiry - PID        │  │  ││
│  │  │  │ 012-345-678          │  │  ││
│  │  │  │ [Ref: IND-7829]     │  │  ││  ← mono, teal bg
│  │  │  └──────────────────────┘  │  ││
│  │  │                            │  ││
│  │  │  Body:                     │  ││
│  │  │  ┌──────────────────────┐  │  ││  ← editable textarea
│  │  │  │ Dear Environmental   │  │  ││
│  │  │  │ Services,            │  │  ││
│  │  │  │                      │  │  ││
│  │  │  │ I am conducting due  │  │  ││
│  │  │  │ diligence on the     │  │  ││
│  │  │  │ property at 123 Main │  │  ││
│  │  │  │ St (PID: 012-345-    │  │  ││
│  │  │  │ 678). Could you...   │  │  ││
│  │  │  └──────────────────────┘  │  ││
│  │  │                            │  ││
│  │  │  [📋 Copy to Clipboard]    │  ││  ← outline button
│  │  │  [✓ Mark as Sent]          │  ││  ← teal button
│  │  └────────────────────────────┘  ││
│  └──────────────────────────────────┘│
```

---

## Screen 5c: PTT Calculator Detail

When expanded within the "Am I going to get hit with surprise costs?" section:

```
│  ┌────────────────────────────────┐  │
│  │ ✅ Property Transfer Tax       │  │
│  │                                │  │
│  │  Purchase Price    $849,000    │  │
│  │  ─────────────────────────     │  │
│  │  First $200,000         1%    │  │
│  │                      $2,000    │  │
│  │  $200,001–$849,000      2%    │  │
│  │                     $12,980    │  │
│  │  ─────────────────────────     │  │
│  │  Base PTT           $14,980   │  │  ← bold
│  │                                │  │
│  │  ┌──────────────────────────┐  │  │
│  │  │  🎉 First-Time Buyer     │  │  │  ← teal-50 bg, teal border
│  │  │     Exemption             │  │  │
│  │  │                           │  │  │
│  │  │  You may qualify for a    │  │  │
│  │  │  partial exemption.       │  │  │
│  │  │  Estimated savings:       │  │  │
│  │  │  -$8,000                  │  │  │  ← green, bold
│  │  └──────────────────────────┘  │  │
│  │                                │  │
│  │  Estimated PTT Owing  $6,980   │  │  ← H2 size, teal
│  │                                │  │
│  │  📎 Source: BC Property         │  │
│  │  Transfer Tax Act              │  │
│  │  Rule · Confirm with lawyer    │  │
│  └────────────────────────────────┘  │
```

---

## Component Reference Sheet

### StatusBadge Variants

| Status | Background | Text | Icon |
|---|---|---|---|
| Complete | emerald-50 | emerald-700 | ✓ checkmark |
| In Progress | amber-50 | amber-700 | spinner |
| Not Started | gray-100 | gray-500 | circle outline |
| Needs Input | blue-50 | blue-700 | arrow-up-circle |
| Awaiting Response | violet-50 | violet-700 | clock |
| Skipped | gray-50 | gray-400 | slash |

### SourceCitation

```
  📎 Source Name [link icon]
  Type label · Retrieved date
```

- Source name: Body Small, gray-600, underlined if URL present
- Type label: "Data" | "Rule" | "AI interpretation" in gray-400 italic
- Retrieved date: gray-400
- "AI interpretation" type shows additional note: "Confirm with [authority]" in gray-400

### RiskLevel Indicator

Visual dot + label:
- Low: green dot + "Low risk"
- Medium: amber dot + "Medium risk"
- High: orange dot + "High risk"
- Very High: red dot + "Very high risk"

### ProgressBar

- Track: gray-200, 8px height, rounded-full
- Fill: teal-500, animated width transition (300ms ease)
- Label: right-aligned percentage or "X of Y" text

---

## Interaction Notes

1. **Section expand/collapse:** Tap section header to toggle. Chevron rotates. Smooth height animation (200ms).
2. **Upload dropzone:** Dashed gray-300 border. On hover/drag: teal border, teal-50 background. Accepts .pdf only.
3. **Copy to clipboard:** Brief "Copied!" toast in bottom-center, auto-dismiss after 2s.
4. **Mark as sent:** Confirmation dialog: "Did you send this email?" Yes/No. On yes: status changes to "Awaiting Response," badge updates.
5. **Loading state → Report transition:** Smooth crossfade (300ms) from loading checklist to full report view.
6. **Pull-to-refresh** on report page re-polls check statuses.
7. **Buyer type cards:** Tap to select with subtle scale animation (1.02x, 100ms). Deselect previous with fade.
