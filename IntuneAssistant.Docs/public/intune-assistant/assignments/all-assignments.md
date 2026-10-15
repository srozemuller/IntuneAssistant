# All Assignments

## What Is This Page?

The **All Assignments** page gives you a complete, real-time snapshot of every assignment that exists in your Intune tenant — across every resource type, every platform, and every target group. Think of it as the "mission control" for your Intune assignment landscape.

Whether you are a helpdesk administrator trying to understand why a policy applies to a device, an architect reviewing the overall assignment structure, or a CISO wanting an audit trail, this page is your starting point.

***

## Why Would You Use This?

* You want to know **what is assigned, to whom, and how** — all in a single view
* You are conducting a **compliance or security audit** and need evidence of policy coverage
* You suspect **conflicting or missing assignments** and need to see the full picture
* You want to **export a report** of all assignments for documentation or review purposes
* You need to quickly check if a specific resource has an **assignment filter** applied

***

## How to Load the Data

1. Sign in — Intune Assistant starts collecting your tenant overview in the background straight away (see the status window in the bottom-right corner)
2. Navigate to **Assistant → Assignments → All Assignments**
3. The table is already filled from that overview; **Data collected … ago** in the top-right corner tells you how fresh it is
4. Press **Refresh** to fetch the assignments again from Intune. This reads only the resource types that carry assignments, so it is quick and does not touch the rest of the tenant overview; the top-right corner then shows **Assignments fetched … ago**. Data older than 30 minutes shows a **refresh recommended** hint
5. **Refresh everything** next to it collects the whole tenant overview again (every resource type, the search index and the change history) - use it when you changed more than assignments

{% hint style="info" %}
⏳ **Large tenants:** Fetching can take longer if you have thousands of policies and apps. A loading indicator shows progress.
{% endhint %}

{% hint style="warning" %}
❌ **Cancel at any time:** If the load is taking too long, use the **Cancel** button to stop the request without losing your session.
{% endhint %}

***

## Understanding the Table

Once loaded, the data is displayed in a table with the following columns:

| Column              | What It Means                                                                       |
| ------------------- | ----------------------------------------------------------------------------------- |
| **Resource**        | The name of the Intune object (policy, configuration profile, app, script, etc.)    |
| **Type**            | The resource category (e.g., Compliance Policy, Configuration Profile, Win32 App)   |
| **Sub Type**        | A more specific classification within the resource type                             |
| **Assignment**      | How the resource is targeted — e.g., `Entra ID Group`, `All Users`, `All Devices`   |
| **Target**          | The name of the group, user, or built-in target the assignment points to            |
| **Platform**        | The device platform this resource applies to (Windows, iOS, Android, macOS, or All) |
| **Status**          | **Assigned**, **Not Assigned**, or **Assigned (Tenant Default)** — see the note below |
| **Filter**          | The name of an assignment filter applied (if any) — click to see filter details     |
| **Filter Type**     | Whether the filter is **Include** or **Exclude**                                    |
| **Role Scope Tags** | Any RBAC scope tags associated with the resource                                    |

### Tenant defaults

Intune creates a handful of built-in enrollment configurations in every tenant — the enrollment restrictions, enrollment limit, Enrollment Status Page, Windows Hello for Business and Windows Restore defaults, all named **All users and all devices**. Nobody assigned them and you cannot remove or change their targeting; they apply as the lowest-priority fallback. The **Target** column shows the built-in target Intune reports for each one (for the enrollment defaults that is `All Devices`).

Intune Assistant shows each of these as one row with the **Assignment** badge `Tenant Default` and the **Status** badge `Assigned (Tenant Default)`. They are counted separately from your own assignments: they are *not* included in the **Assigned** count, and they do not show up under **Not Assigned** either. The **Sub Type** column tells the five defaults apart (for example `Limit`, `PlatformRestrictions`, `Windows10EnrollmentCompletionPageConfiguration`).

The Windows Hello for Business and Windows Restore configurations also carry a state (Enabled, Disabled or Not Configured). When that state is **Not Configured**, an amber `Not Configured` badge appears next to the assignment badge: the configuration is assigned, but it does nothing. This is the normal situation for those two tenant defaults in a tenant where nobody has switched them on.

### ⚠️ Warning Indicators

If a row shows a small **amber triangle** icon next to the resource name, Intune Assistant detected a problem with that specific assignment. Hover over the icon to read the warning message. The two most common warnings are:

* **The assigned group no longer exists** — the group this assignment targets has been deleted from Entra ID, but the assignment itself is still sitting on the policy.
* **The assignment filter no longer exists** — the filter this assignment uses to include or exclude devices has been deleted.

Both situations mean Intune can no longer evaluate the assignment correctly. In practice this usually shows up as **"tattooing"**: settings that were applied while the assignment still worked stay applied on the device forever, because Intune has nothing left to evaluate that would tell it to remove them — even after you unassign the policy elsewhere. Recreating the missing group or filter (or removing and recreating the assignment against a group/filter that does exist) is the fix.

***

## Grouping by policy

By default the table shows one row per assignment, so a policy with five assignments takes five rows. Above the table, the **Flat** / **By policy** switch changes that:

* **Flat** — one row per assignment, every column filled. This is the original view.
* **By policy** — one row per resource, the same way the Intune portal lists policies. A collapsed row shows only the **Resource**, **Platform** and **Status** columns, plus a small badge with the number of assignments. Click the row to unfold it: the resource's assignments appear underneath as normal rows with the **Assignment**, **Target**, **Filter** and **Role Scope Tags** columns filled in, exactly as in the flat view. Click the row again to fold it.

In the **By policy** view:

* **Status** is `Assigned` when at least one of the resource's assignments is assigned, `Not Assigned` when none are, and `Assigned (Tenant Default)` for the built-in tenant defaults.
* The **amber warning triangle** on a collapsed row means one of its assignments has a problem (a deleted group or filter). Unfold the row to see which one.
* Every filter and both search boxes keep working. A resource is listed when at least one of its assignments passes the filters, and unfolding it shows only those assignments. Searching for a group name lists the resources that are assigned to that group.
* Paging counts resources, not assignments. The line above the table shows both numbers.
* Group and filter names inside an unfolded row are still clickable and open the same dialogs as in the flat view.

Your choice is remembered in this browser and applies the next time you open the page. Exports are not affected by the view: both exports always contain one line per assignment.

***

## Filtering the Data

The filter bar (click **Filters** to expand it) lets you narrow down results without losing the full dataset. All filters work together — each one you add further reduces the results shown.

| Filter              | What It Does                                                                        |
| ------------------- | ----------------------------------------------------------------------------------- |
| **Assignment Type** | Show only specific targeting methods (e.g., only group assignments, only All Users) |
| **Status**          | Show only Assigned, only Not Assigned, only Tenant Default, or any combination       |
| **Platform**        | Limit to a specific device platform                                                 |
| **Resource Type**   | Focus on a specific type of Intune resource                                         |
| **Filter Type**     | Show only assignments using Include filters, Exclude filters, or no filter at all   |
| **Role Scope Tags** | Narrow by RBAC scope tags assigned to resources                                     |

To remove all active filters at once, click **Clear Filters**.

***

## Search

Use the **Search** box at the top of the table to do a free-text search across:

* Resource name
* Target name
* Assignment type
* Resource type
* Platform
* Filter name

This is useful when you know part of a name and want to find it quickly without setting up formal filters.

***

## Clicking on Groups

In the **Target** column, group names are clickable. Clicking a group name opens a **Group Details dialog** that shows:

* Group display name and description
* Membership type (assigned or dynamic)
* Number of users, devices, and nested groups
* Member list (if available)

This allows you to quickly understand who is affected by an assignment without leaving the page.

***

## Clicking on Filters

In the **Filter** column, any filter name that is linked can be clicked to open a **Filter Details dialog** showing:

* Filter display name and description
* Platform the filter targets
* The filter rule expression

***

## Exporting the Data

Click the **Export** button to download the current view (including any active filters and search) as a CSV file. The export includes all visible columns plus Role Scope Tags.

**Filename:** `assignments-overview.csv`

{% hint style="info" %}
💡 Use the export for audit reports, change management documentation, or sharing with stakeholders who do not have access to the portal.
{% endhint %}

***

## Summary Stats

Above the table, a small stats bar shows key numbers at a glance:

* **Total Assignments** — count of rows in the current filtered view
* **Assigned** — how many are actively assigned
* **Not Assigned** — resources that exist but have no assignment
* **Tenant Default** — built-in defaults that Intune applies to everything (see below)
* **Resource Types** — how many distinct resource categories are present
* **Platforms** — how many platforms are represented

***

## Common Use Cases

### Audit: What policies are assigned to All Devices?

→ Set **Assignment Type** filter to `All Devices`

### Audit: Which resources have no assignment at all?

→ Set **Status** filter to `Not Assigned`

### Security review: Are there assignments without any scope tag?

→ Set **Role Scope Tags** filter — rows without tags will be visible when no tag filter is selected

### Troubleshooting: Find a specific policy quickly

→ Type the policy name in the **Search** box

***

## Related Pages

* [App Assignments](app-assignments.md) — focused app-only view
* [Group Assignments](group-assignments.md) — look up a specific group
* [User Assignments](./#user-assignments) — look up a specific user
* [Filter Assignments](assignments-with-filters.md) — understand how filters are used
