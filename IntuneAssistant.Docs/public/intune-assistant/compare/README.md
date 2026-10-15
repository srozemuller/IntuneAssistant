# Compare

## Overview

The **Compare Section** in IntuneAssistant provides two powerful tools for analysing policy overlap, conflicts, and coverage in your Microsoft Intune environment:

1. **Compare Existing Policies** — Compare policies that already exist within your tenant against each other to identify coverage gaps, conflicts, and duplicate settings before enabling a new policy.
2. **External Policy Comparison** — Upload exported JSON policy files and compare their settings against what is already configured in your tenant.

> 📸 **Screenshot Placeholder**: _Compare section landing page showing both tools_

***

## Why Use the Compare Section?

Before deploying a new policy or importing a baseline configuration, it is important to understand how it relates to what is already in your environment. The Compare Section helps you:

✅ **Avoid conflicts** — Identify settings that are already configured with different values\
✅ **Prevent duplication** — Find settings already covered by existing policies\
✅ **Understand coverage gaps** — Discover settings in a new policy that are not yet in the tenant\
✅ **Make safe deployment decisions** — Know what will change before you enable a policy\
✅ **Audit external baselines** — Validate imported configuration files against your live tenant

***

## Tool 1: Compare Existing Policies

### Overview

Navigate to **Compare → Policies** to compare Settings Catalog policies that exist within your tenant. You select a **source** policy (or multiple source policies) and compare them against **target** policies to understand the overlap.

> 📸 **Screenshot Placeholder**: _Compare Existing Policies page with the Policy Selection card visible_

### Getting Started

{% stepper %}
{% step %}
**Step 1: Load Policies**

Click **Load Policies** to fetch all available Settings Catalog policies from your tenant. The total number of policies found is displayed in the selection card.

> 📸 **Screenshot Placeholder**: _Policy Selection card showing "Load Policies" button_
{% endstep %}

{% step %}
**Step 2: Select Source Policies (Left Side)**

Choose one or more **source policies** from the left panel. These are the policies you want to evaluate — typically a new or unassigned policy you are planning to enable.

* Use the **scope tag filter** above the list to narrow down policies by scope tag.
* The source policy list will exclude policies already selected on the right side.

> 📸 **Screenshot Placeholder**: _Left side policy selector with scope tag filter_
{% endstep %}

{% step %}
**Step 3: Select Target Policies (Right Side)**

Choose the **target policies** from the right panel. These are the existing policies already active in your environment.

* When a source policy is selected, the target list is automatically filtered to show only policies with a **matching platform and type**.
* Use the scope tag filter on the right side to further narrow down the target list.

> 📸 **Screenshot Placeholder**: _Right side policy selector filtered by platform_
{% endstep %}

{% step %}
**Step 4: Run the Analysis**

Click **Analyse Policy Overlap** to start the comparison. A progress banner shows the number of batches being processed.
{% endstep %}
{% endstepper %}

### Comparison Modes

The tool automatically selects the comparison mode based on how many source policies are selected:

| Source Policies Selected | Mode Used         | Description                                                                   |
| ------------------------ | ----------------- | ----------------------------------------------------------------------------- |
| **1 policy**             | Single comparison | Compares the source policy setting-by-setting against each target policy      |
| **2+ policies**          | Set analysis      | Aggregates all source policies into a set and compares against the target set |

### Understanding Single-Source Results

When one source policy is selected, the results are displayed in three tabs:

{% tabs %}
{% tab title="Overall Coverage" %}
Shows each setting from the source policy and its status across all target policies. Settings are grouped and colour-coded:

| Status Badge               | Meaning                                                             |
| -------------------------- | ------------------------------------------------------------------- |
| 🟢 **Already covered**     | Same value exists in an existing policy — safe to enable            |
| 🔴 **Conflict**            | Different value exists — enabling may cause conflict or override    |
| 🔵 **New — not elsewhere** | Only in your new policy, no existing policy covers this setting     |
| ⚫ **Only in existing**     | Only in an existing policy, your new policy does not configure this |

Use the **search** and **status filter** to focus on the most important settings.

> 📸 **Screenshot Placeholder**: _Overall Coverage tab with filtered settings and status badges_
{% endtab %}

{% tab title="Per-Policy Detail" %}
Shows a breakdown for each target policy individually. Each policy card displays:

* A stacked bar chart (🟢 covered / 🔴 conflict / 🔵 new only)
* A list of settings with their status and values side-by-side
* Use the **Conflicts / new only** filter to hide fully-matching policies

> 📸 **Screenshot Placeholder**: _Per-Policy Detail tab with one policy card expanded_
{% endtab %}

{% tab title="Summary" %}
Shows a per-policy overlap breakdown table with progress bars for each target policy including:

* **Covered** — settings with the same value
* **Conflict** — settings with different values
* **New only** — settings only in the source policy
* **Exist only** — settings only in the target policy

> 📸 **Screenshot Placeholder**: _Summary tab with per-policy stacked progress bars_
{% endtab %}
{% endtabs %}

### Understanding Set Analysis Results (Multi-Source)

When two or more source policies are selected, the **Set Analysis** mode runs. This aggregates all source policies into a **left set** and compares them against all target policies (the **right set**).

Results are displayed as a list of settings with their status:

| Status               | Meaning                                               |
| -------------------- | ----------------------------------------------------- |
| **Match**            | Setting exists in both sets with the same value       |
| **Conflict**         | Setting exists in both sets with different values     |
| **Duplicate**        | Setting configured multiple times within the same set |
| **Missing in Left**  | Setting only in the right (target) set                |
| **Missing in Right** | Setting only in the left (source) set                 |
| **New in Left**      | Brand-new setting not seen in the right set           |
| **New in Right**     | Brand-new setting not seen in the left set            |
| **Overlap**          | Setting appears in multiple policies within a set     |

> 📸 **Screenshot Placeholder**: _Set Analysis results with summary counts and settings list_

### Actions

| Action         | Description                                     |
| -------------- | ----------------------------------------------- |
| **Re-run**     | Re-run the comparison with the same selection   |
| **Refresh**    | Re-load policies and scope tags from the tenant |
| **Export CSV** | Download all comparison results as a CSV file   |
| **Cancel**     | Cancel an in-progress analysis                  |

***

## Tool 2: External Policy Comparison

### Overview

Navigate to **Compare → Configuration** to compare **uploaded JSON policy files** against your live tenant. This is ideal for validating external baselines, CIS benchmarks, or policies exported from another tenant.

> 📸 **Screenshot Placeholder**: _External Policy Comparison page with the upload zone visible_

### Getting Started

{% stepper %}
{% step %}
**Step 1: Upload Policy JSON Files**

Drag and drop one or more exported Intune policy JSON files into the upload zone, or click to browse. The tool supports:

* **Settings Catalog** policies (`deviceManagementConfigurationPolicy`)
* **Device Configuration** profiles (`deviceConfiguration` subtypes)
* **Group Policy** configurations (`groupPolicyConfiguration`)

The policy **type and platform are auto-detected** from the JSON content. Each uploaded file is shown with its detected name, type badge, platform badge, and the number of settings detected.

> 📸 **Screenshot Placeholder**: _Upload zone with two uploaded policies listed_

**💡 Tip**: You can upload multiple files at once. Tenant data is fetched once and reused — use **Refresh Tenant Data** to re-fetch without re-uploading.
{% endstep %}

{% step %}
**Step 2: Run the Comparison**

Click **Compare Against Tenant** to fetch matching tenant policies and run the analysis. The tool:

1. Fetches all tenant policies matching the **same platform and type** as the uploaded files
2. Resolves setting definition IDs to human-readable names
3. Compares each setting value from the uploaded file against tenant configurations

A loading banner shows the current phase (fetching tenant data, resolving definitions, analysing).

> 📸 **Screenshot Placeholder**: _Loading banner during analysis_
{% endstep %}
{% endstepper %}

### Understanding the Results

Results are shown in two tabs: **Analysis** and **Summary**.

{% tabs %}
{% tab title="Analysis" %}
For each uploaded policy, a results section shows every setting with its status:

| Status            | Colour   | Description                                                    |
| ----------------- | -------- | -------------------------------------------------------------- |
| **Match**         | 🟢 Green | The tenant has this setting configured with the **same value** |
| **Conflict**      | 🟡 Amber | The tenant has this setting but with a **different value**     |
| **Not in tenant** | 🔴 Red   | No tenant policy covers this setting                           |

Each row shows:

* **Setting name** (human-readable, resolved from definition IDs)
* **Uploaded value** — the value from your JSON file
* **Tenant value** — the value found in matching tenant policies
* **Source policy name** — which tenant policy contains this setting

Use the **status filter** buttons to show only Matches, Conflicts, or Missing settings. Use the **search box** to find specific settings by name.

> 📸 **Screenshot Placeholder**: _Analysis tab showing a policy with conflict and missing settings highlighted_

**Assigned vs. Unassigned**: Tenant policies that are assigned (active/production) are indicated separately so you can prioritise conflicts with live policies.
{% endtab %}

{% tab title="Summary" %}
The Summary tab gives an aggregated view across all uploaded policies:

**Settings Coverage card** — An overall stacked bar showing what percentage of all uploaded settings are:

* 🟢 Matched in the tenant
* 🟡 Conflicting in the tenant
* 🔴 Not found in the tenant

**Per-Policy cards** — One card per uploaded policy showing:

* Total settings count
* Coverage percentage (matched + conflicting)
* Three stat pills: Match / Conflict / Not in tenant with counts and percentages
* Number of tenant policies matched by platform

**Per-Policy Match Breakdown** — Progress bars for match, conflict, and missing percentages per uploaded policy.

**Platform Filtering** — Shows how many tenant policies were considered after platform matching for each uploaded policy.

**Top Conflict Hotspots** — Settings that conflict across the most uploaded policies, helping you identify the most impactful issues to address first.

> 📸 **Screenshot Placeholder**: _Summary tab showing per-policy coverage cards and conflict hotspots_
{% endtab %}
{% endtabs %}

### Policy Type Detection

The tool automatically determines the policy type from the JSON file:

| Detected Type        | Description                                                        |
| -------------------- | ------------------------------------------------------------------ |
| **Settings Catalog** | Modern policy using the Settings Catalog format                    |
| **Device Config**    | Classic device configuration profiles (OMA-URI, platform-specific) |
| **Group Policy**     | Administrative template (ADMX) based Group Policy configurations   |
| **Unknown**          | Could not auto-detect — check the JSON format                      |

### Actions

| Action                     | Description                                             |
| -------------------------- | ------------------------------------------------------- |
| **Compare Against Tenant** | Run the analysis for all uploaded files                 |
| **Re-run Analysis**        | Re-run analysis with existing tenant data (no re-fetch) |
| **Refresh Tenant Data**    | Re-fetch all tenant policies (clears the cache)         |
| **Export CSV**             | Download comparison results as a CSV file               |
| **Clear All**              | Remove all uploaded files and reset the page            |
| **Cancel**                 | Cancel an in-progress fetch or analysis                 |

***

## Reading Setting Values

Both tools resolve setting IDs to human-readable names where possible:

* **Setting names** are resolved from Microsoft Graph definition metadata
* **Setting values** show the friendly label (e.g., "Enabled" instead of `device_vendor_msft_policy_...`)
* Where a value is an option ID, the human-readable option label is shown; the raw ID is displayed below in smaller text for reference

> 📸 **Screenshot Placeholder**: _Setting row showing friendly name, human-readable value, and raw ID_

***

## Common Scenarios

### Scenario 1: Validating a CIS Benchmark Baseline

**Situation**: You have downloaded a CIS Benchmark policy JSON and want to know how much of it is already configured in your tenant.

**Action**: Use **External Policy Comparison**. Upload the JSON file, run the comparison, and review the Summary tab. Focus on "Not in tenant" settings to identify gaps and "Conflict" settings to review value differences.

***

### Scenario 2: Checking a New Policy Before Enabling

**Situation**: You have created a new unassigned Settings Catalog policy and want to ensure it won't conflict with existing assigned policies.

**Action**: Use **Compare Existing Policies**. Select your new policy as the source and all currently assigned policies as targets. Run the analysis and review the "Conflict" settings in the Overall Coverage tab.

***

### Scenario 3: Comparing Two Sets of Policies

**Situation**: You have two groups of policies (e.g., different scope tags for different device groups) and want to understand the overlap between them.

**Action**: Use **Compare Existing Policies**. Select all policies in group A as source, all policies in group B as targets. The **Set Analysis** mode will automatically activate and show you matches, conflicts, duplicates, and unique settings across both sets.

***

### Scenario 4: Migrating Policies from Another Tenant

**Situation**: You have exported policies from a source tenant and want to import them into a new tenant. You need to understand what is already configured.

**Action**: Export the policies as JSON, then use **External Policy Comparison** to compare them against the target tenant. Review the Summary tab and conflict hotspots before importing.

***

## Troubleshooting

### No Policies Load

**Problem**: Clicking **Load Policies** returns no results.

**Solutions**:

* Verify you are signed in and have the correct tenant selected
* Ensure you have Intune read permissions
* Check that your tenant has Settings Catalog policies configured

### Policy Type Shows "Unknown"

**Problem**: An uploaded file shows the "Unknown" type badge.

**Solutions**:

* Verify the JSON file is a valid Intune policy export
* Settings Catalog exports are detected automatically even without an `@odata.type` field, as long as the file still has its `settings` array and `settingCount`
* For Device Config or Group Policy exports, check that the `@odata.type` field is present in the JSON
* Ensure the file was exported directly from Intune (not manually edited)

### Analysis Shows 0 Settings

**Problem**: Analysis completes but shows no settings detected.

**Solutions**:

* For Settings Catalog policies: verify the JSON contains a `settings` array
* For Device Config: verify the JSON contains platform-specific configuration keys
* Try re-uploading the file — ensure it is a complete, unmodified export

### All Settings Show "Not in Tenant"

**Problem**: External comparison shows no matches despite expected coverage.

**Solutions**:

* Verify the uploaded policy platform matches policies in your tenant
* Check that tenant policies have been fully configured (not just created)
* Use **Refresh Tenant Data** to ensure you have the latest tenant configuration

***

## FAQ

<details>

<summary>Q: What policy types are supported?</summary>

A: Settings Catalog, Device Configuration (all platform subtypes), and Group Policy (Administrative Templates) are supported. Compliance policies and App Protection policies are not currently included.

</details>

<details>

<summary>Q: Does this tool make any changes to my tenant?</summary>

A: No. Both tools are read-only. No policies are created, modified, or deleted.

</details>

<details>

<summary>Q: Why does the target policy list filter when I select a source?</summary>

A: Platform matching is enforced to ensure meaningful comparisons. A Windows policy cannot conflict with a macOS policy, so only same-platform, same-type policies are shown as targets.

</details>

<details>

<summary>Q: Can I compare more than two policies at once?</summary>

A: Yes. Both tools support multi-select. Selecting 2+ source policies activates Set Analysis mode, which compares all source policies as a group against all target policies as a group.

</details>

<details>

<summary>Q: What does "assigned" mean in the results?</summary>

A: An "assigned" policy is one that has at least one device or user group assignment — meaning it is actively enforced in your environment. Conflicts with assigned policies are higher priority than conflicts with unassigned (staged) policies.

</details>

<details>

<summary>Q: Can I upload multiple JSON files at once?</summary>

A: Yes. In External Policy Comparison, you can drag and drop multiple JSON files at once. Each file is analysed independently.

</details>

<details>

<summary>Q: Why do some setting values show a raw ID instead of a friendly name?</summary>

A: Setting definition IDs are resolved from Microsoft Graph metadata. If a definition is not found (e.g., custom or preview settings), the raw ID is shown. The raw ID is always shown below the friendly name for reference.

</details>

<details>

<summary>Q: Can I export the results?</summary>

A: Yes. Both tools have an **Export CSV** button that downloads all comparison results for further analysis in Excel or other tools.

</details>

***

## Permissions Required

To use the Compare Section, your account needs:

* **Intune read access** — to fetch policies and settings from the tenant
* **Settings definitions read access** — to resolve setting IDs to human-readable names

No write permissions are required.

***

_Last updated: May 2026_
