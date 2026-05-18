# Event Details

## What Is This Page?

The **Event Details** page is the deepest level of the audit section. It shows everything Intune recorded about a single audit event: who performed it, when, what the outcome was, which resources were touched, and — crucially — **exactly what changed** on each resource, with the old value and the new value shown side by side for every modified property.

The page also calculates and displays **related events** — other events within one hour that share the same actor or the same affected resources — and visualises them in an **Event Flow diagram** that shows the full chain of activity in chronological order.

You arrive at this page by clicking any event row in the Dashboard, Search, or Advanced Audit Search pages.

---

## Why Would You Use This?

- You need to know exactly what changed on a resource — what the value was before and what it is now
- You are investigating an incident and want the complete picture for a single event: who, what, when, outcome, and all side effects
- You want to understand what other events happened around the same time involving the same person or the same resource
- You need to produce evidence of a specific change for a compliance audit or change management record

---

## How to Get Here

- Click any event row in the [Audit Dashboard](./dashboard.md) Recent Events table
- Click any event row in the [Advanced Event Search](./search.md) results table
- Click any event row in the [Advanced Audit Search](./advanced.md) event list
- Click any related event link in the Event Flow Visualizer on this same page

---

## Breadcrumb Navigation

At the top of the page, a breadcrumb trail shows your path:

`Dashboard → Search → Event Details`

Each segment is a link. Click **Dashboard** to return to the main audit overview or **Search** to go back to the Advanced Event Search page.

---

## Event Overview Card

A wide card spanning three columns of the layout shows the four key facts about the event at a glance:

| Field | What It Shows |
|---|---|
| **Activity** | The activity type — e.g., `Update`, `Create`, `Delete` — or the display name if no activity type is set |
| **Category** | The Intune area as an outlined badge — e.g., `DeviceConfiguration`, `MobileApps` |
| **Result** | Green **Success**, red **Failure**, or yellow **Warning** badge with an icon |
| **Component** | The Intune component or service that generated the event |

A subtitle beneath the page title shows the **relative time** of the event — e.g., `3 minutes ago`, `2 hours ago`, `1 day ago`.

> 📸 _[Screenshot placeholder: Event Overview card showing four labelled fields in a 4-column grid — Activity: "Update", Category: "DeviceConfiguration" badge, Result: green Success badge, Component: "Microsoft.Intune" — with a blue gradient background]_

---

## Performed By Card

A smaller card to the right of the overview shows who performed the event:

- A circular **avatar** with the user's initials (up to 2 characters, e.g., `JD` for John Doe) on a blue background
- The user's **UPN** (email address)
- The user's **Object ID** (GUID) in smaller text below

If the event was performed by an automated system process rather than a human, the UPN will be absent or show the service account identity.

> 📸 _[Screenshot placeholder: Performed By card showing a blue avatar circle with initials "SR", a UPN below it, and a GUID in small grey text]_

---

## Event Timeline

A vertical timeline card on the left side of the main content area shows the lifecycle of the event as three milestones connected by a vertical blue line:

### 1. Event Occurred (blue dot)

- The exact date and time the event was recorded
- The display name of the event

### 2. Changes Made (yellow dot)

This milestone is only shown if the event has one or more associated resources.

- Shows how many resources were affected: `N resource(s) affected`
- Clicking this milestone **expands** a list of the affected resources inline, each showing:
  - Resource display name
  - Resource type badge
  - A `N properties modified` link — clicking it smoothly scrolls the page down to the **Resource Impact** section

Clicking again collapses the list.

### 3. Event Completed (green dot)

- Shows the result badge (Success, Failure, or Warning) confirming the final outcome

> 📸 _[Screenshot placeholder: Event Timeline card showing three milestones on a vertical blue line — a blue "Event Occurred" dot with timestamp, a yellow "Changes Made" dot with "2 resources affected", and a green "Event Completed" dot with a Success badge]_

---

## Event Flow Diagram

Below the timeline card, an **Event Flow** card shows a visual representation of the selected event in context with its related events.

The flow is a vertical sequence of event cards connected by a gradient line (blue → purple → pink):

### Current Event Card (blue)

The selected event is displayed prominently at the top of the flow:
- A blue circular icon
- `Current Event` badge + result badge
- Activity name in bold
- Date, time, and actor UPN
- Category badge

### Related Event Cards (green / red / grey)

Each related event is shown below the current event, colour-coded by result:
- 🟢 Green — Success
- 🔴 Red — Failure
- ⚪ Grey — other

Each related event card shows: activity name, category badge, component name, relative timestamp, and result badge.

**All related event cards are clickable links.** Clicking one navigates to the Event Details page for that related event.

**What counts as related:** events within **1 hour** of the current event that either share the **same actor** or share at least one **resource ID**.

> 📸 _[Screenshot placeholder: Event Flow diagram showing a blue "Current Event" card at the top, then two related event cards below it connected by a gradient vertical line. The second card is green (Success), the third is red (Failure) with a chevron link arrow]_

---

## Related Events Sidebar

A sticky sidebar on the right side of the page lists the same related events as a compact card list. This sidebar stays fixed while you scroll down through the timeline and resource impact sections.

Each entry shows:
- A result icon (green checkmark, red ×, or grey activity)
- Activity name (truncated with ellipsis if long)
- Relative timestamp with a clock icon
- Category badge

Each entry is a link to the Event Details page for that related event.

A purple horizontal connector line on the left edge of each card visually connects the sidebar entries to the main content area.

> 📸 _[Screenshot placeholder: Related Events sidebar showing three linked entries each with a coloured icon, truncated activity name, relative timestamp, and category badge. A thin purple line on the left edge of each entry]_

---

## Resource Impact

At the bottom of the page, a full-width **Resource Impact** card shows every resource that was affected by this event.

This section is shown only when the event has associated resources. A header badge shows the total: `N Resources`.

Resources are shown in a two-column grid. Each resource card has a coloured left border (blue for even-numbered resources, purple for odd-numbered) and contains:

### Resource Header

- Resource **display name** in bold
- Resource **type** as an outlined badge
- Resource **ID** (GUID) in small monospace text
- A `Resource N` badge if there are multiple resources

### Modified Properties

For each resource, only the properties where `oldValue !== newValue` are shown — unchanged properties are silently excluded.

Each changed property shows:

| Section | What It Shows |
|---|---|
| Property name | The display name of the configuration property that was modified |
| **Before** | The old value in a red-tinted code block — `(empty)` if the property did not exist before |
| **After** | The new value in a green-tinted code block — `(empty)` if the property was cleared |

Values are shown in monospace code font and wrap correctly for long values (like JSON payloads or base64 strings).

By default, only the first **2 changed properties** per resource are shown. If there are more, a link appears:

`Show N more properties`

Clicking it expands the full list. A `Show less` link collapses it back to 2.

If a resource has no changed properties, `No properties were changed` is shown in italic.

> 📸 _[Screenshot placeholder: Resource Impact section showing two resource cards side by side. The left card shows a resource named "Windows Security Policy" with two changed properties — each with a "Before" red code block and "After" green code block. A "Show 3 more properties" link is visible at the bottom. The right card shows a resource with "No properties were changed" in italic]_

---

## Reading the Before / After Values

The property values shown in the Resource Impact section are the raw values as stored in Intune. Depending on the property type, they may appear as:

- A plain string — `Enabled`, `Disabled`, `Required`
- A number — `0`, `1`, `86400`
- A JSON object — `{"value": true, "enabled": false}`
- A serialised payload or base64 string (for complex settings)
- `(empty)` — the property was not set before the change, or was cleared by the change

For complex JSON values, the code blocks support horizontal scrolling to show the full content without truncation.

---

## Navigation

- **Back button** (top right) — returns to the previous page in browser history
- **Breadcrumb** — Dashboard and Search links at the top
- **Related event links** in the sidebar and Event Flow — open Event Details for those events
- **Resource Impact scroll link** — the `N properties modified` link in the Event Timeline scrolls directly to the Resource Impact card

---

## Common Use Cases

**What exactly was changed in this policy?**
Look at the Resource Impact section. Every property that changed is listed with its before and after value.

**Who made this change and when?**
The Performed By card and the Event Timeline show the actor and the exact timestamp.

**Was this change successful?**
The Result badge in the overview card and the green dot in the Event Timeline both confirm the outcome.

**Did anything else happen around the same time?**
Check the Related Events sidebar or the Event Flow diagram. Any event within one hour involving the same user or same resource appears there.

**Follow the chain of a multi-step operation**
Click through related events. Each related event's detail page has its own related events, so you can walk the full sequence step by step.

**Capture evidence of a change for an audit**
The Resource Impact section provides the exact before-and-after values for every modified property on every affected resource. Screenshot or save the page as evidence.

---

## Related Pages

- [Audit Dashboard](./dashboard.md) — overview and charts; click any event row to reach this page
- [Advanced Event Search](./search.md) — filter events to find the one you need
- [Advanced Audit Search](./advanced.md) — split-panel browser with related event context

