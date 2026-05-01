# Assignments

## Overview

The **Assignments** section of Intune Assistant gives you a powerful, unified workspace to understand, explore, and audit how Intune policies, configurations, and applications are distributed across your organization. Whether you are managing a small fleet or thousands of devices across multiple countries, assignments are at the heart of every deployment decision — and keeping them under control is critical.

Microsoft Intune natively scatters assignment information across many different blades and resource types. Intune Assistant brings it all together in one place, with smart filtering, group-aware lookups, and user-centric views that are simply not available out of the box.

---

## Why Assignments Matter

Every Intune object — a compliance policy, a configuration profile, an application, a script — only has effect when it is **assigned** to a target. Targets can be:

- **Azure AD / Entra ID groups** (included or excluded)
- **All Users** (every licensed user in the tenant)
- **All Devices** (every enrolled device in the tenant)
- **Individual users or devices** (direct assignments)

Without proper visibility, administrators face common challenges such as:

- Not knowing which policies apply to a specific user or device
- Accidentally overlapping or conflicting assignments
- Applications targeted at the wrong group
- No easy way to audit who has access to what

Intune Assistant solves these challenges by providing dedicated, purpose-built views for each assignment scenario.

---

## Available Assignment Views

The Assignments section is divided into the following pages, each focused on a specific perspective:

### 📋 [All Assignments](./all-assignments.md)
A comprehensive overview of **every assignment** in your tenant across applications, compliance policies, configuration profiles, and more. Use this view to get the full picture at a glance, apply cross-type filters, and export reports.

**Best for:** Tenant-wide audits, compliance reporting, and general inventory checks.

---

### 📱 [App Assignments](./app-assignments.md)
A dedicated view focused entirely on **application deployments**. Track which apps are assigned where, filter by install type (Required, Available, Uninstall), and understand how apps flow across your organization.

**Best for:** Application lifecycle management, deployment tracking, and license/install audits.

---

### 👥 [Group Assignments](./group-assignments.md)
Select any **Azure AD / Entra ID group** and instantly see all Intune objects (policies, configurations, apps) assigned to that group. Includes group membership insights and highlights both included and excluded assignments.

**Best for:** Group-level audits, change management validation, and troubleshooting over-assignment or under-assignment for a specific group.

---

### 🔍 [Filter Assignments](./filter-assignments.md)
Explore how **assignment filters** are used across your tenant. Assignment filters in Intune allow you to refine which devices within a group a policy applies to. This view shows which filters exist, how they are configured, and where they are applied.

**Best for:** Filter governance, ensuring filters are correctly scoped, and auditing filter usage.

---

### 👤 [User Assignments](./user-assignments.md)
Search for a specific **user** and see all Intune assignments (configuration profiles, compliance policies, and more) that apply to them — both through group memberships and direct assignments. This view resolves group nesting and includes "All Users" targeting.

**Best for:** End-user troubleshooting, helpdesk investigations, and proving policy application per user.

---

### 📲 [User App Assignments](./user-app-assignments.md)
A focused sub-view of user assignments dedicated to **applications**. Enter a username and immediately see all apps assigned to that user via any targeting method (group membership, All Users, direct).

**Best for:** App entitlement verification, access reviews, and user-specific app troubleshooting.

---

## Common Features Across All Assignment Views

All assignment pages in Intune Assistant share a consistent set of capabilities:

| Feature | Description |
|---|---|
| **Live data** | Data is fetched in real time from your Intune tenant via Microsoft Graph |
| **Column filtering** | Filter results by any displayed column directly in the table |
| **Global search** | Full-text search across all visible rows |
| **Export** | Export any table to CSV for offline analysis or reporting |
| **Pagination** | Handle large datasets without performance degradation |
| **Dark / Light mode** | Consistent UI theme inherited from global settings |
| **Tenant-aware** | All views automatically scope to your currently selected tenant |

---

## Getting Started

1. Navigate to **Assistant → Assignments** from the sidebar.
2. Choose the view that matches your current task (overview, app, group, user, etc.).
3. Use the search or filter controls to narrow down results.
4. Export the data if you need to share findings or create a report.

> 💡 **Tip:** If you are troubleshooting why a user is or is not receiving a policy, start with the **User Assignments** view and search for the user directly.

> 💡 **Tip:** For a broad tenant-wide audit, start with **All Assignments** and use the export function to get a full snapshot.

---

## Related Sections

- [Conditional Access](../conditional-access/README.md)
- [Configuration Policies](../configuration/README.md)
- [Devices Overview](../devices/README.md)

