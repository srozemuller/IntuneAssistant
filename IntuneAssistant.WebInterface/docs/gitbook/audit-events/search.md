# Advanced Event Search

## What Is This Page?

The **Advanced Event Search** page is the precision search tool for Intune audit events. Where the Dashboard gives you a broad overview, this page lets you build an exact query: pick a date range, narrow by category, activity type, actor, component, and result outcome, add a free-text keyword, and run the search against the Intune audit API. The results are paginated at 25 events per page and can be exported to CSV or JSON.

The page also supports **saved filter presets** — named combinations of filters stored in your browser that you can reload in one click for recurring investigations.

---

## Why Would You Use This?

- You need to find all events where a specific user made changes in a given date range
- You are investigating a failure and need to see only `Failure` result events in the last 24 hours
- You want to know all times a specific policy category was modified in the past 30 days
- You need to extract a structured CSV or JSON file of audit events for a compliance report
- You regularly audit the same combination of filters and want to save them as a named preset

---

## How Data Works on This Page

This page uses data in two modes:

**From the shared context (instant):** If the Dashboard or Advanced Audit Search page has already loaded events in the current session, those events are immediately available in the filter dropdowns and the results table without waiting.

**From a fresh API search (when you click Search):** Clicking **Search** sends your filter criteria to the Intune audit API as a POST request and returns a paginated result (25 per page) matching your precise query. The results header reflects the source: `X of Y events` or `X of Y events from cache`.

---

## The Filter Panel

All controls are in the **Filters** card. The total number of active filters is shown as a blue badge: `N active`.

### Date Range

Two calendar date pickers — **From Date** and **To Date** — set the time boundary for the search.

**Quick Date Presets** set both dates at once:

| Preset | Window |
|---|---|
| **Last 24 Hours** | now minus 24 h → now |
| **Last 7 Days** | now minus 7 days → now |
| **Last 30 Days** | now minus 30 days → now |
| **Last 90 Days** | now minus 90 days → now |

> 📸 _[Screenshot placeholder: Date range row showing From/To calendar picker buttons with dates filled in, and four Quick Preset buttons]_

### Free Text Search

Searches simultaneously across display name, actor UPN, category, activity type, and component name. Press **Enter** to also trigger the Search.

### Cascading Multi-Select Filters

Four dropdown filters that are **cascading** — each filter's available options narrow based on what you have already selected in the others, preventing impossible combinations.

| Filter | Filters On |
|---|---|
| **Categories** | Intune area — e.g., `DeviceConfiguration`, `MobileApps`, `Enrollment` |
| **Activities** | Operation type — e.g., `Create`, `Update`, `Delete` |
| **Actors** | UPN of the user who acted |
| **Components** | Intune component or service |

Each filter supports multiple selections. Selected values appear as removable chips (with ×) below the dropdown. Chips that are no longer valid after another filter changes are removed automatically.

> 📸 _[Screenshot placeholder: Categories dropdown with two selected chips ("DeviceConfiguration" and "CompliancePolicy") each showing an × button]_

### Result Toggle Buttons

Three toggle buttons for outcome: **Success**, **Failure**, **Warning**. Multiple can be active simultaneously. Click an active button to deselect it.

---

## Running a Search

Click **Search** in the filter card header. A spinner shows while the API call runs. Results are returned sorted newest-first.

Click **Clear All** to reset every filter and the results table at once.

---

## Filter Presets

### Saving

1. Set your filters
2. Type a name in the **Preset name** field
3. Click **Save**

Presets are stored in `localStorage` and persist across browser sessions.

### Loading

Click any preset badge to instantly restore all its saved filter values.

### Deleting

Click the × on a preset badge to permanently remove it.

> 📸 _[Screenshot placeholder: Save preset section with a name field, Save button, and three existing preset badges each with an × delete button]_

---

## Results Table

| Column | What It Shows |
|---|---|
| **Time** | Full date on one line, time on the next |
| **Activity** | Display name in bold, category in smaller text below |
| **Actor** | UPN with a blue user icon, or `System` in grey |
| **Component** | Outlined badge showing the Intune component |
| **Status** | Green **Success**, red **Failure**, or yellow **Warning** badge |

Clicking any row navigates to the [Event Details](./event-details.md) page.

A **Load More Events** button appears below the table when more pages exist.

---

## Exporting Results

Both exports respect your active filters — only visible filtered results are exported.

### Export CSV

`audit-events-{ISO timestamp}.csv` — columns: Timestamp, Activity, Actor, Category, Component, Result, Display Name.

### Export JSON

`audit-events-{ISO timestamp}.json` — full event objects including all fields, resources, and modified properties.

---

## Common Use Cases

**All failures in the last 24 hours** — click Last 24 Hours preset → click Failure → click Search.

**Who changed device configuration policies this week** — Last 7 Days → Categories: DeviceConfiguration → Search → review Actor column.

**All enrollment failures for a compliance report** — Last 30 Days → Categories: Enrollment → Failure → Search → Export CSV.

**Recurring audit query** — set filters → type preset name → Save. Next time, click the preset badge → Search.

---

## Related Pages

- [Audit Dashboard](./dashboard.md) — high-level overview and charts
- [Advanced Audit Search](./advanced.md) — split-panel browsing with related event context
- [Event Details](./event-details.md) — full detail for a single event

