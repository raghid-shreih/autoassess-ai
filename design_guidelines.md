# Design Guidelines: AutoAssess AI Claims Automation Module

## Design Approach

**System Selection:** Linear/Notion-inspired enterprise productivity aesthetic
**Rationale:** Utility-focused claims processing tool requiring clarity, efficiency, and information density. Prioritizes task completion speed and data comprehension over visual embellishment.

**Core Principles:**
- Data-first: Information hierarchy optimized for rapid decision-making
- Minimal friction: Streamlined workflows with clear action paths
- Professional restraint: Clean, uncluttered interface for focused work

---

## Typography System

**Font Stack:** Inter (via Google Fonts CDN)
- **Display/Headers:** 600 weight, -0.02em tracking
- **Body Text:** 400 weight, 1.5 line-height
- **Data/Metrics:** 500 weight, tabular-nums
- **Labels:** 500 weight, 0.01em tracking, uppercase at 11px

**Scale:**
- Page titles: text-2xl (24px)
- Section headers: text-lg (18px)
- Body/default: text-base (16px)
- Secondary/meta: text-sm (14px)
- Captions/labels: text-xs (12px)

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, and 8 as primary rhythm (p-2, m-4, gap-6, py-8)

**Grid Structure:**
- Container: max-w-7xl mx-auto px-6
- Two-column workspace: 60/40 split (image viewer / details panel)
- Card spacing: gap-4 for tight grouping, gap-6 for section separation
- Form fields: space-y-4 for vertical stacking

**Responsive Behavior:**
- Desktop (lg:): Side-by-side panels
- Tablet/Mobile: Stack vertically with full-width components

---

## Component Library

### Navigation
- **Top bar:** Fixed header with app logo, claim ID, agent profile
- **Breadcrumbs:** Text-based navigation showing workflow position
- Height: h-16, items centered vertically

### Primary Workspace

**Image Viewer Panel:**
- Large preview area (min-h-96) with zoom controls
- Thumbnail strip below for multi-image support (future)
- Overlay detection markers (bounded boxes with labels)

**Details Panel:**
- **Damage Assessment Card:**
  - Detected parts list with severity badges
  - Each item: Part name + severity indicator + confidence %
  - Compact list layout (space-y-2)

- **Cost Estimate Section:**
  - Line-item breakdown table
  - Columns: Part | Labor | Total
  - Footer row: Grand total with prominence (font-semibold)

- **Confidence Score Display:**
  - Large percentage (text-4xl) with status indicator
  - Threshold warning for <85% (alert styling)
  - Explanation text below in text-sm

### Forms & Inputs

**Override Controls:**
- Inline edit buttons (pencil icon) next to each estimate line
- Modal/drawer for detailed edits
- Input fields: border-2, rounded-lg, px-4 py-2
- Consistent focus states across all inputs

**Action Buttons:**
- Primary CTA (Approve Estimate): Prominent, right-aligned
- Secondary actions (Request Review, Save Draft): Ghost/outline style
- Button sizing: px-6 py-3 for primary, px-4 py-2 for secondary

### Data Display

**Status Badges:**
- Pill-shaped (rounded-full px-3 py-1)
- Semantic sizing: text-xs uppercase tracking-wide
- Types: High/Medium/Low confidence, Approved/Pending/Flagged

**Information Cards:**
- Rounded corners (rounded-lg)
- Border treatment (border-2)
- Internal padding: p-6
- Sections separated by dividers (border-t with my-4)

**Tables:**
- Minimal grid lines (border-b on rows only)
- Row padding: py-3
- Header distinction: font-semibold, uppercase, text-xs

### Icons
**Library:** Heroicons (via CDN)
- Size standard: w-5 h-5 for inline icons
- w-6 h-6 for standalone/buttons
- Common icons needed: check-circle, exclamation-triangle, pencil, photo, document-text

---

## Page Structure

### Claims Agent Workspace (Single Page App)

**Header Section (h-16):**
- App branding left
- Claim ID center
- Agent info/logout right

**Main Content (Two-Column):**

Left Column (60%):
- Image upload zone (when empty): Dashed border, centered icon + text
- Active image viewer: Full preview with detection overlays
- Controls below: Zoom, rotate, fullscreen

Right Column (40%):
- Sticky scroll behavior
- Stacked sections with clear hierarchy:
  1. Claim metadata (policy #, date, vehicle info) - compact list
  2. AI Detection Results - expandable card
  3. Cost Breakdown - table format
  4. Confidence Score - prominent display
  5. Action buttons - fixed bottom on mobile

**Bottom Action Bar (Mobile):**
- Sticky footer with primary actions
- z-10 elevation

---

## Interaction Patterns

**File Upload:**
- Drag-and-drop zone with click-to-browse fallback
- Immediate preview after selection
- Loading state: Skeleton animation while AI processes

**Editing Flow:**
- Click-to-edit inline for simple fields
- Modal overlay for complex estimate adjustments
- Clear save/cancel actions with keyboard support (ESC/Enter)

**Confidence Warnings:**
- Automatic scroll-to for flagged items
- Visual separator/highlight for low-confidence detections
- Expandable "Why this was flagged" explanations

**Progressive Disclosure:**
- Collapsed AI reasoning by default
- "Show Details" toggle for detection explanations
- Maintains compact interface while allowing deep dives

---

## Animations

Use sparingly and purposefully:
- Smooth transitions on panel slides (duration-200)
- Subtle fade-in for loaded content (fade-in-up)
- Hover states: Simple opacity/scale changes (hover:opacity-80)
- **NO** page load animations, parallax, or decorative effects

---

## Images

**No hero images** - This is a functional workspace, not marketing
**User-uploaded content only:** Damage photos from claims
**Placeholder states:** Use icon + text, not stock imagery