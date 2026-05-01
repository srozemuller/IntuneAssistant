# Group Assignments

## What Is This Page?

The **Group Assignments** page answers one of the most common questions in Intune management: _"Where did I use a specific group? Or, what is assigned to this group?"_

You search for an Entra ID group, and Intune Assistant retrieves every policy, configuration profile, application, and script that is assigned to that group. Both direct assignments (include) and exclusions are shown.
If there is a nested group, IntuneAssistant also will show that resources as well. 

This is the go-to page when you need to understand the full Intune footprint for a specific group — whether that group represents a department, a device type, a location, or any other unit in your organization.

---

## Why Would You Use This?

- You are onboarding a new department and want to verify the correct policies are assigned to their group
- You need to review what a specific group receives before making configuration changes
- You are troubleshooting why a device or user is getting unexpected settings
- You want to validate that a group is correctly excluded from certain policies
- You need to document all assignments for a group for an audit or handover

---

## How to Use This Page

1. Navigate to **Assistant > Assignments > Group Assignments**
2. Type a group name in the **Search for a group** box
3. Select the group from the autocomplete results
4. Intune Assistant fetches all assignments for that group
5. The table populates with results

> You can search by group name or paste a group Object ID (GUID) directly into the search box.

> 📸 _[Screenshot placeholder: Group search box with autocomplete results showing matching group names]_

---

## Group Info Panel

Once a group is selected, a summary panel appears above the table:

| Field | What It Shows |
|---|---|
| **Display Name** | The group name in Azure AD / Entra ID |
| **Description** | The group description (if set) |
| **Membership Type** | Assigned or Dynamic |
| **Membership Rule** | The dynamic rule expression (for dynamic groups) |
| **Created** | When the group was created |
| **Users** | Number of user members |
| **Devices** | Number of device members |
| **Nested Groups** | Number of nested group members |

> 📸 _[Screenshot placeholder: Group info panel showing a dynamic group with membership rule and member counts]_

---

## Understanding the Table

| Column | What It Means |
|---|---|
| **Resource** | The name of the Intune object (policy, app, profile, etc.) |
| **Type** | Resource category (Compliance Policy, Configuration Profile, Win32 App, etc.) |
| **Assignment** | How the group is targeted: Include or Exclude |
| **Platform** | Device platform the resource targets |
| **Status** | Whether the resource is Assigned or Not Assigned |
| **Nested** | Whether the assignment reaches this group through a nested parent group |
| **Filter** | Assignment filter applied (if any) |
| **Filter Type** | Include or Exclude filter |

### Nested Assignments

If a row shows **Nested: Yes**, the group is not directly assigned to that resource. Instead, the group is a member of another group that is the direct assignment target. Intune Assistant resolves this automatically so you always get the complete picture.
IntuneAssistant supports multi nesting. It does not matter how deep groups are nested. The backend will check every group that is nested till is has the full picture.
> This is especially useful for dynamic groups or groups that are members of broader targeting groups.

Example: _"You are searching for group A, group B is nested in group A, then you also will see group B assigned resources. If its a nested assignment, a small icon is shown._

---

## Filtering the Data

| Filter | What It Does |
|---|---|
| **Resource Type** | Show only a specific type (apps, compliance, configuration, etc.) |
| **Assignment Type** | Filter by Include or Exclude targeting |
| **Status** | Show only Assigned or Not Assigned resources |
| **Platform** | Focus on a specific platform |
| **Filter Type** | Show assignments with or without assignment filters |

---

## Clicking on Groups

When a result row shows another group as the assignment target (nested scenario), that group name is also clickable and opens the **Group Details** dialog for that group.

---

## Clicking on Filters

Filter names in the **Filter** column open a **Filter Details** dialog showing the filter rule expression and platform scope.

---

## Exporting the Data

Click **Export** to download the current results as a CSV.

**Filename:** `group-assignments.csv`

---

## Common Use Cases

**What does the "SG-Windows-Devices" group receive?**
Search for the group name and review the full list.

**Is the group excluded from a specific policy?**
Filter Assignment Type by `Exclude` to see all exclusions for this group.

**Does this group receive assignments through nested groups?**
Look for rows where Nested = Yes in the results.

**Audit before deleting a group**
Load the group and export all assignments before removing it — so you have a record of what will be affected.

---

## Related Pages

- [All Assignments](./all-assignments.md)
- [Filter Assignments](./filter-assignments.md)
- [User Assignments](./user-assignments.md)

