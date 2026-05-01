# Advanced Audit Search

## What Is This Page?

The **Advanced Audit Search** page is a split-panel event browser. The left side shows a searchable list of audit events; the right side shows the full details of whichever event you click, plus a list of **related events** — other events within a one-hour window that share the same actor or the same affected resources.

It also has an **Event Flow Visualizer** — a chronological timeline diagram that places the selected event and all its related events in sequence, so you can see the chain of activity around any single change.

This page is best used when you already know roughly what you are looking for and want to quickly move between events, compare context, and trace a sequence — without navigating away to a full detail page each time.

---

## Why Would You Use This?

- You want to browse events and inspect them side by side without opening a new page for each one
- You are tracing a sequence of related changes — who did what, in what order, around a specific event
- You want to see all activity that happened around the same time as a specific change, involving the same user or the same resource
- You need the Event Flow Visualizer to understand the chronological chain around an incident

---

## How Data Loads

The page uses the shared audit event context. If events were already loaded in the current session (from the Dashboard or Search page), they are available immediately. If not, the page fetches them automatically on load.

Click **Refresh** (top right) to reload events from the API at any time.

---

## The Event List (Left Panel)

The left panel shows a paginated table of all loaded audit events with these columns:

| Column | What It Shows |
|---|---|
| **Time** | Full date on one line, time on the next |
| **Activity** | Display name in bold, category in smaller text below |
| **Actor** | UPN with a blue user icon, or `System` in grey |
| **Resources** | The first affected resource — display name and type. If more than one resource exists, a `+N more` badge appears |
| **Status** | Green **Success** or red **Failed** badge |

### Search

A search box at the top filters events in real time across: activity display name, actor UPN, category, and resource display names. A result count appears below the box: `Found X of Y events`.

Clearing the search (× button) returns the full unfiltered list.

### Selecting an Event

Click any row to select it. The selected row is highlighted in blue. The right panel immediately populates with that event's details and related events.

> 📸 _[Screenshot placeholder: Split layout — left panel showing the event table with one row highlighted in blue, right panel showing the Event Details card populated with the selected event's data]_

---

## The Detail Panel (Right Panel)

When an event is selected, the right panel shows two cards stacked vertically.

### Event Details Card

A compact summary of the selected event:

| Field | What It Shows |
|---|---|
| **Activity** | The display name of the event |
| **Category** | The Intune area (e.g., `DeviceConfiguration`) |
| **Actor** | UPN, or `System` if no user was involved |
| **Time** | Full date and time string |
| **Status** | Success or Failed badge |
| **Resources** | A scrollable list (max height 256px) of all resources affected by the event. Each resource shows its display name, type badge, and — if properties were modified — a count badge: `N properties modified` |

At the top of the card, a **Show Flow / Hide Flow** toggle button appears. Clicking it expands the Event Flow Visualizer below the main results area (see below).

> 📸 _[Screenshot placeholder: Event Details card showing Activity, Category, Actor, Time, Status fields, and a Resources section with two resource entries one having a "3 properties modified" badge]_

### Related Events Card

Below the Event Details card, the **Related Events** card lists other events that are contextually linked to the selected event.

**What counts as related:** An event is considered related if:
- It occurred **within 1 hour** of the selected event (before or after), AND
- It shares at least one **resource ID** with the selected event, OR it has the **same actor**

Related events are sorted chronologically, oldest first.

Each related event entry shows:
- Display name (truncated)
- Full timestamp
- A result badge

Clicking a related event **replaces** the selected event in the detail panel — the related event becomes the new selection, and its own related events are recalculated. This lets you "follow the thread" from event to event.

> 📸 _[Screenshot placeholder: Related Events card showing three entries, each with a display name, timestamp, and a result badge, with the first one showing a red Failed badge]_

---

## Event Flow Visualizer

Clicking **Show Flow** on the Event Details card opens the **Event Flow Visualizer** — a full-width card that appears below the split panel.

The visualizer shows the selected event and all its related events arranged as a **vertical chronological timeline**:

- Each event is shown as a card connected by a vertical line
- The **selected event** is prominently highlighted with a blue gradient background, a blue ring, and a `Current Event` badge
- Related events are shown below it, each coloured by result:
  - 🟢 Green gradient + green icon — `Success`
  - 🔴 Red gradient + red icon — `Failure`
  - ⚪ Grey — anything else
- Each event card shows: activity name, category badge, component name, timestamp, and a result badge
- Related event cards are **clickable links** — clicking navigates to the full [Event Details](./event-details.md) page for that event

The vertical connector line uses a blue-purple-pink gradient to give a sense of flow direction from top to bottom.

> 📸 _[Screenshot placeholder: Event Flow Visualizer showing three stacked event cards connected by a vertical gradient line. The top card (current event) has a blue border and "Current Event" badge. The second card has a green background (Success). The third has a red background (Failure) and a chevron link arrow]_

---

## Navigating to Full Event Details

From the Event Flow Visualizer, clicking any related event card opens the full [Event Details](./event-details.md) page for that event.

From the Related Events card, clicking an entry **replaces** the current selection in the split panel rather than navigating away — keeping you on this page.

To open the full Event Details page for the currently selected event, click directly on a row in the event list and then navigate via the link in the Event Flow Visualizer, or use the dashboard/search table instead.

---

## Common Use Cases

**Browse events and inspect them without leaving the page**
Use the search box to narrow to a keyword. Click rows to cycle through the detail panel without navigating away.

**Trace who else was involved around a specific change**
Select the event. Check Related Events — any events by the same actor or touching the same resource within one hour are listed there.

**Understand a sequence of changes as a chain**
Click Show Flow. The visualizer puts the selected event and all its related events in chronological order so you can see the complete sequence.

**Follow a thread across related events**
Click a related event in the Related Events card. It becomes the selected event. Its own related events are calculated. Repeat to follow the chain.

---

## Related Pages

- [Audit Dashboard](./dashboard.md) — overview and charts
- [Advanced Event Search](./search.md) — precise date/category/actor filtering with export
- [Event Details](./event-details.md) — full single-event deep dive with resource impact

