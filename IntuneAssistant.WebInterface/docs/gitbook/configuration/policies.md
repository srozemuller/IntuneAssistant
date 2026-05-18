# Intune Policy Overview

## What Is This Page?

The **Intune Policy Overview** page is a complete inventory of every configuration policy in your Intune tenant. It fetches all policy types in a single request — Settings Catalog policies, Device Configuration profiles, Compliance policies, Security Baselines, Administrative Templates, and anything else that lives under configuration in Intune — and presents them in one filterable, searchable, exportable table.

Beyond listing what exists, the page shows you whether each policy is assigned, which groups or built-in targets it is assigned to (including exclusions), how many settings it contains, and when it was last touched. You can select multiple policies and export or permanently delete them in bulk.

---

## Why Would You Use This?

- You want a single, complete inventory of every configuration policy in the tenant
- You need to identify policies that exist but have no assignment — they apply to nobody and are candidates for cleanup
- You are preparing for a policy review, handover, or audit and need a structured export
- You want to check when policies were created or last modified to understand whether they are current
- You need to delete a batch of old or redundant policies safely, with a confirmation step
- You want to see exactly which groups are included in or excluded from a policy's assignment without opening each policy individually in the Intune portal

---

## How to Load the Data

1. Navigate to **Configuration → Policy Overview**
2. Click **Load Policies**
3. Intune Assistant fetches all configuration policies from Microsoft Graph simultaneously with the group list and assignment filters
4. The table populates once all three data sources have responded

> ❌ **Cancel:** A **Cancel** button appears while loading is in progress. Clicking it stops the request immediately and shows a retry card.

> 📸 _[Screenshot placeholder: Page in initial state showing the welcome card with a large Settings icon, a description, and the Load Policies button]_

---

## Understanding the Table

Each row in the table represents one policy. The columns are:

| Column | What It Shows |
|---|---|
| **Policy Name** | The policy name as it appears in Intune. If a description exists, it is shown in smaller muted text below the name — up to two lines, truncated if long. Click any row to open the full **Policy Details** dialog |
| **Type** | The policy type, shown as an outlined badge — e.g., `Settings Catalog`, `Device Configuration`, `Compliance Policy`, `Security Baseline`, `Administrative Template` |
| **Platform** | The device platform the policy targets. Colour-coded: blue for Windows (`windows10` / `windows10andlater`), green for Android, grey for iOS, purple for macOS |
| **Assignments** | Up to 2 assignment targets shown directly in the cell. Each target is either a built-in label (`All Devices`, `All Users`) or a clickable group name. Groups excluded from the assignment are shown with a red **⊖** prefix. If there are more than 2 assignments, a `+N more` indicator appears. Click any group name to open the Group Details dialog |
| **Settings** | The number of individual settings inside the policy, shown as a plain number |
| **Status** | **Assigned** (green badge) if the policy has at least one assignment target, or **Not Assigned** (grey badge) if it has none |
| **Created** | The date the policy was created in Intune |
| **Modified** | The date the policy was last modified |

### Assignment Target Types

Assignments shown in the table and in the Policy Details dialog can be any of the following:

| Type | What It Means |
|---|---|
| **All Devices** | The policy applies to every enrolled device in the tenant regardless of group |
| **All Users** | The policy applies to every licensed user in the tenant |
| **Group name (blue)** | The policy is assigned to a specific Entra ID group — click to see group details |
| **⊖ Group name (red)** | The group is **excluded** from the policy — devices and users in this group are skipped |

> 📸 _[Screenshot placeholder: Policy table showing several rows — Settings Catalog and Device Configuration types with blue and green platform badges, clickable group names and a red ⊖ excluded group in the Assignments column, green Assigned and grey Not Assigned status badges, and Created / Modified date columns]_

---

## Clicking on a Policy Row

Clicking anywhere on a row (except on a group name link) opens the **Policy Details dialog**. This is a full-screen panel showing all information about the selected policy in one place.

### Policy Information

| Field | What It Shows |
|---|---|
| Name | Full policy name |
| Description | Full description text (untruncated) |
| Type | Policy type badge |
| Platform | Platform badge |
| Settings Count | Total number of settings in the policy |

### Timestamps

| Field | What It Shows |
|---|---|
| Created | Full date and time the policy was created |
| Last Modified | Full date and time the policy was last saved |
| Assignment Status | Assigned or Not Assigned badge |

### Assignments

All assignment targets for the policy are listed. Each entry shows:
- The group name (clickable, opens Group Details) or the built-in label (`All Users`, `All Devices`)
- A **⊖** prefix in red for excluded groups
- Any **assignment filter** attached to the assignment — the filter name is shown in purple and is clickable, opening the **Filter Details dialog** with the filter rule expression, platform, and management type

### Settings

The raw settings payload for the policy is displayed as formatted JSON. This is the exact data structure Intune uses to apply the settings to enrolled devices.

> 📸 _[Screenshot placeholder: Policy Details dialog open for a Settings Catalog policy. Left column shows name, type, platform, settings count. Right column shows created/modified timestamps and assignment status. Below: assignments list with two groups and one filter. Below that: JSON settings block in a scrollable code area]_

---

## Filters

Four controls are available in the filter panel above the table:

| Filter | What It Does |
|---|---|
| **Search** | Free-text search across the policy name, policy type, platform value, and description text |
| **Policy Type** | Multi-select — show only specific policy types from the values present in your tenant |
| **Status** | Multi-select — show only `Assigned`, only `Not Assigned`, or both |
| **Platform** | Multi-select — show only policies targeting a specific platform |

When at least one filter is active, a count is shown: `Showing X of Y policies`.

Click **Clear All** to reset all filters at once. Each filter resets the table to page 1 automatically.

> 📸 _[Screenshot placeholder: Filter bar with four controls — a search box containing text, the Policy Type multi-select open showing checkbox options, Status and Platform selectors — and the Clear All button on the right]_

---

## Selecting Policies — Bulk Actions

The table has a checkbox column on the left. Selecting one or more rows activates the **Bulk Actions bar**, which appears as a highlighted blue card above the table.

The bar shows:
- How many policies are currently selected (e.g., `3 policies selected`)
- A **Clear Selection** link to deselect all
- Two action buttons:

### Export Selected

Downloads only the selected policies as a report file. You can choose CSV, PDF, or HTML format. The export content is identical to the standard export (see below) but scoped to only the selected rows.

### Delete Selected

Permanently deletes the selected policies from Intune.

> ⚠️ **This action cannot be undone.** Before any deletion happens, a browser confirmation dialog appears: `Are you sure you want to delete N selected policies? This action cannot be undone.` You must confirm to proceed.

After successful deletion, the page automatically reloads the policy list and clears the selection.

> 📸 _[Screenshot placeholder: Blue Bulk Actions bar above the table showing "3 policies selected", Clear Selection link, Export Selected button, and a red Delete Selected button with a trash icon]_

---

## Exporting the Full List

After policies are loaded, an **Export** button appears in the top-right area. Clicking it opens an export options menu.

**Available formats:** CSV, PDF, HTML

**Filename:** `configuration-policies` (with the appropriate extension)

The export includes one row per policy with these columns:

| Export Column | Content |
|---|---|
| Policy Name | The policy's display name |
| Type | Policy type string |
| Platform | Platform string |
| Assignment Status | `Assigned` or `Not Assigned` |
| Assignment Count | Number of assignment targets |
| Settings Count | Number of settings in the policy |
| Created | Creation date |
| Last Modified | Last modified date |

The export document also includes a stats summary block:
- **Total Policies** — total count in the exported set
- **Assigned** — number of assigned policies
- **Not Assigned** — number of unassigned policies

---

## Common Use Cases

**Find all policies that are not assigned to anyone**
Set the **Status** filter to `Not Assigned`. These policies consume space in your tenant but do nothing. Review them and use **Delete Selected** to clean them up after confirming they are genuinely unused.

**Which policies target Windows devices?**
Set **Platform** to `Windows10` (or the Windows value used in your tenant). Combine with **Policy Type** to further narrow to, for example, only Compliance policies.

**When was this policy last changed and by whom?**
Click the policy row to open Policy Details. The full last-modified timestamp is in the Timestamps section. Note: Intune Assistant shows when the policy was last modified but not who modified it — for that, check the Intune Audit Log.

**Clean up old Administrative Templates after migrating to Settings Catalog**
Set **Policy Type** to `Administrative Template`, review the list, confirm they have been replaced, then select all and use **Delete Selected**.

**Export a policy inventory for an audit**
Apply any relevant filters (e.g., platform = Windows, type = Compliance Policy), then click **Export** and choose PDF or HTML for a formatted report with the stats summary included.

**Verify a new policy is correctly assigned before rollout**
Search for the policy name. In the **Assignments** column you can immediately see which groups are included and whether any are excluded — without opening the Intune portal.

---

## Related Pages

- [Policy Settings Overview](./settings.md) — drill into the individual settings inside each policy
- [Configuration Overview](./README.md) — how the two configuration pages work together
- [Group Assignments](../assistant/assignments/group-assignments.md) — see all policies assigned to a specific group
- [All Assignments](../assistant/assignments/all-assignments.md) — full assignment inventory across all resource types
- [Filter Assignments](../assistant/assignments/filter-assignments.md) — understand the assignment filters used on policies
