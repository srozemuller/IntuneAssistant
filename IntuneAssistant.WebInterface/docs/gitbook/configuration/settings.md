# Policy Settings Overview

## What Is This Page?

The **Policy Settings Overview** page unpacks every configuration policy in your Intune tenant into its individual settings and shows them all in a single flat table. Where the [Policy Overview](./policies.md) answers "which policies exist?", this page answers "what is each policy actually doing?" — right down to the setting name, the configured value, the source policy, the platform, and whether the policy is currently assigned.

The page also does something the Intune portal cannot do on its own: it automatically cross-references all settings across all policies and flags **duplicate settings** (the same setting configured to the same value in multiple policies targeting the same groups) and **conflicting settings** (the same setting configured to *different* values in policies that overlap in their assignment targets). This makes it the primary tool for configuration hygiene and security auditing.

---

## Why Would You Use This?

- You want to understand your device configuration at the individual setting level, not just the policy level
- You need to find settings that are configured in more than one place — common after tenant growth, migrations, or team changes over time
- You need to detect and resolve **conflicting settings** before they cause unpredictable device behaviour
- You are migrating from legacy Device Configuration profiles or ADMX Group Policy to the modern Settings Catalog and need to see exactly which settings are already covered
- You need to audit the complete configuration state of a tenant for a security review, ISO 27001 assessment, or compliance framework
- You want a structured export of all settings including values, sources, platforms, and conflict status

---

## How Data Is Loaded

This page does **not** load everything in a single request. Settings are fetched from three separate Intune sources in sequence. A **progress bar** with a step indicator is shown while loading:

| Step | Label | What Is Fetched |
|---|---|---|
| 1 of 3 | **Settings Catalog** | All settings inside Settings Catalog policies |
| 2 of 3 | **Device Configuration** | All settings inside Device Configuration profiles, including OMA-URI custom settings |
| 3 of 3 | **Group Policy** | All settings from Administrative Templates and Group Policy Analytics ingested into Intune |

The progress bar shows the current status of each step:
- `✓` — completed
- `⟳` — in progress (currently fetching)
- `○` — waiting

A step counter shows `1/3`, `2/3`, `3/3` as each source completes.

Once all three steps finish, **duplicate and conflict detection runs automatically** across the full merged dataset before the table is rendered.

> ❌ **Cancel:** A **Cancel** button appears during loading. Clicking it stops all pending requests and shows a retry card. Any steps that had already completed are discarded — clicking Retry starts all three steps fresh.

> 📸 _[Screenshot placeholder: Progress bar showing three labelled steps — Settings Catalog with a checkmark, Device Configuration with a spinner, Group Policy with a circle — a percentage bar above them, and a step counter on the right]_

> 📸 _[Screenshot placeholder: While loading, a table skeleton (shimmer placeholder rows) is visible below the progress bar, giving a preview of the table layout before data arrives]_

---

## Understanding the Table

Each row in the table is a single **setting** from a single policy. The columns are:

| Column | What It Shows |
|---|---|
| **Policy Name** | The name of the policy this setting belongs to. Below the policy name, a coloured **source badge** shows the origin (see Source Badges below). If the setting has been flagged as a duplicate or conflict, an additional **clickable badge** appears here |
| **Setting Name** | The display name of the setting. For Device Configuration OMA-URI custom settings, the OMA-URI path is shown in smaller muted text below the setting name. If the setting ID was used as the name (no display name resolved), the ID is shown |
| **Setting Value** | The configured value for this setting. Values longer than 50 characters are truncated — hover to read the full value. For settings flagged as **Conflict**, the value is highlighted in **red** to draw attention |
| **Platform** | The platform string of the parent policy (e.g., `windows10`, `iOS`, `Android`) |
| **Assigned** | Whether the parent policy has at least one assignment. Shows a clickable green **Assigned** badge (opens the Assignments dialog) or a grey **Not Assigned** badge |
| **Child Settings** | For Settings Catalog settings that have sub-options, shows a `N child settings` expandable link. Click to expand the sub-settings inline. Automatically expands and highlights matching children in amber when a search term matches |

---

## Source Badges

Every row has a source badge in the Policy Name cell indicating which Intune engine the setting came from:

| Colour | Source | Description |
|---|---|---|
| 🔵 Blue | **Settings Catalog** | Modern policy settings — the recommended approach for new configurations |
| 🟣 Purple | **Device Config** | Legacy Device Configuration profiles — older approach, still widely used |
| 🟢 Green | **Group Policy** | ADMX-based Administrative Templates or Group Policy Analytics ingested into Intune |

---

## Duplicate and Conflict Detection

After all three sources are loaded, the page runs an automatic analysis across the full dataset. Every setting is checked against every other setting of the same name, looking for cases where:

1. The same setting appears in multiple policies
2. Those policies have **overlapping assignment targets** — meaning at least one group (or built-in target) is shared between them

Only settings in policies that actually target the same devices or users are compared. A setting that appears in two policies assigned to completely different groups is **not** flagged.

### Duplicate (yellow badge)

A **Duplicate** means the same setting is configured to the **same value** in two or more policies that overlap in their assignments.

- This is not necessarily causing harm, but it is unnecessary and can create confusion
- It commonly appears during migrations when a new Settings Catalog policy is created to replace an old Device Configuration profile but the old profile has not yet been removed
- Click the yellow **Duplicate** badge to open the Duplicate Details dialog

### Conflict (red badge)

A **Conflict** means the same setting is configured to **different values** in two or more policies that overlap in their assignments.

- This means Intune is sending contradictory instructions to the same device
- The device will apply one value or the other depending on policy conflict resolution precedence — which may not be the intended outcome
- Conflicts should be investigated and resolved: either consolidate into one policy or ensure the conflicting policies target different groups
- Click the red **Conflict** badge to open the Conflict Details dialog

> ⚠️ **Conflicts represent a real configuration risk.** A device receiving conflicting settings may end up in an indeterminate state that does not match either policy's intent. Treat conflict badges as action items.

> 📸 _[Screenshot placeholder: Table rows showing a yellow Duplicate badge below the source badge in the Policy Name cell on one row, and a red Conflict badge on another row. The Setting Value cell on the conflict row has its value in red text]_

---

## The Duplicate / Conflict Details Dialog

Clicking a **Duplicate** or **Conflict** badge opens a detail dialog. The dialog is structured into two sections:

### This Policy

Shows a highlighted card for the current row's policy with:
- Policy name
- Configured setting value

The card is highlighted in **yellow** for duplicates and **red** for conflicts.

### Conflicting / Duplicate in N Other Policies

Lists every other policy that has the same setting with overlapping assignments. Each entry shows:
- Policy name
- Source badge (Settings Catalog / Device Config / Group Policy)
- The setting value configured in that policy
- A **red triangle icon** if the value differs from the current row's value

This gives you exactly what you need to decide which policy to keep and which to clean up or merge.

> 📸 _[Screenshot placeholder: Conflict dialog showing two stacked cards — the top card in red showing "Policy: Windows Security Baseline" with value "AES256", the bottom card showing "Policy: Legacy Device Config" with value "AES128" in red text and a red triangle warning icon. A purple Device Config source badge is on the second card]_

---

## The Assignments Dialog

When a row shows a green **Assigned** badge in the Assigned column, clicking it opens the **Assignments dialog** for that policy.

The dialog shows:
- A section for **Group Assignments** — each assigned group is shown with its display name (fetched live), the GUID below it in small monospace text, and a **View Group** button
- A section for **Other Assignments** — built-in targets (All Users, All Devices) shown as their raw odata type string
- The total assignment count in the dialog header

The display names of groups are loaded asynchronously while the dialog is open — a shimmer placeholder appears until the name resolves. Clicking **View Group** on any entry closes the Assignments dialog and opens the **Group Details dialog** for that group.

> 📸 _[Screenshot placeholder: Assignments dialog showing two group assignment rows with display names, GUID sub-text, and View Group buttons. A header shows "3 assignments configured" and a group assignments sub-header above the rows]_

---

## Filters Panel

The **Filters** header is a clickable toggle. Click it to expand or collapse the filter controls.

When collapsed, any **active filters are shown as chips** in a summary row beneath the header — so you always know what is filtering the table even with the panel closed. The header also shows a badge like `2 active` when filters are set.

| Filter | Options | What It Does |
|---|---|---|
| **Source** | Settings Catalog, Device Config, Group Policy | Show settings from one or more specific policy engines |
| **Platform** | Values from your tenant | Limit to a specific device platform |
| **Status** | OK, Duplicate, Conflict | Show only clean settings, only duplicates, only conflicts, or any combination |
| **Assignment** | Assigned, Not Assigned | Show only settings from assigned policies, or only from unassigned ones |

When filters are active, a count shows: `Showing X of Y settings`.

Click **Clear All** to reset everything at once.

> 📸 _[Screenshot placeholder: Filters panel expanded with four multi-select dropdowns. The Status dropdown is open showing OK, Duplicate, and Conflict checkboxes with Conflict checked. The collapse-able header shows "Filters" with a chevron and "1 active" badge]_

---

## Clickable Stats Bar

Below the filters panel, a row of **clickable stat badges** is shown. Each badge both displays a count and acts as a shortcut to toggle a filter:

| Badge | Colour | Click Action |
|---|---|---|
| **N total settings** | Default (dark) | Clears all filters — shows the complete unfiltered dataset |
| **N Settings Catalog** | 🔵 Blue | Toggles the Settings Catalog source filter on/off |
| **N Device Config** | 🟣 Purple | Toggles the Device Config source filter on/off |
| **N Group Policy** | 🟢 Green | Toggles the Group Policy source filter on/off |
| **N duplicates** | 🟡 Yellow | Toggles the Duplicate status filter on/off |
| **N conflicts** | 🔴 Red | Toggles the Conflict status filter on/off |

An active filter badge shows a **coloured ring** around it. Clicking again removes the filter. If both duplicates and conflicts are zero, those badges are not shown.

When any filter is active, a text suffix shows: `— showing X of Y`.

> 📸 _[Screenshot placeholder: Stats bar showing six badges in a row: a dark total badge, blue Settings Catalog, purple Device Config, green Group Policy, yellow duplicates, and a red conflicts badge with a ring indicating it is currently active]_

---

## Search

A search box is available at the top of the table. It searches simultaneously across:
- Setting name
- Policy name
- Setting value

Results update live as you type.

**Child settings aware:** When a search term matches a child sub-setting (not the parent setting name), the parent row automatically expands its child settings panel and highlights the matching children in **amber**. The match count is shown next to the expand link: `3 child settings (1 match)`.

---

## Exporting the Data

After data is loaded, an **Export** button appears in the top-right area.

**Available formats:** CSV, PDF, HTML

**Filename:** `policy-settings` (with the appropriate extension)

The export respects all active filters — only the rows currently visible in the table are included.

The export includes one row per setting with these columns:

| Export Column | Content |
|---|---|
| Policy Name | Name of the parent policy |
| Setting Name | Display name of the setting |
| Setting Value | Configured value |
| OMA-URI | The OMA-URI path (Device Config custom settings only, blank otherwise) |
| Source | `catalog`, `deviceconfig`, or `grouppolicy` |
| Platform | Platform string |
| Assigned | `true` or `false` |
| Status | `ok`, `duplicate`, or `conflict` |

The export stats summary includes:
- Total setting count
- Settings Catalog count
- Device Config count
- Group Policy count
- Duplicate count
- Conflict count

---

## Common Use Cases

**Are there any conflicting settings in my tenant?**
Check the stats bar immediately after loading. If the red **Conflicts** badge shows any number greater than zero, click it to jump straight to a filtered view showing only conflicting rows. Click each Conflict badge to understand which policies are involved and what values they are each setting.

**I am migrating from Device Configuration to Settings Catalog — what is already covered?**
Enable both **Settings Catalog** and **Device Config** source filters, then set **Status** to `Duplicate`. Every row that appears is a setting that exists in both systems with the same value — those Device Config settings are safe to remove once you have confirmed the Settings Catalog policy is assigned correctly.

**Full audit of all device configuration settings**
Load the page with no filters active and click **Export → CSV**. This produces a complete, line-by-line manifest of every setting configured across your entire tenant.

**A device has a setting applied that I cannot explain**
Search for the setting name in the search box. All policies that configure that setting will appear. Check the source and the Assigned badge to understand which one is reaching the device.

**Which ADMX / Group Policy settings have been imported into Intune?**
Set the **Source** filter to `Group Policy`.

**Check whether an unassigned policy contains any settings worth keeping**
Set the **Assignment** filter to `Not Assigned`. Review the settings list — if the policy contains valuable settings, assign it or merge them into an existing active policy before deleting it.

**Compare Windows and iOS configuration**
Set **Platform** to `Windows10` first, export the result. Then reset and set **Platform** to `iOS`, export again. You now have a per-platform configuration manifest.

---

## Related Pages

- [Intune Policy Overview](./policies.md) — see the policies these settings belong to, and manage them in bulk
- [Configuration Overview](./README.md) — how the two configuration pages work together
- [All Assignments](../assistant/assignments/all-assignments.md) — see which groups each policy is assigned to
- [Group Assignments](../assistant/assignments/group-assignments.md) — see all configuration policies assigned to a specific group
