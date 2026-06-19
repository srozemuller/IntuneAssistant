# Welcome to Intune Assistant Documentation

## What Is Intune Assistant?

**Intune Assistant** is a community platform built for Microsoft Intune administrators. It gives you visibility, insight, and control over your Intune environment that simply does not exist in the native Microsoft Endpoint Manager portal. Everything is designed to answer the questions you actually ask in your day-to-day work — faster and with less clicking.

At its core, Intune Assistant is **free for all Intune administrators**. The community features have no limitations and no expiry date. Optional licensed extensions are available for organisations that need automation, scheduled deployments, advanced reporting, or human support.

---

## Who Is This Documentation For?

This documentation is written to be understood by everyone who works with or around Microsoft Intune, regardless of how technical their role is:

| Role | How You Will Use Intune Assistant |
|---|---|
| **IT Administrator** | Day-to-day operations — checking assignments, troubleshooting user issues, auditing policies |
| **Infrastructure Architect** | Designing and validating the structure of your Intune environment |
| **Security Engineer** | Auditing configuration settings, detecting conflicts, reviewing Conditional Access |
| **CISO / Compliance Officer** | Evidence of policy coverage, exportable reports, assignment and configuration audits |
| **Helpdesk / Service Desk** | Looking up what applies to a specific user or device without needing Intune portal access |

---

## What Can Intune Assistant Do?

Intune Assistant is organised into several sections. Here is a quick overview of what is available and documented.

---

### 📋 Assignments

> **Path in the app:** Assistant → Assignments

The Assignments section is the most widely used part of Intune Assistant. It lets you answer the question _"what is assigned to whom, and how?"_ across your entire tenant — for policies, configurations, and applications.

| Page | What It Does |
|---|---|
| [All Assignments](./assistant/assignments/all-assignments.md) | Tenant-wide view of every assignment across every resource type |
| [App Assignments](./assistant/assignments/app-assignments.md) | Application-only view with install type (Required / Available / Uninstall) |
| [Group Assignments](./assistant/assignments/group-assignments.md) | Pick a group and see everything assigned to it, including nested group resolution |
| [Filter Assignments](./assistant/assignments/filter-assignments.md) | Explore how assignment filters are used and where each filter is applied |
| [User Assignments](./assistant/assignments/user-assignments.md) | Landing page for user-centric assignment lookup |
| [User Configuration Assignments](./assistant/assignments/user-assignments-configuration.md) | All configuration policies that reach a specific user through any group |
| [User App Assignments](./assistant/assignments/user-assignments-apps.md) | All applications assigned to a specific user through any targeting method |

---

### ⚙️ Configuration

> **Path in the app:** Configuration

The Configuration section gives you complete visibility into your Intune configuration policies — at both the policy level and the individual setting level. It spans all three policy engines in Intune: the modern Settings Catalog, legacy Device Configuration profiles, and Group Policy ingested via ADMX.

| Page | What It Does |
|---|---|
| [Configuration Overview](./configuration/README.md) | Landing page explaining the two views and how they work together |
| [Policy Overview](./configuration/policies.md) | Full inventory of every configuration policy — type, platform, assignment status, settings count, timestamps. Supports bulk export and bulk delete |
| [Settings Overview](./configuration/settings.md) | Setting-by-setting breakdown across all policy types. Automatically detects and flags duplicate and conflicting settings across overlapping assignments |

---

### 🔐 Conditional Access _(coming soon in docs)_

> **Path in the app:** Conditional Access

Review and analyse Conditional Access policies across your tenant. Understand which users and conditions each policy targets, and export the full policy set for audit or documentation purposes.

---

### 🖥️ Devices _(coming soon in docs)_

> **Path in the app:** Devices

Monitor device compliance status, enrolled device inventory, and configuration state across all platforms (Windows, iOS, Android, macOS).

---

### 📜 Scripts

> **Path in the app:** Scripts → Health Scripts

Intune Remediation Scripts (also called health scripts or proactive remediations) run PowerShell on managed Windows devices to detect and fix configuration issues. When the detection script outputs valid JSON, Intune Assistant captures that data and presents it as a fully filterable, exportable report with dynamic columns — turning your scripts into a lightweight device inventory system.

| Page | What It Does |
|---|---|
| [Health Scripts Report](./scripts/health-scripts.md) | List all remediation scripts and open a per-script device run-state report with auto-generated JSON output columns |

---

### 🔄 Compare _(coming soon in docs)_

> **Path in the app:** Compare

Side-by-side policy comparison between tenants or between policy versions — useful for validating migrations, comparing environments, and identifying drift.

---

### 📊 Monitor _(coming soon in docs)_

> **Path in the app:** Monitor

Real-time monitoring of policy deployments, compliance trends, and device state changes across your organisation.

---

### 📅 Deployment / Assignment Manager _(licensed extension)_

> **Path in the app:** Deployment

Automate and schedule assignment deployments with phased rollouts, automatic rollback, and approval workflows. This is a licensed extension — see the [Plans](https://intuneassistant.cloud/plans) page for details.

---

## How Intune Assistant Works

Intune Assistant connects to your Microsoft Intune tenant using **Microsoft Graph API** with delegated permissions through your own Azure AD / Entra ID account. It does not store your data — every page fetches live data from Microsoft Graph at the time you request it.

Authentication follows the standard Microsoft MSAL (Microsoft Authentication Library) flow:

1. You sign in with your Microsoft 365 work account
2. Intune Assistant requests only the Graph permissions it needs for the features you use
3. All data is fetched in real time and displayed in your browser session
4. Nothing is persisted on Intune Assistant servers

> **Multi-tenant:** If you manage multiple tenants (for example as an MSP or GDAP partner), you can switch between tenants using the tenant selector in the interface. All views automatically scope to the selected tenant.

---

## Key Concepts

Understanding a few core concepts will help you get more out of the documentation.

### Assignment Targets

Intune assigns policies and apps to **targets**. A target can be:
- **Entra ID Group** — a specific Azure AD group (included or excluded)
- **All Users** — every licensed user in the tenant
- **All Devices** — every enrolled device in the tenant

### Assignment Filters

An **assignment filter** refines which devices within a target group are actually evaluated for a policy. Filters are based on device properties (OS version, manufacturer, ownership type, etc.) and can either **include** (only evaluate if the rule matches) or **exclude** (skip if the rule matches) specific devices.

### Nested Groups

Azure AD supports group nesting — a group can be a member of another group. Intune Assistant resolves nesting automatically. When you look up a user or group, you see assignments that arrive via parent groups too, not just direct targeting.

### Policy Sources

Intune has three engines for device configuration:

| Source | Description |
|---|---|
| **Settings Catalog** | The modern, recommended way to configure settings. Covers thousands of individual settings per platform |
| **Device Configuration** | Older profile-based configuration, including OMA-URI custom settings |
| **Group Policy** | ADMX-based settings ingested into Intune via Administrative Templates or Group Policy Analytics |

---

### 🔔 Message Center

> **Path in the app:** User menu (avatar, bottom of sidebar) → Message Center

The Message Center is where the IntuneAssistant platform communicates directly with you. It carries maintenance notices, feature announcements, warnings, and general information messages — filtered by your license so you only see what is relevant to your subscription.

| Page | What It Does |
|---|---|
| [Message Center](./message-center/README.md) | View, filter, and manage platform messages — mark individual messages or all messages as read or unread |

---

## Getting Started

If you are new to Intune Assistant, here is the recommended starting path:

1. **Sign in** at [intuneassistant.cloud](https://intuneassistant.cloud) with your Microsoft 365 work account
2. **Select your tenant** from the tenant picker if you manage multiple environments
3. Navigate to **Assistant → Assignments → All Assignments** and click **Load Data** to see your full assignment landscape
4. Navigate to **Configuration → Policy Overview** and click **Load Policies** to see your policy inventory
5. Navigate to **Configuration → Settings Overview** and click **Load Settings** to run the duplicate and conflict analysis

> 💡 **Tip — Start with the assignment overview.** The most common use case for a new user is understanding the assignment landscape. The [All Assignments](./assistant/assignments/all-assignments.md) page gives you the broadest view with the fewest clicks.

> 💡 **Tip — For troubleshooting a specific user.** Go straight to [User Configuration Assignments](./assistant/assignments/user-assignments-configuration.md) or [User App Assignments](./assistant/assignments/user-assignments-apps.md) and search for the user by name or email address.

---

## Documentation Structure

```
docs/
├── README.md                          ← You are here
│
├── assistant/
│   └── assignments/
│       ├── README.md                  ← Assignments section overview
│       ├── all-assignments.md
│       ├── app-assignments.md
│       ├── group-assignments.md
│       ├── filter-assignments.md
│       ├── user-assignments.md
│       ├── user-assignments-configuration.md
│       └── user-assignments-apps.md
│
├── configuration/
│   ├── README.md                      ← Configuration section overview
│   ├── policies.md
│   └── settings.md
│
└── monitor/
    ├── README.md                      ← Monitor section overview (baselines, drifts)
    └── configuration-drifts.md        ← Drift list, filters, Accept Drift dialog
```

More sections will be added as documentation is expanded to cover Conditional Access, Devices, Compare, and the licensed extensions.

---

## Feedback and Contributions

Found something missing or unclear in the documentation? Spotted a bug in the product?

- **Product feedback:** Use the feedback option in the app or visit [intuneassistant.cloud](https://intuneassistant.cloud)
- **Documentation:** Raise an issue or submit a pull request in the repository

---

_Intune Assistant — built by the community, for the community._

