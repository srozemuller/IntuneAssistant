# User Configuration Assignments

## What Is This Page?

The **User Configuration Assignments** page shows every Intune **configuration policy, compliance policy, security baseline, and script** that applies to a specific user — resolved automatically through all their group memberships, including nested groups.

In the native Intune portal, finding what a single user receives means checking every group they are in and then cross-referencing those groups with every policy. That is tedious and error-prone. This page does all of that in one query.

---

## Why Would You Use This?

- A user's device has unexpected settings applied — you need to trace which policy is responsible
- You want to confirm a new employee is receiving all required configuration and compliance policies after being added to onboarding groups
- You are conducting a compliance or security audit and need to document exactly which policies a specific person is subject to
- A device is showing as non-compliant in the portal and you need to identify which compliance policy is triggering that
- You want to check whether a user is correctly excluded from a sensitive policy
- You need to hand over a user account and want to document everything that was applied to it

---

## How to Use This Page

### Search by User

1. Navigate to **Assistant > Assignments > User Assignments > Configuration Assignments**
2. The page opens with a welcome card and a search box
3. Make sure **Search for a User** mode is selected (toggle at the top of the search area)
4. Type the user's display name or email address (UPN) — partial names work
5. Press **Enter** or click **Search**
6. If multiple users match, a list is shown — click the correct user to select them
7. Click **View Assignments** next to the selected user
8. Intune Assistant fetches all configuration assignments for that user
9. The results table appears

> You can also paste the user's Object ID (GUID) directly into the search box.

> 📸 _[Screenshot placeholder: Welcome card with user search box, showing a typed name and search results with user cards listing display name, UPN, and account status]_

---

## User Info Panel

After a user is selected and assignments are loaded, a summary panel appears at the top of the results:

| Field | What It Shows                                                          |
|---|------------------------------------------------------------------------|
| **Display Name** | The user's full name                                                   |
| **UPN** | The user principal name — their email / login address                  |
| **Account Status** | Enabled or Disabled — important when troubleshooting inactive accounts |
| **User Type** | Member (internal) or Guest (external / B2B)                            |
| **Created** | When the account was created in Entra ID                               |

> 📸 _[Screenshot placeholder: User info card above the results table showing display name, UPN, Enabled status, and creation date]_

---

## Understanding the Table

| Column | What It Means |
|---|---|
| **Resource** | The policy name, with the resource type shown in smaller text below it |
| **Assignment** | How the resource reaches the user — group name, All Users, or direct. Shows a **nested badge** (purple icon) if the assignment comes via a parent group the user's group is nested inside |
| **Target** | The specific group or built-in target. For group assignments, shows member counts (users / devices / nested groups) below the name. Clickable for group details |
| **Platform** | Device platform the policy targets (Windows, iOS, Android, macOS, or All) |
| **Status** | **Assigned** (green) or **Not Assigned** (grey) |
| **Filter** | The assignment filter applied to this assignment, if any. Clickable to see the filter rule. Shows a green **Inc** badge (Include) or red **Exc** badge (Exclude) |

### The Nested Badge — What Does It Mean?

When the **Assignment** column shows a small purple group icon alongside the assignment type, it means the user is receiving this policy **indirectly**. Here is the chain:

- The policy is directly assigned to **Group B**
- The user is a member of **Group A**
- **Group A** is a member of **Group B**
- Therefore the user inherits the policy through that nesting

Intune Assistant traces this automatically so you see the full effective assignment, not just direct targeting. This is one of the most common reasons users receive policies they were not intentionally targeted with.

> 📸 _[Screenshot placeholder: Assignment column showing a purple nested group icon next to an assignment type badge, with a tooltip explaining "Nested assignment — inherited from parent group"]_

---

## Filters Panel

Click **Filters** to expand the filter controls:

| Filter | What It Does |
|---|---|
| **Assignment Type** | Show only specific targeting methods (e.g., only Entra ID Group, only All Users) |
| **Resource Type** | Focus on a specific policy category (Compliance Policy, Configuration Profile, Security Baseline, etc.) |
| **Status** | Show only Assigned or only Not Assigned resources |
| **Platform** | Limit to a specific device platform |
| **Filter Type** | Show only assignments with an Include filter, an Exclude filter, or no filter at all |

Use **Clear Filters** to reset all active filters at once.

> 📸 _[Screenshot placeholder: Filter panel expanded showing five multi-select dropdowns with a Clear Filters button]_

---

## Search Within Results

Once assignments are loaded, a **Search** box is available above the table. It performs a free-text search across resource names, target names, assignment types, resource types, and platforms — useful for quickly finding a specific policy within a large result set.

---

## Clicking on Groups

Group names in the **Target** column are clickable (highlighted in amber). Clicking opens a **Group Details** dialog that shows:

- Display name and description
- Membership type (Assigned or Dynamic)
- Dynamic membership rule (if applicable)
- Member counts: users, devices, and nested groups

---

## Clicking on Filters

Filter names in the **Filter** column are clickable. A **Filter Details** dialog opens showing:

- Filter display name and description
- Platform scope
- Management type (MDM or MAM)
- The filter rule expression (e.g., `(device.osVersion -startsWith "10.0.19")`)

---

## Stats Bar

Above the table, a stats strip shows at a glance:

| Stat | What It Shows |
|---|---|
| **Total Assignments** | Number of rows in the current filtered view |
| **Assigned** | How many resources are actively assigned to the user |
| **Not Assigned** | Resources present in the tenant but with no active assignment for this user |
| **Resource Types** | Number of distinct policy categories in the results |
| **Platforms** | Number of distinct platforms represented |

---

## Exporting the Data

Two export options are available via the **Export** button:

### Standard Export
Exports all visible rows to CSV, PDF, or HTML. Includes:
- Resource type and name
- Assignment type
- Target name
- Platform
- Status (Assigned / Not Assigned)
- Filter name and filter type

**Filename:** `user-assignments-overview.csv` (or `.pdf` / `.html`)

### Export for Bulk Assignments
A structured CSV designed to be used as input for bulk assignment operations. Includes:
- PolicyName
- GroupName
- AssignmentDirection
- AssignmentAction (pre-filled as `Add`)
- Filter name and filter type

**Filename:** `rollouts-overview.csv`

> 💡 The bulk export is useful when you want to replicate a user's assignment set to another group or tenant environment.

---

## Common Use Cases

**Why is this compliance policy applied to this user?**
Search for the user, find the compliance policy in the results. The **Target** column shows which group delivered it. If the **nested badge** is shown, the delivery is through a parent group.

**A user's device is non-compliant — which policy flags it?**
Filter Resource Type by `Compliance Policy` and review the policies listed.

**Verify a new joiner has the correct security baselines**
Filter Resource Type by `Security Baseline` and confirm the expected baselines are listed as Assigned.

**Pre-offboarding documentation**
Export the Standard Export before disabling the account — this gives you a record of everything the user was subject to.

**The user says a setting is being applied that they should not have**
Look for the policy name in the results. If it shows a nested badge, expand the group chain to find the unexpected membership path.

**Is the user excluded from a sensitive policy?**
Search for the policy name in the results search box — if it does not appear at all, the user has no active assignment for it (either excluded or simply not targeted).

---

## Related Pages

- [User App Assignments](./user-assignments-apps.md)
- [User Assignments Overview](./user-assignments.md)
- [Group Assignments](./group-assignments.md)
- [All Assignments](./all-assignments.md)
- [Filter Assignments](./filter-assignments.md)

