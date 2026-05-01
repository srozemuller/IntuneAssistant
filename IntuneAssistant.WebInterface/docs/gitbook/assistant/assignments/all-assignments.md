# All Assignments

## What Is This Page?

The **All Assignments** page gives you a complete, real-time snapshot of every assignment that exists in your Intune tenant — across every resource type, every platform, and every target group. Think of it as the "mission control" for your Intune assignment landscape.

Whether you are a helpdesk administrator trying to understand why a policy applies to a device, an architect reviewing the overall assignment structure, or a CISO wanting an audit trail, this page is your starting point.

---

## Why Would You Use This?

- You want to know **what is assigned, to whom, and how** — all in a single view
- You are conducting a **compliance or security audit** and need evidence of policy coverage
- You suspect **conflicting or missing assignments** and need to see the full picture
- You want to **export a report** of all assignments for documentation or review purposes
- You need to quickly check if a specific resource has an **assignment filter** applied

---

## How to Load the Data

1. Navigate to **Assistant → Assignments → All Assignments**
2. Click the **Load Data** button (top right area)
3. Intune Assistant fetches all assignments from your tenant via Microsoft Graph
4. The table populates with results — this may take a few seconds depending on tenant size

> ⏳ **Large tenants:** Fetching can take longer if you have thousands of policies and apps. A loading indicator shows progress.

> ❌ **Cancel at any time:** If the load is taking too long, use the **Cancel** button to stop the request without losing your session.

---

## Understanding the Table

Once loaded, the data is displayed in a table with the following columns:

| Column | What It Means |
|---|---|
| **Resource** | The name of the Intune object (policy, configuration profile, app, script, etc.) |
| **Type** | The resource category (e.g., Compliance Policy, Configuration Profile, Win32 App) |
| **Sub Type** | A more specific classification within the resource type |
| **Assignment** | How the resource is targeted — e.g., `Entra ID Group`, `All Users`, `All Devices` |
| **Target** | The name of the group, user, or built-in target the assignment points to |
| **Platform** | The device platform this resource applies to (Windows, iOS, Android, macOS, or All) |
| **Status** | Whether the resource is currently **Assigned** or **Not Assigned** |
| **Filter** | The name of an assignment filter applied (if any) — click to see filter details |
| **Filter Type** | Whether the filter is **Include** or **Exclude** |
| **Role Scope Tags** | Any RBAC scope tags associated with the resource |

### ⚠️ Warning Indicators

If a row shows a small **amber triangle** icon next to the resource name, it means Intune Assistant detected a potential issue with that assignment — for example, a group that no longer exists or an inconsistency in assignment data. Hover over the icon to read the warning message.

---

> 📸 _[Screenshot placeholder: All Assignments table with data loaded, showing multiple resource types and targets]_

---

## Filtering the Data

The filter bar (click **Filters** to expand it) lets you narrow down results without losing the full dataset. All filters work together — each one you add further reduces the results shown.

| Filter | What It Does |
|---|---|
| **Assignment Type** | Show only specific targeting methods (e.g., only group assignments, only All Users) |
| **Status** | Show only Assigned, only Not Assigned, or both |
| **Platform** | Limit to a specific device platform |
| **Resource Type** | Focus on a specific type of Intune resource |
| **Filter Type** | Show only assignments using Include filters, Exclude filters, or no filter at all |
| **Role Scope Tags** | Narrow by RBAC scope tags assigned to resources |

To remove all active filters at once, click **Clear Filters**.

---

> 📸 _[Screenshot placeholder: Filter bar expanded, showing multi-select dropdowns for Assignment Type and Platform]_

---

## Search

Use the **Search** box at the top of the table to do a free-text search across:
- Resource name
- Target name
- Assignment type
- Resource type
- Platform
- Filter name

This is useful when you know part of a name and want to find it quickly without setting up formal filters.

---

## Clicking on Groups

In the **Target** column, group names are clickable. Clicking a group name opens a **Group Details dialog** that shows:
- Group display name and description
- Membership type (assigned or dynamic)
- Number of users, devices, and nested groups
- Member list (if available)

This allows you to quickly understand who is affected by an assignment without leaving the page.

---

## Clicking on Filters

In the **Filter** column, any filter name that is linked can be clicked to open a **Filter Details dialog** showing:
- Filter display name and description
- Platform the filter targets
- The filter rule expression

---

## Exporting the Data

Click the **Export** button to download the current view (including any active filters and search) as a CSV file. The export includes all visible columns plus Role Scope Tags.

**Filename:** `assignments-overview.csv`

> 💡 Use the export for audit reports, change management documentation, or sharing with stakeholders who do not have access to the portal.

---

## Summary Stats

Above the table, a small stats bar shows key numbers at a glance:

- **Total Assignments** — count of rows in the current filtered view
- **Assigned** — how many are actively assigned
- **Not Assigned** — resources that exist but have no assignment
- **Resource Types** — how many distinct resource categories are present
- **Platforms** — how many platforms are represented

---

## Common Use Cases

### 🔎 Audit: What policies are assigned to All Devices?
→ Set **Assignment Type** filter to `All Devices`

### 🔎 Audit: Which resources have no assignment at all?
→ Set **Status** filter to `Not Assigned`

### 🔎 Security review: Are there assignments without any scope tag?
→ Set **Role Scope Tags** filter — rows without tags will be visible when no tag filter is selected

### 🔎 Troubleshooting: Find a specific policy quickly
→ Type the policy name in the **Search** box

---

## Related Pages

- [App Assignments](./app-assignments.md) — focused app-only view
- [Group Assignments](./group-assignments.md) — look up a specific group
- [User Assignments](./user-assignments.md) — look up a specific user
- [Filter Assignments](./filter-assignments.md) — understand how filters are used

