# Policy Comparison

## What Is This Page?

The **Policy Comparison** page lets you pick two Intune configuration policies and compare them setting by setting. Every setting that exists in either policy is listed, and for each one you can see the exact value configured in the **Source** policy and the exact value configured in the **Target** policy — side by side, in a colour-coded layout that makes differences immediately obvious.

The page tells you not just that two settings are different, but *what* the difference is, and in the case of complex settings with sub-options (child settings), it drills into every sub-option individually so nothing is hidden.

---

## Important — Which Policy Types Can Be Compared?

> ⚠️ **Only Settings Catalog policies are available for comparison.**

The comparison engine works with the structured data model of the **Settings Catalog**. Device Configuration profiles and Administrative Templates use a different data format and are not included in the policy picker on this page.

When you click **Load Policies**, only your `SettingsCatalog` type policies are fetched and shown in the dropdowns.

---

## Why Would You Use This?

- You created a policy for a new deployment ring and want to verify it matches your reference policy before assigning it
- Two teams manage separate policies for similar device types and you want to understand what is different between them
- You are migrating settings from one policy to another and need a detailed diff to track what has been moved
- You want to confirm that a cloned policy is truly identical to its original after modification
- You are doing a compliance review across environments (e.g., Production vs. Acceptance) and need a structured report of what differs
- You need to document what changed between a policy in its current state and a peer policy used as a baseline

---

## Step 1 — Load Policies

1. Navigate to **Compare → Policies**
2. Click **Load Policies**
3. Intune Assistant fetches all Settings Catalog policies from your tenant
4. The number of available policies is shown below the dropdowns: `Found N configuration policies`

> 📸 _[Screenshot placeholder: Welcome card with a large GitCompare icon, a description, and the Load Policies button centred below]_

---

## Step 2 — Select the Source Policy

The **Source Policy** is the reference — the policy you are comparing *from*. Think of it as the baseline.

1. Click the **Source Policy** dropdown
2. A searchable list opens showing all available Settings Catalog policies
3. Each entry in the list shows the **policy name** on one line and the **policy type and platform** on the line below
4. Type in the search box to filter by name or policy type
5. Click a policy to select it

Once a source policy is selected, the target policy dropdown becomes active.

> 📸 _[Screenshot placeholder: Source Policy dropdown open, showing a search box at the top and a list of policy entries each with a name line and a type/platform sub-line below]_

---

## Step 3 — Select the Target Policy

The **Target Policy** is the policy you are comparing *against*.

> **The target dropdown is automatically restricted to policies on the same platform as the source policy.** If your source policy targets Windows, only other Windows Settings Catalog policies appear in the target list. The source policy itself is also excluded from the target options.

This ensures you are always comparing policies that are intended for the same device platform — a Windows policy compared to an iOS policy would produce meaningless results.

1. Click the **Target Policy** dropdown
2. Search and select the policy you want to compare to

---

## Step 4 — Run the Comparison

Once both policies are selected, a **Compare Policies** button appears centred below the dropdowns.

1. Click **Compare Policies**
2. A spinner shows while the comparison runs
3. The comparison results appear below

> 📸 _[Screenshot placeholder: Policy selection card showing both dropdowns filled in with policy names, and the Compare Policies button centred below them with a GitCompare icon]_

---

## Reading the Results

### The Policy Header Bar

A sticky bar at the top of the results section shows the two policy names in colour-coded panels that persist as you scroll:

- **Blue panel — Source Policy** — the policy you are comparing from
- **Green panel — Target Policy** — the policy you are comparing against

This stays visible at the top of the results as you scroll through a long list of settings.

> 📸 _[Screenshot placeholder: Sticky header bar showing a blue Source Policy panel on the left with the policy name, and a green Target Policy panel on the right with the target policy name]_

---

### The Stats Bar

The results header shows four summary counts:

| Badge | Colour | What It Counts |
|---|---|---|
| **Same** | 🟢 Green | Settings that exist in both policies and have identical values |
| **Different** | 🔴 Red | Settings that exist in both policies but have different values |
| **Source Only** | 🔵 Blue | Settings that exist only in the source policy — absent from the target |
| **Target Only** | 🟡 Yellow | Settings that exist only in the target policy — absent from the source |

The total count is shown in the card header: `Comparison Results (N settings)`.

> 📸 _[Screenshot placeholder: Results card header showing four coloured stat badges — green Same, red Different, blue Source Only, yellow Target Only — each with a count number]_

---

### Setting States — The Four Badges

Every setting in the results list has a badge on the right side of its row:

| Badge | Colour | Meaning |
|---|---|---|
| **Same** | 🟢 Green | The setting is configured in both policies with the same value |
| **Different** | 🔴 Red | The setting is configured in both policies but the values do not match |
| **Source Only** | 🔵 Blue | The setting is present in the source policy but does not exist in the target policy |
| **Target Only** | 🟡 Yellow | The setting is present in the target policy but does not exist in the source policy |

---

### What Each Setting Row Shows

Each setting in the results list displays:

**Setting name and status badge**
The display name of the setting and its comparison badge, shown together at the top of the row.

**Description**
A plain-text explanation of what this setting controls, pulled from the Settings Catalog definition.

**Keywords**
One or more category tags associated with the setting (e.g., `Security`, `BitLocker`, `Firewall`, `Windows Update`). These are shown as small neutral badges and can be used to filter the results.

**Source Value (blue) and Target Value (green)**
A two-column layout showing the configured value in each policy. Values are shown as text. If a setting does not exist in one of the policies, `[Not Set]` is shown in that column.

**Differences Summary (yellow, only for Different settings)**
When a setting is marked **Different** and the API returns a structured description of the change, a yellow panel appears below the values. It contains a human-readable summary of exactly what changed — for example, `Value changed from 'Disabled' to 'Enabled'`.

> 📸 _[Screenshot placeholder: A single setting row showing a red Different badge, a description paragraph, keyword badges, a blue SOURCE VALUE panel and a green TARGET VALUE panel with different text in each, and a yellow DIFFERENCES SUMMARY panel below]_

---

### Child Settings

Some Settings Catalog settings contain **sub-options** — for example, a Firewall setting may have child settings for inbound rules, outbound rules, notification behaviour, and so on. When a setting has child settings, they are displayed in a collapsible section below the main setting values.

Each child setting shows:
- The child setting name
- A **SOURCE** value (blue) and a **TARGET** value (green) side by side
- A red **Different** badge and red background highlight on any child where the two values do not match

Child settings with identical values in both policies are shown with a neutral grey background.

> 📸 _[Screenshot placeholder: Child Settings section expanded showing three child settings — two with matching values on grey backgrounds, one with different values on a red background and a red Different badge]_

---

## Filtering the Results

Three filter controls are available above the results list. All three combine — a setting must match all active filters to appear.

### Search

A text input that filters results by **setting name** in real time. Type any part of a setting name to narrow the list. An × button appears to clear the search term.

### Comparison Status

A dropdown with five options:

| Option | What It Shows |
|---|---|
| **All Settings** | No filter — show all comparison results |
| **Different Values** | Show only settings with different values (`InBothDifferent`) |
| **Same Values** | Show only settings that are identical in both policies (`InBothTheSame`) |
| **Source Only** | Show only settings that exist in the source policy but not the target (`InSource`) |
| **Target Only** | Show only settings that exist in the target policy but not the source (`InChecked`) |

### Filter by Keywords

A multi-select dropdown populated from the keywords attached to the settings in the comparison results. The available keywords vary by policy content — you might see tags like `Security`, `BitLocker`, `Defender`, `Firewall`, `Update`, and so on.

- Search within the keyword list by typing in the embedded search box
- Select multiple keywords — the results show settings that match **any** of the selected keywords
- Up to 2 selected keywords are shown as badges in the closed dropdown; additional ones show as `+N more`
- Click × on any keyword chip to remove it individually

### Active Filter Chips

When any combination of search, status, or keyword filters is active, an **Active Filters** section appears below the filter controls, showing each active filter as a removable chip. Click the × on any chip to clear that specific filter without affecting the others.

A **Clear** button in the filter card header resets all three filters at once.

> 📸 _[Screenshot placeholder: Filters card showing a search box with text, the Status dropdown set to "Different Values", the Keywords dropdown showing two selected keywords as badges, and an Active Filters row below with three removable chips and a Clear button]_

---

## Stats Update With Filters

The four summary badges in the results header (**Same**, **Different**, **Source Only**, **Target Only**) always reflect the **currently filtered** result set, not the full unfiltered comparison. When you apply filters, the counts update immediately to show how many settings of each type match your current criteria.

---

## Exporting the Comparison

Once comparison results are loaded, an **Export HTML** button appears in the results card header.

Clicking it downloads a **self-contained HTML file** — a fully formatted, interactive report that can be opened in any browser without needing an internet connection or an Intune Assistant account.

**Filename format:**
`policy-comparison-{source-name}-vs-{target-name}-{date}.html`

For example: `policy-comparison-windows_security_baseline-vs-legacy_device_config-2026-04-27.html`

### What the HTML Report Contains

- A formatted header with the report title and generation timestamp
- A **stats summary** section with Same / Different / Source Only / Target Only counts
- The full **Source Policy** and **Target Policy** names in colour-coded panels
- Every setting as a card, with description, keywords, source value, target value, differences summary, and child settings
- A built-in **interactive filter bar** with search, status dropdown, and keyword filter — so the recipient of the report can filter the results in their browser without needing access to Intune Assistant
- A **no results** message when filters produce an empty list

> 💡 **The HTML export is designed to be shared.** Send it to a colleague, a manager, or an auditor and they can explore the full comparison in their browser — no login, no dependencies, no special software.

---

## Common Use Cases

**Verify a cloned policy before assigning it**
Select the original as Source and the clone as Target. Filter Status to `Different Values` — if anything shows up, something changed during the clone or was edited afterwards.

**Compare production and test environment policies**
Select the production policy as Source and the test policy as Target. Export to HTML and share with the team doing the test environment review.

**Find settings that are in one policy but missing from another**
Filter Status to `Source Only` to see everything the target policy is missing. Filter to `Target Only` to see everything the source policy is missing.

**Audit a specific security area across two policies**
Use the Keywords filter to narrow to a category like `BitLocker` or `Firewall`. Then filter Status to `Different Values` to see only the security-relevant settings that differ.

**Document what changed between a baseline and a current policy**
Select the baseline as Source and the current policy as Target. Export to HTML and archive the report as evidence of drift or intentional change.

---

## Related Pages

- [Policy Overview](../configuration/policies.md) — see all policies and their assignment status
- [Policy Settings Overview](../configuration/settings.md) — find duplicate and conflicting settings across all policies
- [Configuration Overview](../configuration/README.md) — the full configuration management section

