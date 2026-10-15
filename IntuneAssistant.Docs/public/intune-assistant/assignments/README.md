---
description: View all resources and their assignments in one overview
---

# Assignments

## Overview

The **Assignments** section of Intune Assistant gives you a powerful, unified workspace to understand, explore, and audit how Intune policies, configurations, and applications are distributed across your organization. Whether you are managing a small fleet or thousands of devices across multiple countries, assignments are at the heart of every deployment decision — and keeping them under control is critical.

Microsoft Intune natively scatters assignment information across many different blades and resource types. Intune Assistant brings it all together in one place, with smart filtering, group-aware lookups, and user-centric views that are simply not available out of the box.

## Why Assignments Matter

Every Intune object — a compliance policy, a configuration profile, an application, a script — only has effect when it is **assigned** to a target. Targets can be:

* **Entra ID groups** (included or excluded)
* **All Users** (every licensed user in the tenant)
* **All Devices** (every enrolled device in the tenant)



Without proper visibility, administrators face common challenges such as:

* Not knowing which policies apply to a specific user or device
* Accidentally overlapping or conflicting assignments
* Applications targeted at the wrong group
* No easy way to audit who has access to what

Intune Assistant solves these challenges by providing dedicated, purpose-built views for each assignment scenario.

## Available Assignment Views

The Assignments section is divided into the following pages, each focused on a specific perspective:

### [All Assignments](./#all-assignments)

A comprehensive overview of **every resource and assignment** in your tenant across applications, compliance policies, configuration profiles, and more. Use this view to get the full picture at a glance, apply cross-type filters, and export reports. It also shows the non-assigned resources.

**Best for:** Tenant-wide audits, compliance reporting, and general inventory checks.

### [App Assignments](./#app-assignments)

A dedicated view focused entirely on **application deployments**. Track which apps are assigned where, filter by install type (Required, Available, Uninstall), and understand how apps flow across your organization.

**Best for:** Application lifecycle management, deployment tracking, and license/install audits.

### [Group Assignments](./#group-assignments)

Select any **Entra ID group** and instantly see all Intune objects (policies, configurations, apps) assigned to that group. Includes group membership insights and highlights both included and excluded assignments.

**Best for:** Group-level audits, change management validation, and troubleshooting over-assignment or under-assignment for a specific group.

### [Filter Assignments](./#filter-assignments)

Explore how **assignment filters** are used across your tenant. Assignment filters in Intune allow you to refine which devices within a group a policy applies to. This view shows which filters exist, how they are configured, and where they are applied.

**Best for:** Filter governance, ensuring filters are correctly scoped, and auditing filter usage.

### [User Assignments](/broken/pages/a6e1e845e8545c2342ad3779d459c008e4d39291)

Search for a specific **user** and see all Intune assignments (configuration profiles, compliance policies, and more) that apply to them — both through (nested) group memberships. This view resolves group nesting and includes "All Users" targeting.

**Best for:** End-user troubleshooting, helpdesk investigations, and proving policy application per user.

### [User App Assignments](./#user-app-assignments)

A focused sub-view of user assignments dedicated to **applications**. Enter a username and immediately see all apps assigned to that user via any targeting method (group membership, All Users).

**Best for:** App entitlement verification, access reviews, and user-specific app troubleshooting.

### [User Config Assignments](user-assignments/user-assignments-for-configuration-profiles.md)

A focused sub-view of user assignments dedicated to configuration profiles. Enter a username and immediately see all policies assigned to that user via any targeting method (group membership, All Users).

**Best for:** Policy verification, access reviews, and user-specific app troubleshooting.

## Common Features Across All Assignment Views

All assignment pages in Intune Assistant share a consistent set of capabilities:

| Feature               | Description                                                              |
| --------------------- | ------------------------------------------------------------------------ |
| **Shared data**       | Configuration assignments come from the tenant overview collected at sign-in (see the **Tenant Overview** page); group memberships and app assignments are read live. Press **Refresh data** on the overview page to collect everything again |
| **Column filtering**  | Filter results by any displayed column directly in the table             |
| **Global search**     | Full-text search across all visible rows                                 |
| **Export**            | Export any table to CSV for offline analysis or reporting                |
| **Pagination**        | Handle large datasets without performance degradation                    |
| **Dark / Light mode** | Consistent UI theme inherited from global settings                       |
| **Tenant-aware**      | All views automatically scope to your currently selected tenant          |

## Getting Started

1. Navigate to **Assistant → Assignments** from the sidebar.
2. Choose the view that matches your current task (overview, app, group, user, etc.).
3. Use the search or filter controls to narrow down results.
4. Export the data if you need to share findings or create a report.

{% hint style="info" %}
**Tip:** If you are troubleshooting why a user is or is not receiving a policy, start with the **User Assignments** view and search for the user directly.
{% endhint %}

{% hint style="info" %}
**Tip:** For a broad tenant-wide audit, start with **All Assignments** and use the export function to get a full snapshot.
{% endhint %}

## Related Sections

* [Conditional Access](/broken/pages/89ff936de3c3268e12844cda622a391657bac0d4)
* [Configuration Policies](/broken/pages/e86fd38ca037a3f807da7172f0eadb3d4fbe4789)
* [Devices Overview](/broken/pages/8f58eca6123f0202a13e7abcf87dcee03d1c3cc5)
