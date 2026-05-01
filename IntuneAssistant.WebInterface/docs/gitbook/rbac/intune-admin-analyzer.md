# Intune Admin Analyzer

## What Is This Page?

The **Intune Admin Analyzer** examines every member of the **Intune Administrator** role in your tenant and cross-references their role membership against the Intune audit log for a chosen time period. The result is a ranked, sortable table showing each administrator's actual activity — how many read, write, and delete operations they performed — and a clear flag on anyone who has the role but has not been using it, or has only been doing low-risk read operations.

The goal is to answer a question that is surprisingly hard to answer any other way: **does everyone who has Intune Administrator access actually need it?**

---

## Why Does This Matter?

The Intune Administrator role is one of the most powerful roles in Microsoft 365. Members can create, modify, and delete configuration policies, compliance rules, app assignments, and device management settings across the entire organisation. Assigning this role is easy; reviewing whether it is still justified is often overlooked.

Over time, tenants accumulate administrators who:
- Were granted the role temporarily for a project and never had it removed
- Changed job roles and no longer perform administrative tasks
- Only ever read data but hold a role that grants full write and delete access
- Are members through a group they did not know includes Intune Administrator

The analyzer surfaces all of these cases in one report, giving you the evidence to take action — whether that is removing access, downgrading to a read-only role, or confirming that the current assignment is correct.

This is directly relevant to:
- **Zero Trust** and least-privilege principles
- **ISO 27001 / SOC 2 / NIS2** access review requirements
- **Identity governance** and periodic access reviews
- **Insider threat** risk reduction

---

## How to Run the Analysis

1. Navigate to **RBAC → Intune Admin Analyzer**
2. Set the **Days to Analyze** value (1–90, default 60)
3. Click **Run Analysis**
4. Wait for the results to load

> 📸 _[Screenshot placeholder: Analysis Configuration card showing the Days to Analyze number input set to 60, with a Run Analysis button to the right]_

---

## The Analysis Period

The **Days to Analyze** field controls how far back into the Intune audit log the tool looks when measuring each user's activity.

- **Minimum:** 1 day
- **Maximum:** 90 days (enforced by both the UI and the API, as Intune audit logs retain 90 days of history)
- **Default:** 60 days

The analysis start and end dates derived from your chosen period are shown in the **Intune Event Analysis Period** summary card after results load (e.g., `Feb 26 - Apr 27, 2026`).

> 💡 **Choose your period carefully.** A short period (e.g., 7 days) may flag users as inactive who simply had no tasks that week. A 60–90 day window gives a more reliable picture of genuine inactivity.

---

## What the Analysis Does

When you click **Run Analysis**, the tool performs the following steps in sequence:

1. **Finds all members of the Intune Administrator role** — including direct members, users in an assigned group, and users in nested groups within that group
2. **Queries the Intune audit log** for the specified number of days
3. **Matches each audit event** to a role member by user identity
4. **Categorises each user's actions** into read, write, and delete operations
5. **Flags over-privileged users** — those with no activity at all, or activity that does not justify the level of access the role provides
6. Returns a complete analysis response with counts, dates, and per-user detail

---

## Summary Cards

After the analysis completes, four summary cards are shown:

| Card | Icon | What It Shows |
|---|---|---|
| **Role Analyzed** | 🛡 Shield | The name of the role that was analyzed (`Intune Administrator`) and the first 8 characters of its role ID |
| **Total Users** | 👥 Users | The total number of role members found and analyzed |
| **Over-Privileged Users** | ⚠ Warning | The count of users flagged as over-privileged. Shows `All users active` if the count is zero, or `Require review` if any are flagged |
| **Intune Event Analysis Period** | 📅 Calendar | The number of days analyzed and the exact date range (e.g., `Feb 26 - Apr 27, 2026`) |

> 📸 _[Screenshot placeholder: Four summary cards in a row showing Role Analyzed (Intune Administrator), Total Users (14), Over-Privileged Users (3 — Require review), and Analysis Period (60 days, Feb 26 – Apr 27)]_

---

## The User Analysis Table

The main table lists every role member with their activity breakdown. It supports sorting on most columns and free-text search across user names and UPNs.

### Columns

| Column | What It Shows |
|---|---|
| **Status** | A yellow ⚠ triangle if the user is flagged as over-privileged, or a green ✓ checkmark if their activity justifies the role |
| **User** | Display name in bold, UPN in smaller text below |
| **Membership** | How the user holds the role — see Membership Types below |
| **Activity Level** | A derived label based on the most impactful action type the user performed — see Activity Levels below |
| **Total Actions** | The total count of all audit events attributed to this user in the analysis period, shown in monospace |
| **Read** | Count of read-type operations, in green |
| **Write** | Count of write-type operations, in yellow |
| **Delete** | Count of delete-type operations, in red |
| **Details** | An info icon button — clicking it opens the User Detail Panel for that user (same as clicking the row) |

Over-privileged rows are highlighted with a subtle yellow background tint.

> 📸 _[Screenshot placeholder: User Analysis table showing several rows. One row has a yellow triangle Status icon and yellow background tint, another has a green checkmark. The Membership column shows blue "Direct" and purple "Group" badges. Read/Write/Delete columns show coloured monospace numbers]_

---

### Membership Types

The **Membership** column shows how each user is a member of the Intune Administrator role:

| Badge | Colour | Meaning |
|---|---|---|
| **Direct** | 🔵 Blue | The user is directly assigned the Intune Administrator role |
| **Group** | 🟣 Purple | The user is a member of a group that has been assigned the role |
| **Nested** | 🟦 Indigo | The user reaches the role through a nested group (a group inside another group that has the role) |

For Group and Nested memberships, the name of the source group is shown in small muted text below the badge — e.g., `via Intune-Admins-EU`.

Understanding membership type matters for remediation: removing a direct assignment is straightforward; removing a user from a role-bearing group affects everyone in that group.

---

### Activity Levels

The **Activity Level** column shows a single label derived from the user's most impactful action type during the analysis period:

| Level | Colour | When It Applies |
|---|---|---|
| **High** | 🔴 Red | The user performed at least one **delete** operation |
| **Medium** | 🟡 Yellow | The user performed at least one **write** operation (but no deletes) |
| **Low** | 🟢 Green | The user performed at least one **read** operation (but no writes or deletes) |
| **None** | ⚫ Grey | The user performed **zero** audit-tracked actions in the analysis period |

> ⚠️ **Users with activity level None are the clearest over-privilege candidates.** They hold a powerful role but have generated no audit activity at all in the chosen time period.

---

## Sorting and Searching

- Click any column header to sort ascending; click again to sort descending
- The **Activity Level** and **Total Actions** columns sort numerically by the underlying count values (not alphabetically by label)
- The **Search** box filters by display name and UPN in real time

---

## The User Detail Panel

Clicking any row (or the Info button) opens the **User Detail Panel** below the table. This panel shows the full detail for the selected user:

### Identity

- **User Principal Name** — the full UPN in monospace
- **User ID** — the Entra ID Object ID (GUID) in monospace

### Privilege Status

A coloured panel showing the reason for the user's over-privilege classification:
- **Yellow** background if `isOverPrivileged` is true — the text inside is the `overPrivilegeReason` from the API, which explains specifically why the user was flagged (e.g., `No activity detected in the analysis period`, `Only read operations performed — full administrator access not required`)
- **Green** background if the user is not flagged, confirming their activity justifies the role

### Unique Actions Performed

A set of badge chips showing each **distinct action type** the user performed during the analysis period — for example `Create`, `Update`, `Delete`, `Assign`, `Get`. These are the actual operation names from the Intune audit log.

Only shown if the user performed at least one action.

### Unused Permissions

A set of secondary badge chips listing permissions that the Intune Administrator role grants this user but that they did not use during the analysis period. These represent the gap between what the user can do and what they actually did.

Only shown if there are unused permissions to report.

> 📸 _[Screenshot placeholder: User Detail Panel for a selected user showing UPN and User ID in monospace, a yellow privilege status panel reading "No activity detected in the analysis period", and an Unused Permissions section with several grey badge chips]_

---

## Understanding Over-Privilege

A user is flagged as **over-privileged** when their activity pattern does not match the level of access the Intune Administrator role grants. Common reasons include:

- **No activity at all** — the user has not appeared in any Intune audit event during the analysis period
- **Read-only activity** — the user only performed read operations; the Intune Administrator role includes full write and delete permissions that were never exercised
- **Minimal write activity** — the user made a very small number of write operations relative to what the role permits

The `overPrivilegeReason` field in the User Detail Panel provides the exact reason the API assigned for each flagged user.

---

## Recommended Actions After Analysis

| Finding | Recommended Action |
|---|---|
| Activity Level = **None** | Remove the role assignment or initiate an access review; the user has generated no audit activity |
| Activity Level = **Low** (read only) | Consider replacing Intune Administrator with a read-only role such as **Intune Read Only Operator** |
| Membership = **Group/Nested** | Review the group membership — removing one user may be better done by adjusting the group than the individual role |
| All clear (no over-privileged users) | Document the review result and schedule the next review cycle |

---

## Limitations

- The analysis covers only the **Intune Administrator** built-in role. Custom RBAC roles and other Intune-related roles (e.g., Helpdesk Operator, Read Only Operator) are not analyzed by this tool.
- Audit log retention is **maximum 90 days** in Microsoft Intune. Setting the analysis period beyond 90 days is not possible.
- The tool identifies over-privilege based on **audit event activity** only. Actions performed outside of Intune audit events (e.g., read operations that Intune does not log) may not be reflected.
- A user with **zero audit events** may have been performing legitimate work that simply did not generate audit log entries in some edge cases. Use the analysis as a starting point for a conversation, not as an automatic removal trigger.

---

## Related Pages

- [Audit Events Dashboard](../audit-events/dashboard.md) — explore the underlying audit events the analyzer uses
- [Advanced Event Search](../audit-events/search.md) — search for a specific user's audit events manually
- [Event Details](../audit-events/event-details.md) — inspect individual events to understand what a user changed

