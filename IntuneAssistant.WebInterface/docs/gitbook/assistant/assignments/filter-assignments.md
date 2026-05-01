# Filter Assignments

## What Is This Page?

The **Filter Assignments** page is about a specific Intune feature called **assignment filters**. If you are not yet familiar with filters, think of them as a precision layer on top of assignments.

When you assign a policy to All Users for example, that policy normally applies to every user. With a filter, you can refine this: _"Only apply this policy to Windows devices where the OS version is 22H2 or higher"_ or _"Exclude personal devices from this compliance policy."_ The filter evaluates each device individually at the time of policy evaluation — based on device properties — so you can be precise without creating endless groups.

This page lets you explore all filters, select the filter you want, start search in your tenant and see exactly where the filter is used.

---

## Why Would You Use This?

- You want to know which assignment filters exist in your tenant
- You need to verify that a specific filter is applied to the right policies
- You are troubleshooting why a policy applies (or does not apply) to certain devices, even though the group looks correct
- You are auditing filter usage as part of a security or compliance review
- You want to find and clean up unused or misconfigured filters

---

## How to Use This Page

### Option 1: Load All Assignments with Filter Info

1. Navigate to **Assistant > Assignments > Filter Assignments**
2. Click **Load Data**
3. All assignments are loaded, including which filter (if any) is attached to each
4. Use the table filters to narrow down to assignments using a specific filter

### Option 2: Search by a Specific Filter

1. Use the **Select a filter** search box at the top
2. Type the filter name or browse the list
3. Select a filter
4. The table automatically narrows to show only assignments using that filter

> 📸 _[Screenshot placeholder: Filter search dropdown open with list of available assignment filters showing name, platform, and rule]_

---

## Understanding the Filters List

The page shows all available filters in your tenant. Each filter entry shows:

| Field | What It Shows |
|---|---|
| **Filter Name** | The display name of the filter |
| **Platform** | Which device platform the filter applies to (Windows, iOS, Android, macOS) |
| **Management Type** | Whether it applies to MDM-managed or app-managed (MAM) devices |
| **Rule** | The filter expression, e.g. `(device.osVersion -startsWith "10.0.19")` |

> 📸 _[Screenshot placeholder: Filter details panel showing a Windows filter with an OS version rule expression]_

---

## Understanding the Assignments Table

| Column | What It Means |
|---|---|
| **Resource** | The Intune policy, app, or profile using this filter |
| **Type** | Resource category (Compliance, Configuration, App, etc.) |
| **Assignment** | The targeting method (group name, All Devices, All Users) |
| **Target** | The group or built-in target |
| **Platform** | Device platform |
| **Filter** | The filter applied to this assignment |
| **Filter Type** | Include or Exclude (see below) |
| **Status** | Assigned or Not Assigned |

### Include vs Exclude Filters — What Is the Difference?

| Filter Type | Effect                                                                                             |
|---|----------------------------------------------------------------------------------------------------|
| **Include** | The policy only applies to resoures in the group **where the filter rule is included**             |
| **Exclude** | The policy applies to the resources in the group **except** those where the filter rule is applied |

An important point: a filter does not replace or change the group assignment. It only refines which devices within the already-targeted group are actually evaluated for that policy.

**Example:** A compliance policy is assigned to `SG-All-Employees` with an Include filter for `device.manufacturer -eq "Microsoft"`. Only Surface devices (Microsoft-manufactured) in that group will get the policy. All other devices in the group are skipped.

---

## Filtering the Table

| Filter | What It Does |
|---|---|
| **Assignment Type** | Show only specific targeting methods |
| **Resource Type** | Focus on a specific type of Intune resource |
| **Status** | Show only Assigned or Not Assigned resources |
| **Platform** | Focus on a specific device platform |
| **Filter Type** | Show only Include filters, only Exclude filters, or resources with no filter |

---

## Clicking on Groups

Group names in the results are clickable and open the **Group Details** dialog.

---

## Exporting the Data

Click **Export** to download visible rows as a CSV.

**Filename:** `filter-assignments.csv`

---

## Common Use Cases

**Which policies use the "Windows-CorporateDevices" filter?**
Select that filter from the dropdown and review all assignments in the results.

**Are any policies using an Exclude filter on iOS?**
Set Platform to `iOS`, Filter Type to `Exclude`.

**Which resources have no filter applied?**
Set Filter Type to `No Filter` — these assignments apply to all devices in the targeted group without any device-level refinement.

**Audit all assignment filters in the tenant**
Review the filter list — each entry shows the rule expression and platform scope.

---

## Related Pages

- [All Assignments](./all-assignments.md)
- [Group Assignments](./group-assignments.md)
- [App Assignments](./app-assignments.md)

