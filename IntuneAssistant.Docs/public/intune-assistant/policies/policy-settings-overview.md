# Policy Settings Overview

## What Is This Page?

The **Policy Settings Overview** page unpacks every configuration policy in your Intune tenant into its individual settings and shows them all in a single flat table. Where the [Policy Overview](policy-overview.md) answers "which policies exist?", this page answers "what is each policy actually doing?" — right down to the setting name, the configured value, the source policy, the platform, and whether the policy is currently assigned.

Compliance policies are included too — instead of their configuration rules, each row shows one of their **Actions for non-compliance** (mark non-compliant, grace period, message template, additional recipients), since that's the part of a compliance policy that's easy to lose track of across dozens of policies.

The page also does something the Intune portal cannot do on its own: it automatically cross-references all settings across all policies and flags **duplicate settings** (the same setting configured to the same value in multiple policies targeting the same groups) and **conflicting settings** (the same setting configured to _different_ values in policies that overlap in their assignment targets). This makes it the primary tool for configuration hygiene and security auditing.

***

## Why Would You Use This?

* You want to understand your device configuration at the individual setting level, not just the policy level
* You need to find settings that are configured in more than one place — common after tenant growth, migrations, or team changes over time
* You need to detect and resolve **conflicting settings** before they cause unpredictable device behaviour
* You are migrating from legacy Device Configuration profiles or ADMX Group Policy to the modern Settings Catalog and need to see exactly which settings are already covered
* You need to audit the complete configuration state of a tenant for a security review, ISO 27001 assessment, or compliance framework
* You want a structured export of all settings including values, sources, platforms, and conflict status

***

## How Data Is Loaded

Clicking **Load Settings** fetches and analyzes everything in a single request: Settings Catalog, Device Configuration, Group Policy, and Compliance settings are combined and cross-referenced for duplicates and conflicts on the server before anything is sent back. A loading card is shown while this runs.

> **Cancel:** A **Cancel** button appears during loading. Clicking it stops the request and shows a retry card.

### Categories to Check

Above the **Load Settings** button, a row of checkboxes — **Settings Catalog**, **Device Config**, **Group Policy**, **Compliance** — lets you choose which categories to fetch. All four are selected by default. Unchecking a category skips it entirely on the server, so if you only care about, say, Settings Catalog, unchecking the others makes the load noticeably faster on large tenants. At least one category must stay checked — **Load Settings** is disabled otherwise. Changing the selection and clicking **Refresh** re-runs the load with the new selection.

***

## Understanding the Table

Each row in the table is a single **setting** from a single policy. The columns are:

| Column             | What It Shows                                                                                                                                                                                                                                             |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Policy Name**    | The name of the policy this setting belongs to. Below the policy name, a coloured **source badge** shows the origin (see Source Badges below). If the setting has been flagged as a duplicate or conflict, an additional **clickable badge** appears here |
| **Setting Name**   | The display name of the setting. For Device Configuration OMA-URI custom settings, the OMA-URI path is shown in smaller muted text below the setting name. If the setting ID was used as the name (no display name resolved), the ID is shown. If the OMA-URI setting has a modern Settings Catalog equivalent, a blue **Migration Available** badge appears underneath — see [Settings Catalog Migration Suggestions](#settings-catalog-migration-suggestions) below. For **Compliance** rows, this shows `Non-compliance action: <type>` (e.g. `notification`, `block`, `retire`) instead of a configuration setting name |
| **Setting Value**  | The configured value for this setting, wrapping onto up to two lines — widen the column by dragging its border to see more, or hover for the full value. For settings flagged as **Conflict**, the value is highlighted in **red** to draw attention. For **Compliance** rows, this shows a compact list — Grace Period, Message Template, Additional Recipients — instead of one sentence, so it's readable at a glance; the same three items are also available under **Child Settings** in an expandable form |
| **Platform**       | The platform string of the parent policy (e.g., `windows10`, `iOS`, `Android`)                                                                                                                                                                            |
| **Assigned**       | Whether the parent policy has at least one assignment. Shows a clickable green **Assigned** badge (opens the Assignments dialog) or a grey **Not Assigned** badge                                                                                         |
| **Child Settings** | For Settings Catalog settings that have sub-options, shows a `N child settings` expandable link. This count includes settings nested at any depth (a sub-setting can itself have its own sub-settings, and so on). Click to expand the sub-settings inline — nested sub-settings are shown indented under their parent. Automatically expands the full path to any matching child, at any depth, and highlights the match in amber when a search term matches. **Compliance** rows use the same expandable breakdown to show Grace Period, Message Template, and Additional Recipients individually, instead of one dense line |

***

## Source Badges

Every row has a source badge in the Policy Name cell indicating which Intune engine the setting came from:

| Colour | Source               | Description                                                                        |
| ------ | -------------------- | ---------------------------------------------------------------------------------- |
| Blue   | **Settings Catalog** | Modern policy settings — the recommended approach for new configurations           |
| Purple | **Device Config**    | Legacy Device Configuration profiles — older approach, still widely used           |
| Green  | **Group Policy**     | ADMX-based Administrative Templates or Group Policy Analytics ingested into Intune |
| Amber  | **Compliance**       | Actions for non-compliance from Compliance policies                                |

***

## Duplicate and Conflict Detection

After all three sources are loaded, the page runs an automatic analysis across the full dataset. Every setting is checked against every other setting of the same name, looking for cases where:

1. The same setting appears in multiple policies
2. Those policies have **overlapping assignment targets** — meaning at least one group (or built-in target) is shared between them

Only settings in policies that actually target the same devices or users are compared. A setting that appears in two policies assigned to completely different groups is **not** flagged.

### Duplicate (yellow badge)

A **Duplicate** means the same setting is configured to the **same value** in two or more policies that overlap in their assignments.

* This is not necessarily causing harm, but it is unnecessary and can create confusion
* It commonly appears during migrations when a new Settings Catalog policy is created to replace an old Device Configuration profile but the old profile has not yet been removed
* Click the yellow **Duplicate** badge to open the Duplicate Details dialog

### Conflict (red badge)

A **Conflict** means the same setting is configured to **different values** in two or more policies that overlap in their assignments.

* This means Intune is sending contradictory instructions to the same device
* The device will apply one value or the other depending on policy conflict resolution precedence — which may not be the intended outcome
* Conflicts should be investigated and resolved: either consolidate into one policy or ensure the conflicting policies target different groups
* Click the red **Conflict** badge to open the Conflict Details dialog

> ⚠️ **Conflicts represent a real configuration risk.** A device receiving conflicting settings may end up in an indeterminate state that does not match either policy's intent. Treat conflict badges as action items.

**For Compliance rows**, duplicate/conflict detection works the same way but on non-compliance actions instead of configuration settings — for example, a **Conflict** on a `Non-compliance action: notification` row means two compliance policies with overlapping assignments handle non-compliance differently (different grace period, message template, or recipients). That's not a device-state risk like a Settings Catalog conflict, but it usually means non-compliant users get an inconsistent experience depending on which policy catches them first — worth reviewing.

***

## Settings Catalog Migration Suggestions

Many legacy OMA-URI custom settings in Device Configuration profiles have a direct equivalent in the modern Settings Catalog. When that's the case, the row for that setting shows a blue **Migration Available** badge underneath the setting name.

Click the badge to open the **Migration Suggestion** dialog, which shows:

* The current OMA-URI setting name and path
* The name of the equivalent Settings Catalog setting, with a **Copy name** button so you can search for it directly when creating a Configuration Policy in Intune
* A description of what the Settings Catalog setting does
* The full JSON for a ready-to-import Configuration Policy that reproduces the same configuration, with **Copy** and **Download** buttons — the downloaded file can be uploaded straight into Intune to create the migrated policy

Migrating flagged settings to the Settings Catalog gets you improved reporting and Intune's built-in policy conflict detection, which OMA-URI custom settings do not support.

The **N migrations available** badge in the [Clickable Stats Bar](#clickable-stats-bar) shows how many settings across the tenant have a migration suggestion, and the **Migration Available** status filter isolates just those rows.

***

## The Duplicate / Conflict Details Dialog

Clicking a **Duplicate** or **Conflict** badge opens a detail dialog. The dialog is structured into two sections:

### This Policy

Shows a highlighted card for the current row's policy with:

* Policy name
* Configured setting value

The card is highlighted in **yellow** for duplicates and **red** for conflicts.

### Conflicting / Duplicate in N Other Policies

Lists every other policy that has the same setting with overlapping assignments. Each entry shows:

* Policy name
* Source badge (Settings Catalog / Device Config / Group Policy / Compliance)
* The setting value configured in that policy
* A **red triangle icon** if the value differs from the current row's value
* A short explanation of **why** the two policies were flagged together — the specific group, "All Devices", or "All Users" they both target (with the group's real display name, not just its ID). If assignment information could not be determined for one of the policies, this instead says the scope is unknown and the pair was flagged conservatively rather than silently hidden

This gives you exactly what you need to decide which policy to keep and which to clean up or merge.

***

## The Assignments Dialog

When a row shows a green **Assigned** badge in the Assigned column, clicking it opens the **Assignments dialog** for that policy.

The dialog shows:

* A section for **Group Assignments** — each assigned group is shown with its display name (fetched live), the GUID below it in small monospace text, and a **View Group** button
* A section for **Other Assignments** — built-in targets (All Users, All Devices) shown as their raw odata type string
* The total assignment count in the dialog header

The display names of groups are loaded asynchronously while the dialog is open — a shimmer placeholder appears until the name resolves. Clicking **View Group** on any entry closes the Assignments dialog and opens the **Group Details dialog** for that group.

***

## Filters Panel

The **Filters** header is a clickable toggle. Click it to expand or collapse the filter controls.

When collapsed, any **active filters are shown as chips** in a summary row beneath the header — so you always know what is filtering the table even with the panel closed. The header also shows a badge like `2 active` when filters are set.

| Filter         | Options                                       | What It Does                                                                  |
| -------------- | --------------------------------------------- | ----------------------------------------------------------------------------- |
| **Source**     | Settings Catalog, Device Config, Group Policy, Compliance | Show settings from one or more specific policy engines            |
| **Platform**   | Values from your tenant                       | Limit to a specific device platform                                           |
| **Status**     | OK, Duplicate, Conflict, Migration Available  | Show only clean settings, only duplicates, only conflicts, only settings with a Settings Catalog migration available, or any combination |
| **Assignment** | Assigned, Not Assigned                        | Show only settings from assigned policies, or only from unassigned ones       |

When filters are active, a count shows: `Showing X of Y settings`.

Click **Clear All** to reset everything at once.

***

## Clickable Stats Bar

Below the filters panel, a row of **clickable stat badges** is shown. Each badge both displays a count and acts as a shortcut to toggle a filter:

| Badge                  | Click Action                                               |
| ---------------------- | ---------------------------------------------------------- |
| **N total settings**   | Clears all filters — shows the complete unfiltered dataset |
| **N Settings Catalog** | Toggles the Settings Catalog source filter on/off          |
| **N Device Config**    | Toggles the Device Config source filter on/off             |
| **N Group Policy**     | Toggles the Group Policy source filter on/off              |
| **N Compliance**       | Toggles the Compliance source filter on/off                |
| **N duplicates**       | Toggles the Duplicate status filter on/off                 |
| **N conflicts**        | Toggles the Conflict status filter on/off                  |
| **N migrations available** | Toggles the Migration Available status filter on/off   |

An active filter badge shows a **coloured ring** around it. Clicking again removes the filter. If both duplicates and conflicts are zero, those badges are not shown.

When any filter is active, a text suffix shows: `— showing X of Y`.

> 📸 _\[Screenshot placeholder: Stats bar showing six badges in a row: a dark total badge, blue Settings Catalog, purple Device Config, green Group Policy, yellow duplicates, and a red conflicts badge with a ring indicating it is currently active]_

***

## Search

A search box is available at the top of the table. It searches simultaneously across:

* Setting name
* Policy name
* Setting value

Results update live as you type.

You can exclude results by prefixing a word with `!` — for example `windows !conflict` shows Windows settings that are not flagged as conflicts. This works together with child-setting search below.

**Child settings aware, at any depth:** Search also looks inside child sub-settings — and their own child settings, no matter how deeply nested (for example, a "OneDrive" setting group containing a "Tenant Restrictions" setting, which itself contains an "Allowed Tenant IDs" value). When a search term matches anywhere in that nested structure, the parent row is included in the results, the child settings panel automatically expands down to the matching entry, and the match is highlighted in **amber**. The match count next to the expand link reflects matches at every level: `4 child settings (1 match)`.

***

## Exporting the Data

After data is loaded, an **Export** button appears in the top-right area.

**Available formats:** CSV, PDF, HTML

**Filename:** `policy-settings` (with the appropriate extension)

The export respects all active filters — only the rows currently visible in the table are included.

The export includes one row per setting with these columns:

| Export Column | Content                                                                |
| ------------- | ---------------------------------------------------------------------- |
| Policy Name   | Name of the parent policy                                              |
| Setting Name  | Display name of the setting                                            |
| Setting Value | Configured value                                                       |
| OMA-URI       | The OMA-URI path (Device Config custom settings only, blank otherwise) |
| Source        | `catalog`, `deviceconfig`, `grouppolicy`, or `compliance`              |
| Platform      | Platform string                                                        |
| Assigned      | `true` or `false`                                                      |
| Status        | `ok`, `duplicate`, or `conflict`                                       |

The export stats summary includes:

* Total setting count
* Settings Catalog count
* Device Config count
* Group Policy count
* Compliance count
* Duplicate count
* Conflict count

***

## Common Use Cases

**Are there any conflicting settings in my tenant?**\
Check the stats bar immediately after loading. If the red **Conflicts** badge shows any number greater than zero, click it to jump straight to a filtered view showing only conflicting rows. Click each Conflict badge to understand which policies are involved and what values they are each setting.

**I am migrating from Device Configuration to Settings Catalog — what is already covered?**\
Enable both **Settings Catalog** and **Device Config** source filters, then set **Status** to `Duplicate`. Every row that appears is a setting that exists in both systems with the same value — those Device Config settings are safe to remove once you have confirmed the Settings Catalog policy is assigned correctly.

**Full audit of all device configuration settings**\
Load the page with no filters active and click **Export → CSV**. This produces a complete, line-by-line manifest of every setting configured across your entire tenant.

**A device has a setting applied that I cannot explain**\
Search for the setting name in the search box. All policies that configure that setting will appear. Check the source and the Assigned badge to understand which one is reaching the device.

**Which ADMX / Group Policy settings have been imported into Intune?**\
Set the **Source** filter to `Group Policy`.

**Which OMA-URI settings can be migrated to the Settings Catalog?**\
Set the **Status** filter to `Migration Available`, or click the **N migrations available** stat badge. Click each **Migration Available** badge to see the equivalent Settings Catalog setting and download a ready-to-import Configuration Policy JSON.

**Check whether an unassigned policy contains any settings worth keeping**\
Set the **Assignment** filter to `Not Assigned`. Review the settings list — if the policy contains valuable settings, assign it or merge them into an existing active policy before deleting it.

**Compare Windows and iOS configuration**\
Set **Platform** to `Windows10` first, export the result. Then reset and set **Platform** to `iOS`, export again. You now have a per-platform configuration manifest.

**What does each compliance policy actually do when a device is non-compliant, without opening every policy?**\
Set the **Source** filter to `Compliance`. Each row shows the grace period, message template, and additional recipients for one non-compliance action — no more opening each compliance policy individually in the Intune portal to check.

**I only care about Compliance actions right now — can I skip the rest to load faster?**\
Yes — before clicking **Load Settings**, uncheck the categories you don't need in the **Categories to check** row. Only the checked categories are fetched from Intune.

***

## Related Pages

* [Intune Policy Overview](policy-overview.md) — see the policies these settings belong to, and manage them in bulk
* [All Assignments](../assignments/all-assignments.md) — see which groups each policy is assigned to
* [Group Assignments](../assignments/group-assignments.md) — see all configuration policies assigned to a specific group
