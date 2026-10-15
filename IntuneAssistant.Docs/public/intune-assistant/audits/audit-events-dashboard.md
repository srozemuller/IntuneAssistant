# Audit Events Dashboard

## What Is This Page?

The **Audit Events Dashboard** is the front door to the audit section. It loads automatically and shows a live, at-a-glance picture of activity in your Intune tenant: total events, success rate, failure count, number of active categories, a timeline chart, a category distribution pie chart, your most active users, and a live event table — all on one page.

It is designed to answer the question "what is happening right now?" in seconds, without requiring you to build a query or set any filters first. Everything updates immediately when you switch between the time-range presets or enable auto-refresh.

## Why Would You Use This?

* Morning check: has anything unusual happened overnight?
* Incident triage: there is a complaint about a policy change — quickly see if anything happened in the last hour
* Operational awareness: which categories are generating the most activity today?
* Identifying who is making the most changes and in which areas
* Spotting failures at a glance before they become support tickets

## How Data Loads

The dashboard loads automatically when you navigate to **Audit Events**. Data is fetched from the Intune audit log API and cached in the page context. Subsequent visits in the same session use the cached data and do not re-fetch — unless you click **Refresh** or change the time filter.

{% hint style="info" %}
If you leave the page and come back, the cached data is used immediately so the dashboard is instant. Click **Refresh** to get the latest events.
{% endhint %}

## Auto-Refresh

A toggle in the top-right area enables **Auto-refresh (30s)**. When enabled, the dashboard silently re-fetches data in the background every 30 seconds and updates all counts, charts, and the event table without any visible loading state.

This is useful when you have the dashboard open on a secondary screen during an active change window or incident.

## Time Range Quick Filters

Three buttons at the top of the page control the time window for all data on the dashboard:

| Button            | What It Shows                                                                |
| ----------------- | ---------------------------------------------------------------------------- |
| **All Events**    | All audit events available in the Intune audit log (typically up to 30 days) |
| **Last Hour**     | Only events from the last 60 minutes                                         |
| **Last 24 Hours** | Only events from the last 24 hours                                           |

Clicking any button immediately re-fetches data for that time range. All charts, stats, and the event table update together.

> 📸 _\[Screenshot placeholder: Dashboard header showing the three time filter buttons (All Events selected), the Auto-refresh toggle, a Refresh button, and an Advanced Search button]_

## Stats Cards

Four summary cards are shown at the top of the dashboard, each with a large number and a coloured gradient background:

| Card             | What It Shows                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------- |
| **Total Events** | The total number of audit events in the selected time range                                  |
| **Success Rate** | Percentage of events with a `Success` result — calculated as `(Success count / Total) × 100` |
| **Failures**     | The raw count of events with a `Failure` result                                              |
| **Categories**   | The number of distinct event categories present in the selected time range                   |

## Charts

### Events Over Time (Bar Chart)

A bar chart showing event volume broken down **by hour** over the last 24 hours. Each bar represents one hour of the day (labelled `HH:00`). Hover over any bar to see the exact count for that hour.

This chart helps you spot activity spikes — an unusually tall bar at 02:00 might indicate a scheduled automation ran, while a spike at 14:30 might correspond to a team making bulk changes.

### Events by Category (Pie Chart)

A pie chart showing the proportion of events in each category. Each slice is labelled with the category name and count.

**Clicking a slice filters the entire dashboard** — the event table below updates to show only events in that category, and a `Clear Filter` button appears to reset. The unselected slices fade to 30% opacity so it is visually clear which category is active.

## Most Active Users

A list of the top 5 users ranked by the number of audit events they generated in the selected time range. Each entry shows:

* An **avatar** with the user's initials (first letter of each name part, max 2 characters)
* The user's **UPN** (email address)
* The user's **Object ID** in smaller text below
* An event count badge on the right: `N events`

This section is useful for spotting if a single administrator is making an unusually high volume of changes — which may be expected during a project but could also indicate a misconfigured automation or a compromised account.

## Activities by Category

A collapsible accordion panel listing all event categories, sorted by total event count (highest first). Each category row shows:

* A **rank indicator** (coloured circle: gold for 1st, silver for 2nd, bronze for 3rd, blue for the rest)
* The **category name**
* A sub-line showing `N events · M activities`
* An event count badge on the right

### Expanding a Category

Click the **chevron icon** on the left of any category row to expand it. The expanded view shows each individual activity type within that category, ranked by count, with a `Nx` badge showing how many times that activity occurred.

### Expand All / Collapse All

A button in the panel header toggles all categories open or closed at once.

### Filtering by Category

**Clicking the category row** (not the chevron) filters the Recent Events table below to show only events from that category. The selected category row turns blue. A **Clear Filter** button appears in the panel header to reset.

## Recent Events Table

The bottom section of the dashboard shows a paginated table of recent events. The table respects any active category or activity filter set via the charts or the Activities by Category panel.

### Columns

| Column       | What It Shows                                                                                                         |
| ------------ | --------------------------------------------------------------------------------------------------------------------- |
| **Time**     | Relative time since the event occurred — e.g., `Just now`, `3 minutes ago`, `2 hours ago`, `1 day ago`                |
| **Activity** | The activity type in bold, with the Intune component name in smaller text below                                       |
| **Actor**    | The UPN of the user who performed the action, preceded by a user icon. Shows `System` in grey if no user was involved |
| **Category** | The event category as an outlined badge                                                                               |
| **Result**   | Green **Success**, red **Failure**, or yellow **Warning** badge with an icon                                          |
| **Actions**  | An eye icon button — clicking it navigates to the full [Event Details](audit-event-details.md) page for that event    |

### Clicking a Row

Clicking anywhere on a row navigates directly to the [Event Details](audit-event-details.md) page for that event — same as clicking the eye icon.

### Load More

If there are more events than the initial load, a **Load More Events** button appears below the table. Clicking it appends the next batch of events to the existing table without replacing the current results.

## Filter Interaction — How Everything Connects

The category filter (set by clicking the pie chart or the Activities by Category panel) affects only the **Recent Events table**. Charts and stats always reflect the full dataset for the selected time range. Clicking **Show All Activities** or the **Clear Filter** button in either the chart or the panel resets the table back to all events.

## Navigation

* **Advanced Search** button (top right) — navigates to the [Advanced Event Search](audit-event-search.md) page
* **View All** link in the Recent Events card header — also navigates to [Advanced Event Search](audit-event-search.md)
* Clicking any event row — navigates to [Event Details](audit-event-details.md)
* Eye icon in the Actions column — navigates to [Event Details](audit-event-details.md)

## Common Use Cases

**Quick daily health check**\
Open the dashboard, look at the Success Rate and Failures cards. If the failure count is unexpectedly high, click the red failure slice in the pie chart to filter the event table and see what is failing.

**Something broke overnight — what changed?**\
Click **Last Hour** or **Last 24 Hours**. Look at the Events Over Time bar chart for any spike. Check the Most Active Users list. Filter the event table by the relevant category.

**Who has been making changes today?**\
Look at the Most Active Users card. The top entry is the user with the most activity in the selected time range.

**How many policy changes happened this week?**\
Click **All Events**, then click the `DeviceConfiguration` or `PolicySets` slice in the pie chart to filter. The event count badge in the Recent Events header shows the filtered count.

**Monitoring a live change window**\
Enable **Auto-refresh (30s)** and keep the dashboard open. New events appear automatically every 30 seconds without any manual action.

## Related Pages

* [Advanced Event Search](audit-event-search.md) — filter events by date, category, actor, and more
* [Event Details](audit-event-details.md) — full detail for a single event
