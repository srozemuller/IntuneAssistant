# Audit Events

## What Is This Section?

The **Audit Events** section gives you a complete view of everything that happens inside your Intune tenant. It helps you creating a dynamic Intune change log. Every policy change, device enrollment, app assignment, compliance action, and administrative operation performed by any user or system process is recorded by Microsoft Intune as an audit event. Intune Assistant surfaces those events in a set of purpose-built pages that go far beyond the basic list you see in the Intune portal.

This section is built for anyone who needs to understand _what happened_, _who did it_, _when it happened_, and _what exactly changed_ — whether that is a daily operational check, an incident investigation, a security audit, or evidence gathering for a compliance framework.

***

## Why Is Audit Visibility Important?

Microsoft Intune manages devices, applications, and configurations at scale. Any change to a policy, any modification of a compliance rule, any app that gets assigned or removed — all of these have a real impact on devices and users across the organisation. Without proper audit visibility:

* Changes go unnoticed until something breaks
* Security incidents are difficult to investigate because the trail is unclear
* Compliance assessments cannot be evidenced with specifics
* It is impossible to answer the basic question: "Who changed this and when?"

Intune Assistant makes audit events actionable by presenting them visually, with context, with filtering, and with the ability to trace related events around any single change.

***

## What Is Available

| Page                                                                            | What It Does                                                                                                                             |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| [Audit Dashboard](/broken/pages/430a00f3e330ef7bf6a74b33149d5dd150549d1a)       | Real-time overview with charts, stats, most active users, and a live event feed                                                          |
| [Advanced Event Search](/broken/pages/b55474ff2ca38197341948f53a30379b13ac571a) | Full-featured search with cascading filters, date presets, saved filter presets, and CSV/JSON export                                     |
| [Event Details](/broken/pages/235c984516a3ace2ebdd41bd8c0caed0775c5de7)         | Full detail view for a single event: timeline, resource impact with before/after property values, event flow diagram, and related events |

***

## How the Pages Connect

The four pages are designed to flow into each other:

1. **Start at the Dashboard** for a quick situational overview — how many events, what categories, who is most active, any failures?
2. **Go to Advanced Event Search** when you need to narrow down to specific events — filter by date, category, actor, component, or result
3. **Open Advanced Audit Search** when you want to browse events in a split view and understand the context around a specific activity
4. **Arrive at Event Details** for any individual event that needs full investigation — the complete timeline, every resource that was modified, every property that changed before and after, and links to related events

Every event row in the Dashboard and Search pages is clickable and opens the Event Details page for that event.

***

## Key Terms

Understanding these terms will help you navigate the audit event pages:

| Term               | Meaning                                                                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Activity**       | The specific operation that was performed — e.g., `Create`, `Update`, `Delete`, `Assign`                                                                   |
| **Category**       | The area of Intune the event relates to — e.g., `DeviceConfiguration`, `MobileApps`, `CompliancePolicy`, `Enrollment`                                      |
| **Actor**          | The user or service principal that performed the operation. Shows as a UPN (email address) for human actions, or `System` for automated/service operations |
| **Component**      | The Intune component or service that generated the event                                                                                                   |
| **Result**         | The outcome: **Success** (green), **Failure** (red), or **Warning** (yellow)                                                                               |
| **Resource**       | The specific object that was affected — a policy name, a device, an app — including the properties that changed                                            |
| **Related Events** | Other events within a 1-hour window that share the same actor or the same affected resources                                                               |

***

## Related Sections

* [Configuration Policies](../policies/policy-overview.md) — see what policies exist; use Audit Events to see when they were changed
* [Assignments](../assignments/all-assignments.md) — see what is assigned; use Audit Events to see when assignments were made
