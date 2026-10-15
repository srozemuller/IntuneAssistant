---
icon: hand-wave
layout:
  width: default
  title:
    visible: true
  description:
    visible: false
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: true
  metadata:
    visible: true
  tags:
    visible: true
  actions:
    visible: true
---

# Welcome

## What Is Intune Assistant?

**Intune Assistant** is a community platform built for Microsoft Intune administrators. It gives you visibility, insight, and control over your Intune environment that simply does not exist in the native Microsoft Intune portal. Everything is designed to answer the questions you actually ask in your day-to-day work — faster and with less clicking.

At its core, Intune Assistant is **free for all Intune administrators**. The community features have no limitations and no expiry date.

## Who Is This Documentation For?

This documentation is written to be understood by everyone who works with or around Microsoft Intune, regardless of how technical their role is:

| Role                          | How You Will Use Intune Assistant                                                            |
| ----------------------------- | -------------------------------------------------------------------------------------------- |
| **IT Administrator**          | Day-to-day operations — checking assignments, troubleshooting user issues, auditing policies |
| **Infrastructure Architect**  | Designing and validating the structure of your Intune environment                            |
| **Security Engineer**         | Auditing configuration settings, detecting conflicts, reviewing Conditional Access           |
| **CISO / Compliance Officer** | Evidence of policy coverage, exportable reports, assignment and configuration audits         |
| **Helpdesk / Service Desk**   | Looking up what applies to a specific user or device without needing Intune portal access    |

## What Can Intune Assistant Do?

Intune Assistant is organized into several sections. Here is a quick overview of what is available and documented.

### Jump right in

<table data-view="cards"><thead><tr><th></th><th></th><th></th><th data-hidden data-card-cover data-type="files"></th><th data-hidden></th><th data-hidden data-card-target data-type="content-ref"></th></tr></thead><tbody><tr><td><h4><i class="fa-rocket">:rocket:</i></h4></td><td><strong>Quickstart</strong></td><td>Get started with Intune Assistant</td><td></td><td></td><td><a href="getting-started/quickstart.md">quickstart.md</a></td></tr><tr><td></td><td><strong>Security overview</strong></td><td>Get security information about Intune Assistant</td><td></td><td></td><td><a href="security-and-compliance/data-and-privacy.md">Security &#x26; Compliance</a></td></tr></tbody></table>

### Assignments

The Assignments section is the most widely used part of Intune Assistant. It lets you answer the question _"what is assigned to whom, and how?"_ across your entire tenant — for policies, configurations, and applications.

Start getting insights using one of the features below.

| Page                                                                           | What It Does                                                                      |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| [All Assignments](intune-assistant/assignments/all-assignments.md)             | Tenant-wide view of every assignment across every resource type                   |
| [App Assignments](intune-assistant/assignments/app-assignments.md)             | Application-only view with install type (Required / Available / Uninstall)        |
| [Group Assignments](intune-assistant/assignments/group-assignments.md)         | Pick a group and see everything assigned to it, including nested group resolution |
| [Filter Assignments](intune-assistant/assignments/assignments-with-filters.md) | Explore how assignment filters are used and where each filter is applied          |
| [User Assignments](intune-assistant/assignments/user-assignments/)             | Landing page for user-centric assignment lookup                                   |

### Configuration

The Configuration section gives you complete visibility into your Intune configuration policies — at both the policy level and the individual setting level. It spans all three policy engines in Intune: the modern Settings Catalog, legacy Device Configuration profiles, and Group Policy ingested via ADMX.

| Page                                                                             | What It Does                                                                                                                                            |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Configuration Overview](intune-assistant/policies/README.md) | Landing page explaining the two views and how they work together                                                                                        |
| [Settings Overview](intune-assistant/policies/policy-settings-overview.md)      | Setting-by-setting breakdown across all policy types. Automatically detects and flags duplicate and conflicting settings across overlapping assignments |

### Conditional Access _(coming soon in docs)_

Review and analyse Conditional Access policies across your tenant. Understand which users and conditions each policy targets, and export the full policy set for audit or documentation purposes.

### Devices _(coming soon in docs)_

Monitor device compliance status, enrolled device inventory, and configuration state across all platforms (Windows, iOS, Android, macOS).

### Compare _(coming soon in docs)_

Side-by-side policy comparison between tenants or between policy versions — useful for validating migrations, comparing environments, and identifying drift.



## How Intune Assistant Works

Intune Assistant connects to your Microsoft Intune tenant using **Microsoft Graph API** with delegated permissions through your own Azure AD / Entra ID account. It does not store your data — every page fetches live data from Microsoft Graph at the time you request it.

Authentication follows the standard Microsoft MSAL (Microsoft Authentication Library) flow:

1. You sign in with your Microsoft 365 work account
2. Intune Assistant requests only the Graph permissions it needs for the features you use
3. All data is fetched in real time and displayed in your browser session
4. Nothing is persisted on Intune Assistant servers

{% hint style="info" %}
**Multi-tenant:** If you manage multiple tenants you can switch between tenants using the tenant selector in the interface. All views automatically scope to the selected tenant.
{% endhint %}

## Key Concepts

Understanding a few core concepts will help you get more out of the documentation.

### Assignment Targets

Intune assigns policies and apps to **targets**. A target can be:

* **Entra ID Group** — a specific Entra AD group (included or excluded)
* **All Users** — every licensed user in the tenant
* **All Devices** — every enrolled device in the tenant

### Assignment Filters

An **assignment filter** refines which devices within a target group are actually evaluated for a policy. Filters are based on device properties (OS version, manufacturer, ownership type, etc.) and can either **include** (only evaluate if the rule matches) or **exclude** (skip if the rule matches) specific devices.

### Nested Groups

Azure AD supports group nesting — a group can be a member of another group. Intune Assistant resolves nesting automatically. When you look up a user or group, you see assignments that arrive via parent groups too, not just direct targeting.

### Policy Sources

Intune has three engines for device configuration:

| Source                   | Description                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| **Settings Catalog**     | The modern, recommended way to configure settings. Covers thousands of individual settings per platform |
| **Device Configuration** | Older profile-based configuration, including OMA-URI custom settings                                    |
| **Group Policy**         | ADMX-based settings ingested into Intune via Administrative Templates or Group Policy Analytics         |

## Getting Started

If you are new to Intune Assistant, here is the recommended starting path:

1. **Onboard your tenant** (first time only) by following the [Quickstart](getting-started/quickstart.md): open the [onboarding page](https://community.intuneassistant.cloud/onboarding/register/), sign in, create your account and grant admin consent for your tenant
2. **Sign in** at [community.intuneassistant.cloud](https://community.intuneassistant.cloud/) with your Microsoft 365 work account
3. **Select your tenant** from the tenant picker if you manage multiple environments
4. Navigate to **Assistant → Assignments → All Assignments** and click **Load Data** to see your full assignment landscape
5. Navigate to **Configuration → Policy Overview** and click **Load Policies** to see your policy inventory
6. Navigate to **Configuration → Settings Overview** and click **Load Settings** to run the duplicate and conflict analysis

{% hint style="info" %}
**Tip — Start with the assignment overview.** The most common use case for a new user is understanding the assignment landscape. The [All Assignments](intune-assistant/assignments/all-assignments.md) page gives you the broadest view with the fewest clicks.
{% endhint %}

{% hint style="info" %}
**Tip — For troubleshooting a specific user.** Go straight to [User Configuration Assignments](intune-assistant/assignments/user-assignments/user-assignments-for-configuration-profiles.md) or [User App Assignments](intune-assistant/assignments/user-assignments/user-assignments-for-apps.md) and search for the user by name or email address.
{% endhint %}

## Feedback and Contributions

Found something missing or unclear in the documentation? Spotted a bug in the product?

* **Product feedback:** Use the feedback option in the app or visit [community.intuneassistant.cloud](https://community.intuneassistant.cloud/)
* **Documentation:** Raise an issue or submit a pull request in the repository

_Intune Assistant — built by the community, for the community._
